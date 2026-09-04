const pantalla = document.getElementById("pantalla") as HTMLInputElement;

let expresion: string = "";

function agregar(valor: string): void {
    expresion += valor;
    pantalla.value = expresion;
}

function limpiar(): void {
    expresion = "";
    pantalla.value = "0";
}

function borrar(): void {
    expresion = expresion.slice(0, -1);

    if (expresion === "") {
        pantalla.value = "0";
    } else {
        pantalla.value = expresion;
    }
}

function calcular(): void {
    try {
        const resultado = eval(expresion);

        pantalla.value = resultado;
        expresion = resultado.toString();

    } catch {
        pantalla.value = "Error";
        expresion = "";
    }
}