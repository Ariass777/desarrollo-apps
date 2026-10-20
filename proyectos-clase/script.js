"use strict";
const pantalla = document.getElementById("pantalla");
let expresion = "";
function agregar(valor) {
    expresion += valor;
    pantalla.value = expresion;
}
function limpiar() {
    expresion = "";
    pantalla.value = "0";
}
function borrar() {
    expresion = expresion.slice(0, -1);
    if (expresion === "") {
        pantalla.value = "0";
    }
    else {
        pantalla.value = expresion;
    }
}
function calcular() {
    try {
        const resultado = eval(expresion);
        pantalla.value = resultado;
        expresion = resultado.toString();
    }
    catch {
        pantalla.value = "Error";
        expresion = "";
    }
}
