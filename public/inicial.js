"use strict"

/* Utilidades de conversión Unicode */
/* TODO: 32-bit floating point */
function unicodeAcar(cp){
    if (cp != null){
        return String.fromCodePoint(parseInt(cp, 16));
    } else {
        return "<i>Caracter inválido</i>";
    }
}
function utf8Aunicode(hex){
    var r;
    var b = parseInt(hex, 16).toString(2).padStart(hex.length*4, '0');
    if (hex.length == 2 && b[0] == '0'){
        return hex;
    } else if (hex.length == 4 && b.slice(0, 3) == "110" && b.slice(8, 10) == "10"){
        r = b.slice(3, 8) + b.slice(10, 16);
    } else if (hex.length == 6 && b.slice(0, 4) == "1110" && b.slice(8, 10) == "10" && b.slice(16, 18) == "10"){
        r = b.slice(4, 8) + b.slice(10, 16) + b.slice(18, 24);
    } else if (hex.length == 8 && b.slice(0, 5) == "11110" && b.slice(8, 10) == "10" && b.slice(16, 18) == "10" && b.slice(24, 26) == "10"){
        r = b.slice(5, 8) + b.slice(10, 16) + b.slice(18, 24) + b.slice(26, 32);
    } else {
        return null;
    }
    return parseInt(r, 2).toString(16);
}
function utf16leAunicode(hex){
    var arr = hex.match(/.{4}/g);
    arr[0] = arr[0].match(/.{2}/g).reverse().join("");
    if (arr.length == 2) {
        arr[1] = arr[1].match(/.{2}/g).reverse().join("");
    }
    return utf16beAunicode(arr.join(""));
}
function utf16beAunicode(hex){
    var b = parseInt(hex, 16).toString(2).padStart(hex.length*4, '0');
    if (hex.length == 4){
        return hex;
    } else if (hex.length == 8 && b.slice(0, 6) == "110110" && b.slice(16, 22) == "110111"){
        return (parseInt(b.slice(6, 16) + b.slice(22, 32), 2)+0x10000).toString(16);
    } else {
        return null;
    }
}
function utf32leAunicode(hex){
    return hex.match(/.{2}/g).reverse.join("");
}
function utf32beAunicode(hex){
    return hex;
}

/* Utilidades de números con y sin signo */
function valorSignado(hex){
    var n = parseInt(hex, 16);
    var b = 2**(hex.length*4);
    return (n >= b/2)?("-"+(b-n).toString()):n.toString();
}

/* Generadores de funciones */
function getObtenerTablaBit(e){
    var bit = e.textContent;
    var cad = undefined;
    if (bit in pumahat.cadenas){
        var dato = pumahat.cadenas[bit];
        cad = "<dl class=\"natural\">";
        cad += "<dt>"+dato[0]+" ("+dato[1]+")</dt><dd>"+dato[2]+"</dd>";
        cad += "<dt>Estado</dt><dd>"+((e.classList.contains("uno"))?"Activado":"Desactivado")+"</dd>";
        cad += "</dl>";
    } else {
        cad = "<i>Bit reservado</i>";
    }
    return cad;
}

function getValorRegistro(r){
    switch (r){
        case "IP":
            return document.getElementById("v-ip").textContent;
        case "EIP":
            return document.getElementById("v-eip").textContent+document.getElementById("v-ip").textContent;
        case "AH":
            return document.getElementById("v-ah").textContent;
        case "AL":
            return document.getElementById("v-al").textContent;
        case "AX":
            return document.getElementById("v-ah").textContent+document.getElementById("v-al").textContent;
        case "EAX":
            return document.getElementById("v-eah").textContent+document.getElementById("v-eal").textContent+document.getElementById("v-ah").textContent+document.getElementById("v-al").textContent;
        case "CH":
            return document.getElementById("v-ch").textContent;
        case "CL":
            return document.getElementById("v-cl").textContent;
        case "CX":
            return document.getElementById("v-ch").textContent+document.getElementById("v-cl").textContent;;
        case "ECX":
            return document.getElementById("v-ech").textContent+document.getElementById("v-ecl").textContent+document.getElementById("v-ch").textContent+document.getElementById("v-cl").textContent;
        case "DH":
            return document.getElementById("v-dh").textContent;
        case "DL":
            return document.getElementById("v-dl").textContent;
        case "DX":
            return document.getElementById("v-dh").textContent+document.getElementById("v-dl").textContent;;
        case "EDX":
            return document.getElementById("v-edh").textContent+document.getElementById("v-edl").textContent+document.getElementById("v-dh").textContent+document.getElementById("v-dl").textContent;
        case "BH":
            return document.getElementById("v-bh").textContent;
        case "BL":
            return document.getElementById("v-bl").textContent;
        case "BX":
            return document.getElementById("v-bh").textContent+document.getElementById("v-bl").textContent;;
        case "EBX":
            return document.getElementById("v-ebh").textContent+document.getElementById("v-ebl").textContent+document.getElementById("v-bh").textContent+document.getElementById("v-bl").textContent;
        case "SP":
            return document.getElementById("v-sp").textContent;
        case "ESP":
            return document.getElementById("v-esp").textContent+document.getElementById("v-sp").textContent;
        case "BP":
            return document.getElementById("v-bp").textContent;
        case "EBP":
            return document.getElementById("v-ebp").textContent+document.getElementById("v-bp").textContent;
        case "DI":
            return document.getElementById("v-di").textContent;
        case "EDI":
            return document.getElementById("v-edi").textContent+document.getElementById("v-di").textContent;
        case "SI":
            return document.getElementById("v-si").textContent;
        case "ESI":
            return document.getElementById("v-esi").textContent+document.getElementById("v-si").textContent;
        case "CS":
            return document.getElementById("v-cs").textContent;
        case "DS":
            return document.getElementById("v-ds").textContent;
        case "ES":
            return document.getElementById("v-es").textContent;
        case "FS":
            return document.getElementById("v-fs").textContent;
        case "GS":
            return document.getElementById("v-gs").textContent;
        case "SS":
            return document.getElementById("v-ss").textContent;
    }
}

function genCaracterEspecial(valor){
    return String.fromCharCode(9216+valor) + " ("+pumahat.cadenas["a"+valor.toString(16).padStart(2, '0')].join(", ")+")";
}

function getObtenerTablaDato(valor, fun, r){
    var t = valor.length;
    var n = parseInt(valor, 16);
    var p = "";
    var d = {
        "Tamaño de dato": (t/2).toString() + " byte" + ((t != 2)?"s":""),
        "Binario": "0b"+n.toString(2).padStart(t*4, "0"),
        "Octal": ((n>0)?"0":"")+n.toString(8),
        "Decimal": n.toString(),
        "UTF-8": (n==127||n<32)?genCaracterEspecial(n):unicodeAcar(utf8Aunicode(valor)),
    }
    if (t == 2){
        d["C int8_t"] = valorSignado(valor);
        d["C uint8_t"] = n.toString();
        d["US-ASCII"] = (n==127||n<32)?genCaracterEspecial(n):(n>127)?"<i>Caracter inválido</i>":String.fromCodePoint(n);
    }
    else if (t == 4){
        d["UTF-16LE"] = (n==127||n<32)?genCaracterEspecial(n):unicodeAcar(utf16leAunicode(valor));
        d["UTF-16BE"] = (n==127||n<32)?genCaracterEspecial(n):unicodeAcar(utf16beAunicode(valor));
        d["C int16_t"] = valorSignado(valor);
        d["C uint16_t"] = n.toString();
    }
    else if (t == 8){
        d["UTF-16LE"] = (n==127||n<32)?genCaracterEspecial(n):unicodeAcar(utf16leAunicode(valor));
        d["UTF-16BE"] = (n==127||n<32)?genCaracterEspecial(n):unicodeAcar(utf16beAunicode(valor));
        d["UTF-32LE"] = (n==127||n<32)?genCaracterEspecial(n):unicodeAcar(utf32leAunicode(valor));
        d["UTF-32BE"] = (n==127||n<32)?genCaracterEspecial(n):unicodeAcar(utf32beAunicode(valor));
        d["C int32_t"] = valorSignado(valor);
        d["C uint32_t"] = n.toString();
    };
    if (fun == 1){
        if (r.length == 3 && r[2] == "X"){
            p += "<dt>" + r + ": " + pumahat.cadenas["EN"] + "</dt>";
            p += "<dd>" + pumahat.cadenas[r.substring(1,3)][0] + " (" + pumahat.cadenas[r.substring(1,3)][1] + ")</dd>";
            p += "<dd>" + pumahat.cadenas[r.substring(1,3)][2] + "</dd>";
        } else if (r.length == 2 && r[1] == "X"){
            p += "<dt>" + r + ": " + pumahat.cadenas["NN"] + "</dt>";
            p += "<dd>" + pumahat.cadenas[r][0] + " (" + pumahat.cadenas[r][1] + ")</dd>";
            p += "<dd>" + pumahat.cadenas[r][2] + "</dd>";
        } else if (r[1] == "L"){
            p += "<dt>" + r + ": " + pumahat.cadenas["NL"].replace("%s", r.replace("L", "X")) + "</dt>";
            p += "<dd>" + pumahat.cadenas[r.replace("L", "X")][0] + " (" + pumahat.cadenas[r.replace("L", "X")][1] + ")</dd>";
            p += "<dd>" + pumahat.cadenas[r.replace("L", "X")][2] + "</dd>";
        } else if (r[1] == "H"){
            p += "<dt>" + r + ": " + pumahat.cadenas["NH"].replace("%s", r.replace("H", "X")) + "</dt>";
            p += "<dd>" + pumahat.cadenas[r.replace("H", "X")][0] + " (" + pumahat.cadenas[r.replace("H", "X")][1] + ")</dd>";
            p += "<dd>" + pumahat.cadenas[r.replace("H", "X")][2] + "</dd>";
        } else if (r.length == 2 && r[1] == "S"){
            p += "<dt>" + r + ": " + pumahat.cadenas["EN"] + "</dt>";
            p += "<dd>" + pumahat.cadenas[r][0] + " (" + pumahat.cadenas[r][1] + ")</dd>";
            p += "<dd>" + pumahat.cadenas[r][2] + "</dd>";
        } else if (r.length == 3 && (r[2] == "P" || r[2] == "I")){
            p += "<dt>" + r + ": " + pumahat.cadenas["EN"] + "</dt>";
            p += "<dd>" + pumahat.cadenas[r.replace("E", "")][0] + " (" + pumahat.cadenas[r.replace("E", "")][1] + ")</dd>";
            p += "<dd>" + pumahat.cadenas[r.replace("E", "")][2] + "</dd>";
        } else if (r.length == 2 && (r[1] == "P" || r[1] == "I")){
            p += "<dt>" + r + ": " + pumahat.cadenas["NN"] + "</dt>";
            p += "<dd>" + pumahat.cadenas[r][0] + " (" + pumahat.cadenas[r][1] + ")</dd>";
            p += "<dd>" + pumahat.cadenas[r][2] + "</dd>";
        }
    }
    var cad = "<dl>" + p + "</dl><dl class=\"natural\">";
    Object.entries(d).forEach((e) => {
        cad += "<dt>"+e[0]+"</dt><dd>"+e[1]+"</dd>";
    });
    cad += "</dl>";
    return cad;
}

/* Acciones */
function txtMemDispEvento(i){
    let footer = pumahat.g.footer;
    let elem = pumahat.g.txtMemDisp;
    let elemu = pumahat.g.txtMemDispUni;
    if (i == 0){ // i==0 si el usuario ha actualizado el valor
        localStorage.setItem("MemDisp", elem.value);
        localStorage.setItem("MemDispUni", elemu.value);
    }
    footer.querySelector("[aria-label='Memoria total']").textContent = localStorage.getItem("MemDisp")+" "+((localStorage.getItem("MemDispUni")=="kb")?"KiB":"B");
    var tam = ((localStorage.getItem("MemDispUni") == "kb")?1024:1)*parseInt(localStorage.getItem("MemDisp"));
    var celdas = pumahat.g.rmem;
    var tama = celdas.children.length;
    var delta = tam - tama;
    if (delta < 0){
        for (let i = tam; i < tama; i++){
            celdas.removeChild(celdas.children[tam]);
        }
    } else {
        for (let i = 0; i < delta; i++){
            var li = document.createElement("li");
            if (i != 0){
                // NOTE: Evaluar utilidad de contains("grupo")
                li.addEventListener("mouseover", (e) => {
                    if (!e.target.classList.contains("grupo")){
                        pumahat.g.pan.innerHTML = getObtenerTablaDato(e.target.textContent, null);
                    }
                });
                li.addEventListener("mouseout", () => { pumahat.g.pan.textContent = ""; });
            }
            li.textContent = "00";
            celdas.appendChild(li);
        }
    }
}
function cmbModoOpEvento(i){
    let footer = pumahat.g.footer;
    let elem = pumahat.g.cmbModoOp;
    footer.querySelector("[aria-label*='Modo']").textContent = elem.selectedOptions[0].textContent;
    if (i == 0){ localStorage.setItem("ModoOp", elem.value); }
    var rseg = document.getElementById("r-seg")
    var r16 = document.getElementById("r-f16");
    var r32 = document.getElementById("r-f32");
    if (elem.value == "16"){
        r32.hidden = true;
        r16.hidden = false;
        rseg.hidden = false;
    } else if (elem.value == "32f"){
        r32.hidden = false;
        r16.hidden = true;
        rseg.hidden = true;
    }
}
function cmbColorEvento(i){
    let footer = pumahat.g.footer;
    let elem = pumahat.g.cmbColor;
    footer.querySelector("[aria-label='Tema']").textContent = elem.selectedOptions[0].textContent;
    if (i == 0){ localStorage.setItem("Color", elem.value); }
    document.body.classList.remove("tema-o");
    document.body.classList.remove("tema-c");
    if (elem.value != "p"){
        document.body.classList.add("tema"+elem.value);
    }
}

/* Eventos del editor */
function onChangeCMI(cm){
    let t = pumahat.cmi.getValue().length;
    let u;
    if (t >= 1000){
        u = t.toFixed(1) + " KB";
    } else {
        u = t + " byte" + (t!=1?"s":"");
    }
    document.querySelector("footer [aria-label=Tamaño]").textContent = u;
}
function onInputCMI(cm){
    let c = cm.getCursor();
    document.querySelector("footer [aria-label=Línea]").textContent = "Línea " + (c.line + 1);
    document.querySelector("footer [aria-label=Columna]").textContent = "Columna " + (c.ch + 1);
}

window.addEventListener("DOMContentLoaded", (event) => {
    /* Variables globales */
    pumahat.g = {
        dlgOpc: document.getElementById("dlgOpc"),
        footer: document.getElementsByTagName("footer")[0],
        txtMemDisp: document.getElementById("txtMemDisp"),
        txtMemDispUni: document.getElementById("cmbMemDispUni"),
        cmbModoOp: document.getElementById("cmbModoOp"),
        cmbColor: document.getElementById("cmbColor"),
        btnEjecutar: document.getElementById("btnEjecutar"),
        btnAvanzar: document.getElementById("btnAvanzar"),
        btnDetener: document.getElementById("btnDetener"),
        rerr: document.querySelector("#r-err>div"),
        rmem: document.querySelector("#r-mem ol"),
        lvars: document.getElementsByClassName("lvars")[0],
        rip: document.querySelector("#r-ip table"),
        rrpg: document.querySelector("#r-rpg table"),
        rseg: document.querySelector("#r-seg table"),
        rf16: document.querySelector("#r-f16 table"),
        rf32: document.querySelector("#r-f32 table"),
        pan: document.getElementById("pan"),
        panst: document.getElementById("panst"),
    };

    /* Eventos para configuración */
    pumahat.g.txtMemDisp.addEventListener("change", (e) => {
        if (parseInt(e.target.value) > 1024){ event2.target.value = 1024; }
        txtMemDispEvento(0);
    });
    pumahat.g.txtMemDispUni.addEventListener("change", () => { txtMemDispEvento(0); } );
    pumahat.g.cmbModoOp.addEventListener("change", () => { cmbModoOpEvento(0); } );
    pumahat.g.cmbColor.addEventListener("change", () => { cmbColorEvento(0); } );

    /* Sincronización de configuración */
    Array.from(dlgOpc.querySelectorAll("select, input")).forEach((elem) => {
        var prop = elem.id.replace("txt","").replace("cmb", "");
        var ov = localStorage.getItem(prop);
        if (ov){ elem.value = ov; }
        else { localStorage.setItem(prop, elem.value); }
    });
    txtMemDispEvento();
    cmbModoOpEvento();
    cmbColorEvento();

    /* Eventos para el panel de ayuda */
    Array.from(document.querySelectorAll("#r-f16 th, #r-f16 td, #r-f32 th, #r-f32 td")).forEach((e) => {
        e.addEventListener("mouseover", (e2) => {
            if (!e2.target.classList.contains("grupo")){
                var trg = e2.target;
                if (e2.target.tagName == "th"){
                    trg = e2.target.parentNode.parentNode.querySelector("td[data-pos=\""+e2.target.dataset.pos+"\"]");
                }
                pumahat.g.pan.innerHTML = getObtenerTablaBit(trg);
            }
        });
        e.addEventListener("mouseout", (e2) => { pumahat.g.pan.textContent = ""; });
        e.addEventListener("click", (e2) => {
            Array.from(e2.target.parentNode.parentNode.querySelectorAll("[data-pos=\""+e2.target.dataset.pos+"\"]")).forEach((e3) => {
                if (e3.classList.contains("uno")){ e3.classList.remove("uno"); }
                else {e3.classList.add("uno");}
            });
        });
    });
    Array.from(document.querySelectorAll("#r-mem li, #v-eip, #v-ip, #r-rpg td:not(:empty), #r-seg td")).forEach((e) => {
        e.addEventListener("mouseover", (e2) => {
            if (!e2.target.classList.contains("grupo")){
                pumahat.g.pan.innerHTML = getObtenerTablaDato(e2.target.textContent, null);
            }
        });
        e.addEventListener("mouseout", (e2) => { pumahat.g.pan.textContent = ""; });
    });
    Array.from(document.querySelectorAll("#t-eip, #t-ip, #r-rpg th:not(:empty), #r-seg th")).forEach((e) => {
        e.addEventListener("mouseover", (e2) => {
            pumahat.g.pan.innerHTML = getObtenerTablaDato(getValorRegistro(e2.target.textContent), 1, e2.target.textContent);
        });
        e.addEventListener("mouseout", (e2) => { pumahat.g.pan.textContent = ""; });
    });
    Array.from(document.querySelectorAll("#r-ay button")).forEach((e) => {
        e.addEventListener("click", (e2) => {
            var sel = pumahat.cmi.getSelection();
            if (sel.length > 0){
                pumahat.cmi.replaceSelection(e2.target.value);
            } else {
                var doc = pumahat.cmi.getDoc();
                var cursor = doc.getCursor();
                doc.replaceRange(e2.target.value, cursor);
            }
        });
    });


    /* Eventos para paneles */


    /* CodeMirror */
    pumahat.cmi = CodeMirror(document.querySelector('#codemirror'), {
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers", "breakpoints"],
        tabSize: 2
    });
    pumahat.cmi.on("gutterClick", (cm, n) => {
        var info = cm.lineInfo(n);
        cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
    });
    function makeMarker() {
        var marker = document.createElement("u");
        marker.classList.add("bp");
        marker.textContent = "●";
        return marker;
    }
    pumahat.cmi.on("change", onChangeCMI);
    pumahat.cmi.on("cursorActivity", onInputCMI);
    onChangeCMI(pumahat.cmi);
    onInputCMI(pumahat.cmi);

    /* Estado de los botones */
    pumahat.g.btnDetener.disabled = true;
    /* Funciones para botones */
    pumahat.g.btnEjecutar.addEventListener("click", (event2) => {
        pumahat.cmi.setOption("readOnly", true);
        pumahat.g.btnDetener.disabled = false;
        pumahat.g.btnEjecutar.disabled = true;
        pumahat.g.btnAvanzar.disabled = true;
        // fun
        try {
            pumahat.p = new Programa();
            pumahat.cmi.eachLine((l) => {
                pumahat.p.analizar(l.text, 1);
            });
            pumahat.p.ejecutar();
        } catch (err) {
            // FIX: hacer más didáctico esto de los errores
            pumahat.g.rerr.parentNode.hidden = false;
            pumahat.g.rerr.textContent = err.message;
        }
    });
    pumahat.g.btnAvanzar.addEventListener("click", (event2) => {
        pumahat.cmi.setOption("readOnly", true);
        pumahat.g.btnDetener.disabled = false;
        pumahat.g.btnEjecutar.disabled = true;
        pumahat.g.btnAvanzar.disabled = true;
        pumahat.g.rerr.parentNode.hidden = true;
    });
    pumahat.g.btnDetener.addEventListener("click", (event2) => {
        pumahat.cmi.setOption("readOnly", false);
        pumahat.g.btnDetener.disabled = true;
        pumahat.g.btnEjecutar.disabled = false;
        pumahat.g.btnAvanzar.disabled = false;
        pumahat.p.limpiar();
        pumahat.p = undefined;
    });
    document.getElementById("btnAbrir").addEventListener("click", (event2) => {
        document.getElementById("archivo").click();
    });
    document.getElementById("archivo").addEventListener("change", (event2) => {
        var file = event2.target.files[0];
        if (file){
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (event3){
                pumahat.cmi.setValue(event3.target.result);
            }
            reader.onerror = function (){
                console.error("Error leyendo archivo");
            }
        }
    });
    document.getElementById("btnGuardar").addEventListener("click", (event2) => {
        var el = document.createElement("a");
        el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(pumahat.cmi.getValue()));
        el.setAttribute("download", "programa.asmx");
        el.style.display = "none";
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
    });
    document.getElementById("btnOpc").addEventListener("click", (event2) => {
        dlgOpc.showModal();
    });
    document.getElementById("btnDlgCerrar").addEventListener("click", (event2) => {
        dlgOpc.close();
    });
    document.getElementById("btnRestablecer").addEventListener("click", (event2) => {
        pumahat.cmi.setOption("readOnly", false);
        pumahat.p.limpiar();
        pumahat.cmi.setValue();
        document.getElementById("archivo").value = null;
    });
});