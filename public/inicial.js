"use strict"

/* Utilidades de conversión Unicode */
/* TODO: 32-bit floating point */
function unicodeAcar(cp){
    if (cp != null){
        return String.fromCodePoint(cp);
    } else {
        return "<i>Cadena inválida</i>";
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
    return (n >= b/2)?("-"+(b-n).toString(16)):hex;
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

function getObtenerTablaRegistro(valor){
}

// FIX: Evitar imprmir puntos de código 127 o 0-31
function getObtenerTablaDato(valor){
    var t = valor.length;
    var n = parseInt(valor, 16);
    var d = {
        "Tamaño de dato": t.toString(),
        "Binario": "0b"+n.toString(2).padStart(t*4, "0"),
        "Octal": ((n>0)?"0":"")+n.toString(8),
        "Decimal": n.toString(),
        "UTF-8": unicodeAcar(utf8Aunicode(valor)),
    }
    if (t == 2){
        d["C int8_t"] = valorSignado(valor);
        d["C uint8_t"] = n.toString();
        d["US-ASCII"] = (n==127)?"␡ (Delete)":(n>127)?"<i>Sin valor</i>":(n<32)?String.fromCharCode(n):String.fromCharCode(9216+n)+"("+window.pumahat.cadenas["c"+n]+")";
    }
    else if (t == 4){
        d["UTF-16LE"] = unicodeAcar(utf16leAunicode(valor));
        d["UTF-16BE"] = unicodeAcar(utf16beAunicode(valor));
        d["C int16_t"] = valorSignado(valor);
        d["C uint16_t"] = n.toString();
    }
    else if (t == 8){
        d["UTF-16LE"] = unicodeAcar(utf16leAunicode(valor));
        d["UTF-16BE"] = unicodeAcar(utf16beAunicode(valor));
        d["UTF-32LE"] = unicodeAcar(utf32leAunicode(valor));
        d["UTF-32BE"] = unicodeAcar(utf32beAunicode(valor));
        d["C int32_t"] = valorSignado(valor);
        d["C uint32_t"] = n.toString();
    };
    var cad = "<dl class=\"natural\">";
    Object.entries(d).forEach((e) => {
        cad += "<dt>"+e[0]+"</dt><dd>"+e[1]+"</dd>";
    });
    cad += "</dl>";
    console.log(cad);
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
    footer.querySelector("[aria-label='Memoria total']").textContent = localStorage.getItem("MemDisp")+" "+localStorage.getItem("MemDispUni").toUpperCase();
    var rmem = document.getElementById("r-mem");
    var tam = ((localStorage.getItem("MemDispUni") == "kb")?1024:1)*parseInt(localStorage.getItem("MemDisp"));
    var delta = tam - rmem.children.length;
    if (delta < 0){
        for (let i = tam; i<rmem.children.length; i++){
            tam[i].parentNode.removeChild(tam[i]);
        }
    } else {
        for (let i = 0; i < tam; i++){
            var li = document.createElement("li");
            li.textContent = "00";
            rmem.children[2].appendChild(li);
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
        pan: document.getElementById("r-exp").children[1],
        txtMemDisp: document.getElementById("txtMemDisp"),
        txtMemDispUni: document.getElementById("cmbMemDispUni"),
        cmbModoOp: document.getElementById("cmbModoOp"),
        cmbColor: document.getElementById("cmbColor"),
    };

    /* Eventos para configuración */
    pumahat.g.txtMemDisp.addEventListener("change", (e) => {
        if (parseInt(e.target.value) > 1024){ event2.target.value = 1024; }
        cmbMemDispEvento();
    });
    pumahat.g.txtMemDispUni.addEventListener("change", () => { cmbMemDispEvento(0); } );
    pumahat.g.cmbModoOp.addEventListener("change", () => { cmbModoOpEvento(0); } );
    pumahat.g.cmbColor.addEventListener("change", () => { cmbColorEvento(0); } );

    /* Sincronización de configuración */
    var opts = Array.from(dlgOpc.querySelectorAll("select, input")).forEach((elem) => {
        var prop = elem.id.replace("txt","").replace("cmb","");
        var ov = localStorage.getItem(prop);
        if (ov){ elem.value = ov; }
        else { localStorage.setItem(prop, elem.value); }
    });
    txtMemDispEvento();
    cmbModoOpEvento();
    cmbColorEvento();

    /* Eventos para el panel de ayuda */
    Array.from(document.querySelectorAll("#r-f16 td, #r-f32 td")).forEach((e) => {
        e.addEventListener("mouseover", (e2) => {
            if (!e2.target.classList.contains("grupo")){
                window.pumahat.g.pan.innerHTML = getObtenerTablaBit(e2.target);
            }
        });
        e.addEventListener("mouseout",  (e2) => { window.pumahat.g.pan.textContent = ""; });
        e.addEventListener("click",  (e2) => {
            var cl = e2.target.classList.contains("uno");
            if (cl){
                e.target.classList.remove("uno");
                e.target.parentNode.previousElementSibling.children[Array.prototype.indexOf.call(e.target.parentNode.children, e.target)].classList.remove("uno");
            }
            else {
                e.target.classList.add("uno");
                e.target.parentNode.previousElementSibling.children[Array.prototype.indexOf.call(e.target.parentNode.children, e.target)].classList.add("uno");
            }
        });
    });
    Array.from(document.querySelectorAll("#r-mem td, #r-ip td, #r-rpg td, #r-seg td")).forEach((e) => {
        e.addEventListener("mouseover", (e2) => {
            if (!e2.target.classList.contains("grupo")){
                window.pumahat.g.pan.innerHTML = getObtenerTablaDato(e2.target.textContent);
            }
        });
        e.addEventListener("mouseout", (e2) => { window.pumahat.g.pan.textContent = ""; });
    });

    /* Funciones para botones */
    document.getElementById("btnAbrir").addEventListener("click", (event2) => {
        document.getElementById("archivo").click();
    });
    document.getElementById("btnOpc").addEventListener("click", (event2) => {
        dlgOpc.showModal();
    });
    document.getElementById("btnDlgCerrar").addEventListener("click", (event2) => {
        dlgOpc.close();
    });
});