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
    if (bit in window.pumahat.cadenas){
        var dato = window.pumahat.cadenas[bit];
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
    return String.fromCharCode(9216+valor) + " ("+window.pumahat.cadenas["a"+valor.toString(16).padStart(2, '0')].join(", ")+")";
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
            p += "<dt>" + r + ": " + window.pumahat.cadenas["EN"] + "</dt>";
            p += "<dd>" + window.pumahat.cadenas[r.substring(1,3)][0] + " (" + window.pumahat.cadenas[r.substring(1,3)][1] + ")</dd>";
            p += "<dd>" + window.pumahat.cadenas[r.substring(1,3)][2] + "</dd>";
        } else if (r.length == 2 && r[1] == "X"){
            p += "<dt>" + r + ": " + window.pumahat.cadenas["NN"] + "</dt>";
            p += "<dd>" + window.pumahat.cadenas[r][0] + " (" + window.pumahat.cadenas[r][1] + ")</dd>";
            p += "<dd>" + window.pumahat.cadenas[r][2] + "</dd>";
        } else if (r[1] == "L"){
            p += "<dt>" + r + ": " + window.pumahat.cadenas["NL"].replace("%s", r.replace("L", "X")) + "</dt>";
            p += "<dd>" + window.pumahat.cadenas[r.replace("L", "X")][0] + " (" + window.pumahat.cadenas[r.replace("L", "X")][1] + ")</dd>";
            p += "<dd>" + window.pumahat.cadenas[r.replace("L", "X")][2] + "</dd>";
        } else if (r[1] == "H"){
            p += "<dt>" + r + ": " + window.pumahat.cadenas["NH"].replace("%s", r.replace("H", "X")) + "</dt>";
            p += "<dd>" + window.pumahat.cadenas[r.replace("H", "X")][0] + " (" + window.pumahat.cadenas[r.replace("H", "X")][1] + ")</dd>";
            p += "<dd>" + window.pumahat.cadenas[r.replace("H", "X")][2] + "</dd>";
        } else if (r.length == 2 && r[1] == "S"){
            p += "<dt>" + r + ": " + window.pumahat.cadenas["EN"] + "</dt>";
            p += "<dd>" + window.pumahat.cadenas[r][0] + " (" + window.pumahat.cadenas[r][1] + ")</dd>";
            p += "<dd>" + window.pumahat.cadenas[r][2] + "</dd>";
        } else if (r.length == 3 && (r[2] == "P" || r[2] == "I")){
            p += "<dt>" + r + ": " + window.pumahat.cadenas["EN"] + "</dt>";
            p += "<dd>" + window.pumahat.cadenas[r.replace("E", "")][0] + " (" + window.pumahat.cadenas[r.replace("E", "")][1] + ")</dd>";
            p += "<dd>" + window.pumahat.cadenas[r.replace("E", "")][2] + "</dd>";
        } else if (r.length == 2 && (r[1] == "P" || r[1] == "I")){
            p += "<dt>" + r + ": " + window.pumahat.cadenas["NN"] + "</dt>";
            p += "<dd>" + window.pumahat.cadenas[r][0] + " (" + window.pumahat.cadenas[r][1] + ")</dd>";
            p += "<dd>" + window.pumahat.cadenas[r][2] + "</dd>";
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
    if (i == 0){
        localStorage.setItem("MemDisp", elem.value);
        localStorage.setItem("MemDispUni", elemu.value);
    }
    footer.querySelector("[aria-label='Memoria total']").textContent = localStorage.getItem("MemDisp")+" "+((localStorage.getItem("MemDispUni")=="kb")?"KiB":"B");
    var rmem = document.getElementById("r-mem");
    var tam = ((localStorage.getItem("MemDispUni") == "kb")?1024:1)*parseInt(localStorage.getItem("MemDisp"));
    var celdas = rmem.children[1].children[1];
    var tama = celdas.children.length;
    var delta = tam - tama;
    if (delta < 0){
        for (let i = tam; i < tama; i++){
            celdas.removeChild(celdas.children[tam]);
        }
    } else {
        for (let i = 0; i < delta; i++){
            var li = document.createElement("li");
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
        r32.open = false; r32.setAttribute("tabindex", "-1"); r32.setAttribute("disabled", "disabled");
        r16.open = true; r16.removeAttribute("tabindex"); r16.removeAttribute("disabled");
        rseg.open = true; rseg.removeAttribute("tabindex"); rseg.removeAttribute("disabled");
    } else if (elem.value == "32f"){
        r32.open = true; r32.removeAttribute("tabindex"); r32.removeAttribute("disabled");
        r16.open = false; r16.setAttribute("tabindex", "-1"); r16.setAttribute("disabled", "disabled");
        rseg.open = false; rseg.setAttribute("tabindex", "-1"); rseg.setAttribute("disabled", "disabled");
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

window.addEventListener("DOMContentLoaded", (event) => {
    /* Variables globales */
    window.pumahat.g = {
        dlgOpc: document.getElementById("dlgOpc"),
        footer: document.getElementsByTagName("footer")[0],
        pan: document.getElementById("pan"),
        panst: document.getElementById("panst"),
        txtMemDisp: document.getElementById("txtMemDisp"),
        txtMemDispUni: document.getElementById("cmbMemDispUni"),
        cmbModoOp: document.getElementById("cmbModoOp"),
        cmbColor: document.getElementById("cmbColor"),
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
    var opts = Array.from(dlgOpc.querySelectorAll("select, input")).forEach((elem) => {
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
                window.pumahat.g.pan.innerHTML = getObtenerTablaBit(trg);
            }
        });
        e.addEventListener("mouseout", (e2) => { window.pumahat.g.pan.textContent = ""; });
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
                window.pumahat.g.pan.innerHTML = getObtenerTablaDato(e2.target.textContent, null);
            }
        });
        e.addEventListener("mouseout", (e2) => { window.pumahat.g.pan.textContent = ""; });
    });
    Array.from(document.querySelectorAll("#t-eip, #t-ip, #r-rpg th:not(:empty), #r-seg th")).forEach((e) => {
        e.addEventListener("mouseover", (e2) => {
            window.pumahat.g.pan.innerHTML = getObtenerTablaDato(getValorRegistro(e2.target.textContent), 1, e2.target.textContent);
        });
        e.addEventListener("mouseout", (e2) => { window.pumahat.g.pan.textContent = ""; });
    });
    Array.from(document.querySelectorAll("#r-ay button")).forEach((e) => {
        e.addEventListener("click", (e2) => {
            var rango;
            var sel = window.getSelection();
            console.log(sel);
            if (sel.getRangeAt && sel.rangeCount) {
                rango = sel.getRangeAt(0);
                rango.deleteContents();
                rango.insertNode(document.createTextNode(e2.target.value));
            }
        });
    });

    /* CodeMirror */
    window.pumahat.cmi = CodeMirror(document.querySelector('#codemirror'), {
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers", "breakpoints"],
        tabSize: 2,
        value: "xchg ax, ax;"
    });
    window.pumahat.cmi.on("gutterClick", function(cm, n){
        var info = cm.lineInfo(n);
        cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
    });
    function makeMarker() {
        var marker = document.createElement("u");
        marker.classList.add("bp");
        marker.textContent = "●";
        return marker;
    }
    /*
    cmi.eachLine((t) => {console.log(t);}) -> iterate over each line
    */

    /* Estado de los botones */
    document.getElementById("btnDetener").disabled = true;
    /* Funciones para botones */
    document.getElementById("btnEjecutar").addEventListener("click", (event2) => {
        window.pumahat.cmi.setOption("readOnly", true);
        document.getElementById("btnDetener").disabled = false;
        document.getElementById("btnEjecutar").disabled = true;
        document.getElementById("btnAvanzar").disabled = true;
    });
    document.getElementById("btnAvanzar").addEventListener("click", (event2) => {
        window.pumahat.cmi.setOption("readOnly", true);
        document.getElementById("btnDetener").disabled = false;
        document.getElementById("btnEjecutar").disabled = true;
        document.getElementById("btnAvanzar").disabled = true;
    });
    document.getElementById("btnDetener").addEventListener("click", (event2) => {
        window.pumahat.cmi.setOption("readOnly", false);
        document.getElementById("btnDetener").disabled = true;
        document.getElementById("btnEjecutar").disabled = false;
        document.getElementById("btnAvanzar").disabled = false;
        //limpiarProcesador();
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
                window.pumahat.cmi.setValue(event3.target.result);
            }
            reader.onerror = function (){
                console.error("Error leyendo archivo");
            }
        }
    });
    document.getElementById("btnGuardar").addEventListener("click", (event2) => {
        var el = document.createElement("a");
        el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(window.pumahat.cmi.getValue()));
        el.setAttribute("download", "programa.asmx");
        el.style.display = 'none';
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
        window.pumahat.cmi.setOption("readOnly", false);
        //limpiarProcesador();
        window.pumahat.cmi.setValue();
        document.getElementById("archivo").value = null;
    });
});