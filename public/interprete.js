'use strict'

class SintaxisError extends Error {
    constructor (){
        super();
        this.message = "Error de sintaxis desconocido.";
    }
}
class NoImplementadoError extends SintaxisError {
    constructor (cmd){
        super();
        this.cmd = cmd;
        this.message = "El mnemotécnico "+cmd+" no ha sido implementado aún.";
    }
}
class SeccionError extends SintaxisError {
    constructor (id){
        super();
        this.id = id;
        this.message = "La sección \""+id+"\" no es parte de las secciones admitidas.";
    }
}
class VariableFueraError extends SintaxisError {
    constructor (id){
        super();
        this.id = id;
        this.message = "La variable \""+id+"\" debe ser declarada en la sección .data del código.";
    }
}
class VariableExistenteError extends SintaxisError {
    constructor (id){
        super();
        this.id = id;
        this.message = "La variable \""+id+"\" ya fue declarada anteriormente.";
    }
}

class ReferenciaError extends Error {

}

class TipoError extends Error {

}
class TipoVariableError extends TipoError {
    constructor (id){
        super();
        this.id = id;
        this.message = "El tipo \""+id+"\" no se reconoce.";
    }
}

class RangoError extends Error {

}

class MemoriaError extends Error {

}

class Instruccion {
    constructor(ins, lop){
        switch (ins){
            case "add":
                break;
            case "call":
                break;
            case "cmp":
                break;
            case "jne":
                break;
            case "jmp":
                break;
            case "lea":
                break;
            case "leave":
                break;
            case "mul":
                break;
            case "push":
                break;
            case "ret":
                break;
            case "sub":
                break;
            default:
                throw new NoImplementadoError(ins);
        }
    }
}

class Valor {
    r_id = new RegExp("^[A-Za-z_]+", "g");
    r_num = new RegExp("^((0x([0-9A-Fa-f]+))|(0b[01]+)|([0-9]+)|(0[0-7]+))", "g");
    r_esp = new RegExp("^\\s+", "g");
    #lsim = [];
    tipo = 0; // 0= valor, 1= offset

    constructor(exp){
        // Tipos: 1: entero, 2: id, 3: operador; 4: dir, 5: reg, 6: eti
        var cexp = exp;
        /* Análisis léxico */
        while (cexp.length > 0){
            if (this.r_id.test(cexp[0])) {
                // Una variable o registro
                let id = cexp.match(this.r_id)[0];
                this.#lsim.push({"tipo": 2, "valor": id});
                cexp = cexp.substring(id.length);
            } else if (/[0-9]/.test(cexp[0])) {
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
                else throw new SintaxisError();
            } else if ((/^[,\+\-\*\[\]\(\)]/).test(cexp[0])) {
                // Un operador
                this.#lsim.push({"tipo": 3, "valor": cexp[0]});
                cexp = cexp.substring(1);
            } else if (this.r_esp.test(cexp[0])) {
                // Un espacio en blanco
                let esp = cexp.match(this.r_esp)[0];
                cexp = cexp.substring(esp.length);
                continue;
            } else {
                throw new SintaxisError();
            }
        }

        /* Análisis sintáctico */
        for (i in this.#lsim){qq

        }
    }
}

class Programa {
    /* Expresiones regulares */
    r_sec = new RegExp("^section\\s+\\.([A-Za-z]+)$", "g");
    r_var = new RegExp("^([A-Za-z]+)\\s*:\\s+([A-Za-z]+)\s+([A-Za-z0-9\.,\"']+)$", "g");
    r_eti = new RegExp("^([A-Za-z]+):$", "g");
    r_ins = new RegExp("^([A-Za-z]+)\\s+(.+)$", "g");

    seccion = 0;

    #ast = [];

    #getVariable(n){
        Array.from(pumahat.g.lvars.getElementsByTagName("dt")).forEach((el) => {
            if (el.textContent == n) return new Expresion(el.nextElementSibling.textContent);
        });
    };
    #setVariable(n, t, v){
        Array.from(pumahat.g.lvars.getElementsByTagName("dt")).forEach((el) => {
            if (el.textContent == n) throw new VariableExistenteError(n);
        });
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

    // Procesa una línea de ensamblador, y modifica la interfaz en consecuencia
    ejecutar(l){
        var el = l.trim();
        // Línea vacía
        if (!el.length) { return; }
        // Sección de código
        if (r_sec.test(el)) {
            var res = r_sec.match(el)[1].toLowerCase();
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
                    throw new SeccionError(res);
            }
            this.#setVariable("."+res, "sec", "0");
            return;
        }
        // Variable
        if (r_var.test(el)){
            var res = r_var.match(el);
            var exp = new Expresion(res[3]);
            this.#setVariable(res[1], res[2].toLowerCase(), exp);
            return;
        }
        // Etiqueta
        if (r_eti.test(el)){
            var res = r_eti.match(el)[1].toLowerCase();
            var dir = x;
            this.#setVariable(res, "eti", dir);
            return;
        }
        // Instrucción
        if (r_ins.test(el)){
            var res = r_ins.match(el);
            var exp = new Expresion(res[2]);
            var ins = new Instruccion(res[1].toLowerCase(), exp);
            this.#ast.push(ins);
            return;
        } else {
            throw new SintaxisError();
        }
    }

    // Deja la interfaz en orden
    limpiar(){
        pumahat.g.rerr.parentNode.hidden = true;
        pumahat.g.rerr.textContent = "";
        pumahat.g.rmem.textContent = "";
        txtMemDispEvento();
        pumahat.g.lvars.textContent = "";
        var tds = pumahat.g.rip.getElementsByTagName("td");
        td[0].textContent = td[1].textContent = "";
        td[2].textContent = td[3].textContent = "0000";
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
