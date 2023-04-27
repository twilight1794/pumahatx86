"use strict"

class PHCTError extends Error {
    msg(m, l){
        this.lnum = l;
        this.message = "En la línea "+l+": "+m;
    }
}

class SintaxisError extends PHCTError {
    constructor (lnum){
        super();
        this.msg("Error de sintaxis desconocido.", lnum);
    }
}
class NoImplementadoError extends SintaxisError {
    constructor (cmd, lnum){
        super(lnum);
        this.cmd = cmd;
        this.msg("El mnemotécnico "+cmd+" no ha sido implementado aún.", lnum);
    }
}
class SeccionError extends SintaxisError {
    constructor (id, lnum){
        super(lnum);
        this.id = id;
        this.msg("La sección \""+id+"\" no es parte de las secciones admitidas.", lnum);
    }
}
class VariableFueraDataError extends SintaxisError {
    constructor (id, lnum){
        super(lnum);
        this.id = id;
        this.msg("La variable \""+id+"\" debe ser definida en la sección .data del código.", lnum);
    }
}
class VariableFueraBSSError extends SintaxisError {
    constructor (id, lnum){
        super(lnum);
        this.id = id;
        this.msg("La variable \""+id+"\" debe ser declarada en la sección .bss del código.", lnum);
    }
}
class VariableExistenteError extends SintaxisError {
    constructor (id, lnum){
        super(lnum);
        this.id = id;
        this.msg("La variable \""+id+"\" ya fue declarada anteriormente.", lnum);
    }
}
class ExpresionInvalidaError extends SintaxisError {
    constructor (sim, lnum){
        super(lnum);
        this.sim = sim;
        this.msg("La expresión \""+id+"\" ya fue declarada anteriormente.", lnum);
    }
}

class ReferenciaError extends PHCTError {
    constructor (lnum){
        super();
        this.msg("Error de referencia desconocido.", lnum);
    }
}
class DireccionInvalidaError extends ReferenciaError {
    constructor (dir, lnum){
        super();
        this.msg("La dirección de memoria 0x"+dir.toString(16)+" no existe.", lnum);
    }
}

class TipoError extends PHCTError {
    constructor (lnum){
        super();
        this.msg("Error de tipo desconocido.", lnum);
    }
}
class TipoVariableError extends TipoError {
    constructor (id, lnum){
        super();
        this.id = id;
        this.msg("El tipo \""+id+"\" no se reconoce.", lnum);
    }
}

class MemoriaError extends PHCTError {

}

class Instruccion {
    constructor(ins, lnum, lop){
        this.lnum = lnum;
        switch (ins){
            case "add":
                // 0x00..0x05,
                // 0x80/0..0x81/0,
                // 0x82/0..0x83/0
                break;
            case "call":
                // 0x9A, 0xE8, 0xFF/2, 0xFF/3
                break;
            case "cmp":
                // 0x38...0x3D, 0x80...0x81/7, 0x82...0x83/7
                break;
            case "inc":
                // 0x40...0x47, 0xFE/0, 0xFF/0
                break;
            case "je":
                break;
            case "jg":
                break;
            case "jne":
                // 0x70...0x7F, 0x0F80...0x0F8F
                // 0xE3 (JCXZ)
                break;
            case "jmp":
                // 0xE9...0xEB, 0xFF/4, 0xFF/5
                break;
            case "lea":
                // 0x8D
                break;
            case "leave":
                // 0xC9
                break;
            case "mul":
                // 0xF7/4, 0xF6/4
                break;
            case "mov":
                // 0xA0...0xA3
                break;
            case "nop":
                // 0x90
                break;
            case "push":
                // 0x06, 0x0E, 0x16, 0x1E, 0x50...0x57, 0x68, 0x6A, 0xFF/6
                break;
            case "ret":
                // Translate to retn or retf
                // 0xC2, 0xC3 retn
                // 0xCA, 0xCB retf
                break;
            case "sub":
                // 0x28...0x2D, 0x80...0x81/5, 0x82...0x83/5
                break;
            default:
                throw new NoImplementadoError(ins, lnum);
        }
    }
}

class Valor {
    r_id = /^[A-Za-z_]+/;
    r_num = /^((0x([0-9A-Fa-f]+))|(0b[01]+)|([0-9]+)|(0[0-7]+))/;
    r_esp = /^\s+/;
    #lsim = [];
    tipo = 0; // 0= valor, 1= offset

    get(){return this.#lsim;}
    constructor(exp, lnum){
        // Tipos: 1: entero, 2: id, 3: operador; 4: dir, 5: reg, 6: eti
        var cexp = exp;
        /* Análisis léxico */
        while (cexp.length > 0){
            if (this.r_id.test(cexp[0])){
                // Una variable o registro
                let id = cexp.match(this.r_id)[0];
                this.#lsim.push({"tipo": 2, "valor": id});
                cexp = cexp.substring(id.length);
            } else if (/[0-9]/.test(cexp[0])){
                // Un entero en base 2, 8, 10 o 16
                let num = cexp.match(this.r_num)[0];
                let val;
                if (num.startsWith("0x")) {
                    val = parseInt(num, 16);
                    cexp = cexp.substring(num.length);
                } else if (num.startsWith("0b")) {
                    val = parseInt(num.substring(2), 2);
                    cexp = cexp.substring(2 + num.length);
                } else if (num[0] == "0") {
                    val = parseInt(num, 8);
                    cexp = cexp.substring(num.length);
                } else {
                    val = parseInt(num);
                    cexp = cexp.substring(num.length);
                }
                if (val != NaN) this.#lsim.push({"tipo": 1, "valor": val});
                else throw new SintaxisError(lnum);
            } else if ((/^[,\+\-\*\[\]\(\)]/).test(cexp[0])){
                // Un operador
                this.#lsim.push({"tipo": 3, "valor": cexp[0]});
                cexp = cexp.substring(1);
            } else if (this.r_esp.test(cexp[0])){
                // Un espacio en blanco
                let esp = cexp.match(this.r_esp)[0];
                cexp = cexp.substring(esp.length);
                continue;
            } else {
                throw new SintaxisError(lnum);
            }
        }

        /* Análisis sintáctico */
        var dentro = false;
        var ultimo = undefined;
        for (let i = 0; i<this.#lsim.length; i++){
            if (this.#lsim[i].tipo == 3 && this.#lsim[i].valor == "["){
            // Modo dirección de memoria

            } else if (this.#lsim[i].tipo == 2) {
            // Modo id

            }
        }
    }
}

class Plataforma {
    leerMemoria(dir, tam, lnum){
        var m = pumahat.g.rmem;
        if (dir < m.children.length && dir+tam <= m.children.length){
            var d = [];
            for (let i = 0; i<tam; i++){
                d.push(m.children[dir+i]);
            }
            return d;
        } else {
            throw new DireccionInvalidaError(dir, lnum);
        }
    }
    //escribirMemoria(dir, val, lnum){
    //}

    /* FIX: Estoy seguro de que este switch se puede simplificar */
    leerRegistro(reg, f){ // f: 1=cadena, 0=array
        var c;
        switch (reg){
            case "IP":
                c = document.getElementById("v-ip").textContent;
            case "EIP":
                c = document.getElementById("v-eip").textContent+document.getElementById("v-ip").textContent;
            case "AH":
                c = document.getElementById("v-ah").textContent;
            case "AL":
                c = document.getElementById("v-al").textContent;
            case "AX":
                c = document.getElementById("v-ah").textContent+document.getElementById("v-al").textContent;
            case "EAX":
                c = document.getElementById("v-eah").textContent+document.getElementById("v-eal").textContent+document.getElementById("v-ah").textContent+document.getElementById("v-al").textContent;
            case "CH":
                c = document.getElementById("v-ch").textContent;
            case "CL":
                c = document.getElementById("v-cl").textContent;
            case "CX":
                c = document.getElementById("v-ch").textContent+document.getElementById("v-cl").textContent;
            case "ECX":
                c = document.getElementById("v-ech").textContent+document.getElementById("v-ecl").textContent+document.getElementById("v-ch").textContent+document.getElementById("v-cl").textContent;
            case "DH":
                c = document.getElementById("v-dh").textContent;
            case "DL":
                c = document.getElementById("v-dl").textContent;
            case "DX":
                c = document.getElementById("v-dh").textContent+document.getElementById("v-dl").textContent;
            case "EDX":
                c = document.getElementById("v-edh").textContent+document.getElementById("v-edl").textContent+document.getElementById("v-dh").textContent+document.getElementById("v-dl").textContent;
            case "BH":
                c = document.getElementById("v-bh").textContent;
            case "BL":
                c = document.getElementById("v-bl").textContent;
            case "BX":
                c = document.getElementById("v-bh").textContent+document.getElementById("v-bl").textContent;
            case "EBX":
                c = document.getElementById("v-ebh").textContent+document.getElementById("v-ebl").textContent+document.getElementById("v-bh").textContent+document.getElementById("v-bl").textContent;
            case "SP":
                c = document.getElementById("v-sp").textContent;
            case "ESP":
                c = document.getElementById("v-esp").textContent+document.getElementById("v-sp").textContent;
            case "BP":
                c = document.getElementById("v-bp").textContent;
            case "EBP":
                c = document.getElementById("v-ebp").textContent+document.getElementById("v-bp").textContent;
            case "DI":
                c = document.getElementById("v-di").textContent;
            case "EDI":
                c = document.getElementById("v-edi").textContent+document.getElementById("v-di").textContent;
            case "SI":
                c = document.getElementById("v-si").textContent;
            case "ESI":
                c = document.getElementById("v-esi").textContent+document.getElementById("v-si").textContent;
            case "CS":
                c = document.getElementById("v-cs").textContent;
            case "DS":
                c = document.getElementById("v-ds").textContent;
            case "ES":
                c = document.getElementById("v-es").textContent;
            case "FS":
                c = document.getElementById("v-fs").textContent;
            case "GS":
                c = document.getElementById("v-gs").textContent;
            case "SS":
                c = document.getElementById("v-ss").textContent;
        }
        if (f == 0){
            c = c.match(/.{2}/g).map((v) => {
                return parseInt(v, 16);
            });
        }
        return c;
    }
    //escribirRegistro(reg, val, lnum){
    //}
}

class Programa {
    /* Expresiones regulares */
    r_sec = /^section\s+\.([A-Za-z]+)$/
    r_var = /^([A-Za-z_]+)\s*:\s*([A-Za-z]+)\s+([A-Za-z0-9\s_\.,']+)$/
    r_eti = /^([A-Za-z_]+):\s*$/
    r_ins = /^([A-Za-z]+)\s*(\s+(.+))?$/

    seccion = 0;
    #indice = 0;
    #ast = [];

    get(){return this.#ast;}
    #getVariable(n){
        Array.from(pumahat.g.lvars.getElementsByTagName("dt")).forEach((el) => {
            if (el.textContent == n) return new Valor(el.nextElementSibling.textContent);
        });
    };
    #setVariable(n, t, v){
        Array.from(pumahat.g.lvars.getElementsByTagName("dt")).forEach((el) => {
            if (el.textContent == n) throw new VariableExistenteError(n);
        });
        console.warn(t);
        var div = document.createElement("div");
        switch (t){
            // DQ, DT, DDQ y DO no están implementados por ahora
            // Lo mismo con RESQ, REST, RESDQ y RESO
            case "db":
                div.dataset.tipo = "Byte";
                break;
            case "dw":
                div.dataset.tipo = "Palabra";
                break;
            case "dd":
                div.dataset.tipo = "Palabra doble";
                break;
            case "resb":
                div.dataset.tipo = "Byte (BSS)";
                break;
            case "resw":
                div.dataset.tipo = "Palabra (BSS)";
                break;
            case "resd":
                div.dataset.tipo = "Palabra doble (BSS)";
                break;
            case "eti":
                div.dataset.tipo = "Etiqueta";
                break;
            case "sec":
                div.dataset.tipo = "Sección";
                break;
            default:
                throw new TipoVariableError(t);
        }
        var dt = document.createElement("dt");
        dt.textContent = n;
        var dd = document.createElement("dd");
        dd.textContent = v.toString();
        div.append(dt, dd);
        pumahat.g.lvars.appendChild(div);
    }

    // Procesa una línea de ensamblador, la ejecuta, y modifica la interfaz en consecuencia
    procesar(l, ls, idx){
        document.getElementById("numInst").textContent = idx.toString();
        document.getElementById("instAct").textContent = pumahat.cmi.getLine(l.lnum);
        document.getElementById("instProx").textContent = (ls)?pumahat.cmi.getLine(ls.lnum):"—";
    }

    // Realiza el análisis léxico y sintáctico de una línea de ensamblador
    analizar(l, lnum){
        console.log(lnum);
        var el = l.trim();
        // Línea vacía
        if (!el.length) { return; }
        // Sección de código
        if (this.r_sec.test(el)) {
            var res = this.r_sec.exec(el)[1].toLowerCase();
            switch (res){
                case "data":
                    this.seccion = 1;
                    break;
                case "bss":
                    this.seccion = 2;
                    break;
                case "text":
                    this.seccion = 3;
                    break;
                case "stack":
                    this.seccion = 4;
                    break;
                default:
                    throw new SeccionError(res, lnum);
            }
            this.#setVariable("."+res, "sec", "0");
            return;
        }
        // Variable
        if (this.r_var.test(el)){
            var res = this.r_var.exec(el);
            var exp = new Valor(res[3], lnum);
            this.#setVariable(res[1], res[2].toLowerCase(), exp);
            return;
        }
        // Etiqueta
        if (this.r_eti.test(el)){
            var res = this.r_eti.exec(el)[1].toLowerCase();
            var dir = "x";
            this.#setVariable(res, "eti", dir);
            return;
        }
        // Instrucción
        if (this.r_ins.test(el)){
            var res = this.r_ins.exec(el);
            console.log(res);
            var exp = (res[3])?(new Valor(res[3], lnum)):undefined;
            var ins = new Instruccion(res[1].toLowerCase(), lnum, exp);
            this.#ast.push(ins);
            return;
        } else {
            throw new SintaxisError(lnum);
        }
    }

    // Ejecutar todas las instrucciones desde el índice
    ejecutar(){
        document.getElementById("numTot").textContent = this.#ast.length.toString();
        while (this.#indice < this.#ast.length){
            this.procesar(this.#ast[this.#indice], this.#ast[this.#indice+1], this.#indice);
            this.#indice++;
        }
    }

    // Ejecutar una sola instrucción, apuntada por indice
    avanzar(){
        document.getElementById("numTot").textContent = this.#ast.length.toString();
        this.procesar(this.#ast[this.#indice], this.#ast[this.#indice+1], this.#indice);
        this.#indice++;
    }

    // Deja la interfaz en orden
    limpiar(){
        this.#indice = 0;
        pumahat.g.rerr.parentNode.hidden = true;
        pumahat.g.rerr.textContent = "";
        pumahat.g.rmem.textContent = "";
        txtMemDispEvento();
        pumahat.g.lvars.textContent = "";
        var tds = pumahat.g.rip.getElementsByTagName("td");
        tds[0].textContent = tds[1].textContent = "";
        tds[2].textContent = tds[3].textContent = "0000";
        document.getElementById("numTam").textContent = "—";
        document.getElementById("numInst").textContent = "—";
        document.getElementById("numTot").textContent = "—";
        for (let i of pumahat.g.rrpg.getElementsByTagName("tr:nth-child(4) td")){
            i.textContent = "00";
        }
        for (let i of pumahat.g.rrpg.getElementsByTagName("tr:nth-child(7) td")){
            i.textContent = "0000";
        }
        for (let i of pumahat.g.rseg.getElementsByTagName("td")){
            i.textContent = "0000";
        }
        for (let i of pumahat.g.rf16.querySelectorAll("th, td")){
            i.classList.remove("uno");
        }
        for (let i of pumahat.g.rf32.querySelectorAll("th, td")){
            i.classList.remove("uno");
        }
        pumahat.g.panst.textContent = "";
    }
}