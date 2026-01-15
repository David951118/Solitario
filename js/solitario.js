/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/

// Array de palos
let palos = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
//let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// En las pruebas iniciales solo se trabajará con cuatro cartas por palo:
let numeros = [9, 10, 11, 12];

// paso (top y left) en pixeles de una carta a la siguiente en un mazo
let paso = 5;

// Tapetes
let tapeteInicial = document.getElementById("inicial");
let tapeteSobrantes = document.getElementById("sobrantes");
let tapeteReceptor1 = document.getElementById("receptor1");
let tapeteReceptor2 = document.getElementById("receptor2");
let tapeteReceptor3 = document.getElementById("receptor3");
let tapeteReceptor4 = document.getElementById("receptor4");

// Mazos
let mazoInicial = [];
let mazoSobrantes = [];
let mazoReceptor1 = [];
let mazoReceptor2 = [];
let mazoReceptor3 = [];
let mazoReceptor4 = [];

// Contadores de cartas
let contInicial = document.getElementById("contador_inicial");
let contSobrantes = document.getElementById("contador_sobrantes");
let contReceptor1 = document.getElementById("contador_receptor1");
let contReceptor2 = document.getElementById("contador_receptor2");
let contReceptor3 = document.getElementById("contador_receptor3");
let contReceptor4 = document.getElementById("contador_receptor4");
let contMovimientos = document.getElementById("contador_movimientos");

// Tiempo
let contTiempo = document.getElementById("contador_tiempo"); // span cuenta tiempo
let segundos = 0; // cuenta de segundos
let temporizador = null; // manejador del temporizador

/***** FIN DECLARACIÓN DE VARIABLES GLOBALES *****/

// Rutina asociada a boton reset
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/

// El juego arranca ya al cargar la página: no se espera a reiniciar
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/

// Desarrollo del comienzo de juego
function comenzarJuego() {
  /* Crear baraja, es decir crear el mazoInicial. Este será un array cuyos 
	elementos serán elementos HTML <img>, siendo cada uno de ellos una carta.
	Sugerencia: en dos bucles for, bárranse los "palos" y los "numeros", formando
	oportunamente el nombre del fichero png que contiene a la carta (recuérdese poner
	el path correcto en la URL asociada al atributo src de <img>). Una vez creado
	el elemento img, inclúyase como elemento del array mazoInicial. 
	*/

  // Vaciar el mazoInicial por si ya había cartas de una partida anterior
  mazoInicial = [];

  // PASO 1: Crear todas las cartas (bucles anidados)
  // Recorrer cada palo
  for (let palo of palos) {
    // Para cada palo, recorrer cada número
    for (let numero of numeros) {
      // Crear un elemento <img> (una carta)
      let carta = document.createElement("img");

      // Formar el nombre del archivo: img/viu_9.png, img/cua_10.png, etc.
      let nombreArchivo = "img/" + palo + "_" + numero + ".png";

      // Asignar la ruta de la imagen al atributo src
      carta.src = nombreArchivo;

      // Agregar la carta al mazoInicial
      mazoInicial.push(carta);
    }
  }

  // PASO 2: Barajar y dejar mazoInicial en tapete inicial
  barajar(mazoInicial); // Mezclar las cartas aleatoriamente
  cargarTapeteInicial(mazoInicial); // Colocarlas visualmente en el tapete

  // PASO 3: Puesta a cero de contadores de mazos
  setContador(contSobrantes, 0);
  setContador(contReceptor1, 0);
  setContador(contReceptor2, 0);
  setContador(contReceptor3, 0);
  setContador(contReceptor4, 0);
  setContador(contMovimientos, 0);

  // PASO 4: Arrancar el conteo de tiempo
  arrancarTiempo();
} // comenzarJuego

/**
	Se debe encargar de arrancar el temporizador: cada 1000 ms se
	debe ejecutar una función que a partir de la cuenta autoincrementada
	de los segundos (segundos totales) visualice el tiempo oportunamente con el 
	format hh:mm:ss en el contador adecuado.

	Para descomponer los segundos en horas, minutos y segundos pueden emplearse
	las siguientes igualdades:

	segundos = truncar (   segundos_totales % (60)                 )
	minutos  = truncar ( ( segundos_totales % (60*60) )     / 60   )
	horas    = truncar ( ( segundos_totales % (60*60*24)) ) / 3600 )

	donde % denota la operación módulo (resto de la división entre los operadores)

	Así, por ejemplo, si la cuenta de segundos totales es de 134 s, entonces será:
	   00:02:14

	Como existe la posibilidad de "resetear" el juego en cualquier momento, hay que 
	evitar que exista más de un temporizador simultáneo, por lo que debería guardarse
	el resultado de la llamada a setInterval en alguna variable para llamar oportunamente
	a clearInterval en su caso.   
*/

function arrancarTiempo() {
  /*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/
  if (temporizador) clearInterval(temporizador);
  let hms = function () {
    let seg = Math.trunc(segundos % 60);
    let min = Math.trunc((segundos % 3600) / 60);
    let hor = Math.trunc((segundos % 86400) / 3600);
    let tiempo =
      (hor < 10 ? "0" + hor : "" + hor) +
      ":" +
      (min < 10 ? "0" + min : "" + min) +
      ":" +
      (seg < 10 ? "0" + seg : "" + seg);
    setContador(contTiempo, tiempo);
    segundos++;
  };
  segundos = 0;
  hms(); // Primera visualización 00:00:00
  temporizador = setInterval(hms, 1000);
} // arrancarTiempo

/**
	Si mazo es un array de elementos <img>, en esta rutina debe ser
	reordenado aleatoriamente. Al ser un array un objeto, se pasa
	por referencia, de modo que si se altera el orden de dicho array
	dentro de la rutina, esto aparecerá reflejado fuera de la misma.
*/
function barajar(mazo) {
  // Recorremos el array desde el final hacia el inicio
  for (let i = mazo.length - 1; i > 0; i--) {
    // Generar un índice aleatorio entre 0 e i (inclusive)
    // Math.random() genera un número entre 0 y 1
    // Math.random() * (i + 1) genera un número entre 0 e i+1
    // Math.floor() redondea hacia abajo para obtener un entero
    let j = Math.floor(Math.random() * (i + 1));

    // Intercambiar los elementos en las posiciones i y j
    // Usamos una variable temporal para no perder el valor
    let temp = mazo[i];
    mazo[i] = mazo[j];
    mazo[j] = temp;
  }
}

/**
	  En el elemento HTML que representa el tapete inicial (variable tapeteInicial)
	se deben añadir como hijos todos los elementos <img> del array mazo.
	Antes de añadirlos, se deberían fijar propiedades como la anchura, la posición,
	coordenadas top y left, algun atributo de tipo data-...
	Al final se debe ajustar el contador de cartas a la cantidad oportuna
*/
function cargarTapeteInicial(mazo) {
  // PASO 1: Limpiar el tapete (eliminar cartas anteriores si las hay)
  tapeteInicial.innerHTML = "";

  // PASO 2: Recorrer todas las cartas del mazo
  for (let i = 0; i < mazo.length; i++) {
    let carta = mazo[i];

    // Configurar propiedades CSS de la carta
    carta.style.width = "70px"; // Ancho de la carta
    carta.style.position = "absolute"; // Posicionamiento absoluto

    // Calcular posición con desplazamiento para efecto de "mazo apilado"
    // Cada carta se desplaza 'paso' píxeles (5px) respecto a la anterior
    carta.style.top = i * paso + "px"; // Desplazamiento vertical
    carta.style.left = i * paso + "px"; // Desplazamiento horizontal

    // Atributo data-mazo para identificar a qué mazo pertenece
    carta.setAttribute("data-mazo", "inicial");

    // PASO 3: Añadir la carta al tapete inicial
    tapeteInicial.appendChild(carta);
  }

  // PASO 4: Actualizar el contador con la cantidad de cartas
  setContador(contInicial, mazo.length);
} // cargarTapeteInicial

/**
	  Esta función debe incrementar el número correspondiente al contenido textual
		  del elemento que actúa de contador
*/
function incContador(contador) {
  // Obtener el valor actual del contador (es texto, lo convertimos a número)
  let valorActual = parseInt(contador.textContent);
  // Sumar 1 al valor
  let nuevoValor = valorActual + 1;
  // Actualizar el texto del contador con el nuevo valor
  contador.textContent = nuevoValor;
} // incContador

/**
	Idem que anterior, pero decrementando 
*/
function decContador(contador) {
  // Obtener el valor actual del contador
  let valorActual = parseInt(contador.textContent);
  // Restar 1 al valor
  let nuevoValor = valorActual - 1;
  // Actualizar el texto del contador
  contador.textContent = nuevoValor;
} // decContador

/**
	Similar a las anteriores, pero ajustando la cuenta al
	valor especificado
*/
function setContador(contador, valor) {
  // Simplemente establecer el valor que nos pasan
  contador.textContent = valor;
} // setContador

// Función para actualizar el año en el footer
function actualizarAnio() {
	let fecha = new Date();
	let anio = fecha.getFullYear();
	let elemento = document.getElementById("anno_actual");
	if (elemento) {
		elemento.textContent = anio;
	}
}

document.addEventListener("DOMContentLoaded", function () {
	actualizarAnio();

	// Referencias a los modales
	var modalNoMoves = document.getElementById("noMoves");
	var modalVictory = document.getElementById("victory");

	// Botones de cerrar (hay dos, uno por cada modal)
	var spans = document.getElementsByClassName("close");

	// Cerrar modal 'Sin movimientos'
	if (spans[0] && modalNoMoves) {
		spans[0].onclick = function () {
			modalNoMoves.style.display = "none";
		}
	}

	// Cerrar modal 'Victoria'
	if (spans[1] && modalVictory) {
		spans[1].onclick = function () {
			modalVictory.style.display = "none";
		}
	}

	// Botón Jugar de nuevo
	var btnVictoryReset = document.getElementById("victory_reset");
	if (btnVictoryReset) {
		btnVictoryReset.onclick = function () {
			location.reload();
		}
	}
});