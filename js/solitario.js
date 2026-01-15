/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/

// Array de palos
let palos = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// En las pruebas iniciales solo se trabajará con cuatro cartas por palo:
//let numeros = [9, 10, 11, 12];

// paso (top y left) en pixeles de una carta a la siguiente en un mazo
let paso = 5;

// Tapetes (se inicializarán cuando el DOM esté listo)
let tapeteInicial = null;
let tapeteSobrantes = null;
let tapeteReceptor1 = null;
let tapeteReceptor2 = null;
let tapeteReceptor3 = null;
let tapeteReceptor4 = null;

// Mazos
let mazoInicial = [];
let mazoSobrantes = [];
let mazoReceptor1 = [];
let mazoReceptor2 = [];
let mazoReceptor3 = [];
let mazoReceptor4 = [];

// Contadores de cartas (se inicializarán cuando el DOM esté listo)
let contInicial = null;
let contSobrantes = null;
let contReceptor1 = null;
let contReceptor2 = null;
let contReceptor3 = null;
let contReceptor4 = null;
let contMovimientos = null;

// Tiempo
let contTiempo = null; // span cuenta tiempo (se inicializará cuando el DOM esté listo)
let segundos = 0; // cuenta de segundos
let temporizador = null; // manejador del temporizador

/***** FIN DECLARACIÓN DE VARIABLES GLOBALES *****/

/***** INICIO FUNCIONES DE INICIALIZACIÓN Y EVENTOS *****/

/**
 * Función que se ejecuta cuando la página termina de cargar
 * Inicializa el juego y configura todos los eventos necesarios
 */
window.onload = function () {
  // PASO 1: Inicializar todas las referencias a elementos del DOM
  // Esto DEBE hacerse aquí porque el DOM ya está completamente cargado

  // Tapetes
  tapeteInicial = document.getElementById("inicial");
  tapeteSobrantes = document.getElementById("sobrantes");
  tapeteReceptor1 = document.getElementById("receptor1");
  tapeteReceptor2 = document.getElementById("receptor2");
  tapeteReceptor3 = document.getElementById("receptor3");
  tapeteReceptor4 = document.getElementById("receptor4");

  // Contadores de cartas
  contInicial = document.getElementById("contador_inicial");
  contSobrantes = document.getElementById("contador_sobrantes");
  contReceptor1 = document.getElementById("contador_receptor1");
  contReceptor2 = document.getElementById("contador_receptor2");
  contReceptor3 = document.getElementById("contador_receptor3");
  contReceptor4 = document.getElementById("contador_receptor4");
  contMovimientos = document.getElementById("contador_movimientos");

  // Tiempo
  contTiempo = document.getElementById("contador_tiempo");

  // PASO 2: Mostrar el año actual en el footer
  document.getElementById("anno_actual").textContent = new Date().getFullYear();

  // PASO 3: Iniciar el juego automáticamente
  comenzarJuego();

  // PASO 4: Configurar eventos de los botones de reinicio
  configurarEventosReinicio();

  // PASO 5: Configurar eventos de los modales
  configurarEventosModales();

  // PASO 6: Configurar eventos de Drag & Drop para los tapetes
  configurarEventosDragDrop();
};

/**
 * Configura los eventos de clic para todos los botones de reinicio
 * Hay dos botones: uno en el footer y otro en el modal de sin movimientos
 */
function configurarEventosReinicio() {
  // Obtener todos los botones con id "reset" (hay 2 en el HTML)
  let botonesReset = document.querySelectorAll("#reset");

  // Agregar evento de clic a cada botón de reset
  botonesReset.forEach(function (boton) {
    boton.addEventListener("click", function () {
      reiniciarJuego();
    });
  });

  // Botón de reinicio en el modal de victoria
  let botonVictoryReset = document.getElementById("victory_reset");
  botonVictoryReset.addEventListener("click", function () {
    reiniciarJuego();
  });
}

/**
 * Configura los eventos de los modales (cerrar con X)
 */
function configurarEventosModales() {
  // PASO 6: Configurar el evento para recoger el mazo cíclico (clic en tapete inicial vacío)
  tapeteInicial.addEventListener("click", function () {
    if (mazoInicial.length === 0 && mazoSobrantes.length > 0) {
      recogerMazo();
    }
  });

  // Evento para cerrar el modal de sin movimientos (X)
  let closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      document.getElementById("noMoves").style.display = "none";
    });
  }
}

/**
 * Pasa todas las cartas del mazo de sobrantes de vuelta al mazo inicial
 */
function recogerMazo() {
  // Las cartas de sobrantes pasan al inicial en orden inverso para mantener la pila
  while (mazoSobrantes.length > 0) {
    let carta = mazoSobrantes.pop();
    mazoInicial.push(carta);
    carta.setAttribute("data-mazo", "inicial");
  }

  // Limpiamos los tapetes y volvemos a cargar el inicial visualmente
  tapeteSobrantes.innerHTML = "";
  cargarTapeteInicial(mazoInicial);

  // Reset de contadores
  setContador(contSobrantes, 0);
  incContador(contMovimientos);
}

/**
 * Configura los eventos dragover y drop para los tapetes que pueden recibir cartas
 */
function configurarEventosDragDrop() {
  let receptores = [
    tapeteSobrantes,
    tapeteReceptor1,
    tapeteReceptor2,
    tapeteReceptor3,
    tapeteReceptor4,
  ];

  receptores.forEach((tapete) => {
    tapete.addEventListener("dragover", function (e) {
      e.preventDefault(); // Permitir el drop
    });

    tapete.addEventListener("drop", function (e) {
      e.preventDefault();

      let cartaArrastrada = document.querySelector(".dragging");
      if (!cartaArrastrada) return;

      let idTapeteDestino = tapete.id;
      let mazoOrigen = cartaArrastrada.getAttribute("data-mazo");

      // 1. Si soltamos en el mazo de SOBRANTES
      if (idTapeteDestino === "sobrantes") {
        if (mazoOrigen === "inicial") {
          moverDesdeInicial(cartaArrastrada);
        }
      }
      // 2. Si soltamos en un RECEPTOR (abajo)
      else if (tapete.classList.contains("receptor")) {
        // Obtenemos el palo de la carta para ver si es el receptor correcto
        let src = cartaArrastrada.src;
        let nombreArchivo = src.substring(src.lastIndexOf("/") + 1);
        let paloCarta = nombreArchivo.split("-")[1].replace(".png", "");
        let indiceCorrecto = palos.indexOf(paloCarta) + 1; // receptor1, receptor2...

        // Solo procesamos si el jugador soltó la carta exactamente en el mazo de su palo
        if (idTapeteDestino === "receptor" + indiceCorrecto) {
          if (mazoOrigen === "inicial") {
            // Permitir mover directo de Inicial a Receptor (mejor experiencia)
            moverDirectoAReceptor(cartaArrastrada, mazoOrigen);
          } else if (mazoOrigen === "sobrantes") {
            moverDesdeSobrantes(cartaArrastrada);
          }
        }
      }

      cartaArrastrada.classList.remove("dragging");
    });
  });
}

/**
 * Reinicia completamente el juego
 * Limpia todos los tapetes, detiene el temporizador y vuelve a comenzar
 */
function reiniciarJuego() {
  // Detener el temporizador si está corriendo
  if (temporizador) {
    clearInterval(temporizador);
    temporizador = null;
  }

  // Limpiar todos los tapetes
  tapeteInicial.innerHTML = "";
  tapeteSobrantes.innerHTML = "";
  tapeteReceptor1.innerHTML = "";
  tapeteReceptor2.innerHTML = "";
  tapeteReceptor3.innerHTML = "";
  tapeteReceptor4.innerHTML = "";

  // Vaciar todos los mazos
  mazoInicial = [];
  mazoSobrantes = [];
  mazoReceptor1 = [];
  mazoReceptor2 = [];
  mazoReceptor3 = [];
  mazoReceptor4 = [];

  // Ocultar modales si están visibles
  document.getElementById("noMoves").style.display = "none";
  document.getElementById("victory").style.display = "none";

  // Comenzar un nuevo juego
  comenzarJuego();
}

/***** FIN FUNCIONES DE INICIALIZACIÓN Y EVENTOS *****/

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

      // Formar el nombre del archivo según la estructura real: imagenes/baraja/numero-palo.png
      let nombreArchivo = "imagenes/baraja/" + numero + "-" + palo + ".png";

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
*/
function cargarTapeteInicial(mazo) {
  tapeteInicial.innerHTML = "";

  for (let i = 0; i < mazo.length; i++) {
    let carta = mazo[i];

    carta.style.width = "70px";
    carta.style.position = "absolute";
    carta.style.top = i * paso + "px";
    carta.style.left = i * paso + "px";
    carta.setAttribute("data-mazo", "inicial");

    // Habilitar arrastre
    carta.draggable = true;

    // Evento de clic (por si prefieres clic en lugar de arrastrar)
    carta.addEventListener("click", function (e) {
      e.stopPropagation(); // Evitar que el clic llegue al tapete debajo
      manejarClicCarta(carta);
    });

    // Eventos de Drag & Drop
    carta.addEventListener("dragstart", function (e) {
      // Solo dejamos arrastrar si es la carta de arriba
      if (esLaDeArriba(carta)) {
        e.dataTransfer.setData("text/plain", carta.src);
        carta.classList.add("dragging");
      } else {
        e.preventDefault(); // Bloquear arrastre de cartas de abajo
      }
    });

    carta.addEventListener("dragend", function (e) {
      carta.classList.remove("dragging");
    });

    tapeteInicial.appendChild(carta);
  }

  setContador(contInicial, mazo.length);
}

/**
 * Función auxiliar para saber si una carta es la que está encima de su mazo
 */
function esLaDeArriba(carta) {
  let mazoNombre = carta.getAttribute("data-mazo");
  if (mazoNombre === "inicial")
    return mazoInicial[mazoInicial.length - 1] === carta;
  if (mazoNombre === "sobrantes")
    return mazoSobrantes[mazoSobrantes.length - 1] === carta;
  return false;
}

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

/***** INICIO FUNCIONES DE MOVIMIENTO DE CARTAS *****/

/**
 * Maneja el clic en una carta
 * Determina desde qué mazo viene y hacia dónde puede ir
 *
 * @param {HTMLElement} carta - La carta que fue clickeada
 */
function manejarClicCarta(carta) {
  // Obtener el mazo de origen de la carta
  let mazoOrigen = carta.getAttribute("data-mazo");

  // Solo se pueden mover cartas del mazo inicial o sobrantes
  if (mazoOrigen === "inicial") {
    moverDesdeInicial(carta);
  } else if (mazoOrigen === "sobrantes") {
    moverDesdeSobrantes(carta);
  }
  // Las cartas en los receptores no se mueven (ya están en su lugar final)
}

/**
 * Mueve una carta desde el tapete inicial al tapete de sobrantes
 * Solo se puede mover la carta de arriba (la última del array)
 *
 * @param {HTMLElement} carta - La carta a mover
 */
function moverDesdeInicial(carta) {
  // Verificar que sea la última carta del mazo inicial (la de arriba)
  if (mazoInicial[mazoInicial.length - 1] !== carta) {
    return; // Solo se puede mover la carta de arriba
  }

  // Remover la carta del mazoInicial
  mazoInicial.pop(); // Eliminar la última carta del array

  // Agregar la carta al mazoSobrantes
  mazoSobrantes.push(carta);

  // Actualizar el atributo data-mazo
  carta.setAttribute("data-mazo", "sobrantes");

  // Mover visualmente la carta al tapete de sobrantes
  tapeteSobrantes.appendChild(carta);

  // Reposicionar la carta en el centro del tapete de sobrantes
  carta.style.top = "0px";
  carta.style.left = "0px";

  // Actualizar contadores
  decContador(contInicial);
  incContador(contSobrantes);
  incContador(contMovimientos);
}

/**
 * Mueve una carta desde el tapete de sobrantes a un receptor
 * Busca automáticamente el receptor correcto según el palo de la carta
 * Valida que el movimiento sea válido (orden correcto de números)
 *
 * @param {HTMLElement} carta - La carta a mover
 */
function moverDesdeSobrantes(carta) {
  // Verificar que sea la última carta del mazo de sobrantes
  if (mazoSobrantes[mazoSobrantes.length - 1] !== carta) {
    return; // Solo se puede mover la carta de arriba
  }

  // Obtener el palo de la carta desde el nombre del archivo
  // Ejemplo: "imagenes/baraja/9-viu.png" -> extraer "viu"
  let src = carta.src;
  let nombreArchivo = src.substring(src.lastIndexOf("/") + 1); // "9-viu.png"
  let palo = nombreArchivo.split("-")[1].replace(".png", ""); // "viu"

  // Determinar a qué receptor pertenece este palo
  let indiceReceptor = palos.indexOf(palo); // 0, 1, 2, o 3

  // Obtener el tapete, mazo y contador receptor correspondiente
  let tapeteDestino, mazoDestino, contadorDestino;

  switch (indiceReceptor) {
    case 0:
      tapeteDestino = tapeteReceptor1;
      mazoDestino = mazoReceptor1;
      contadorDestino = contReceptor1;
      break;
    case 1:
      tapeteDestino = tapeteReceptor2;
      mazoDestino = mazoReceptor2;
      contadorDestino = contReceptor2;
      break;
    case 2:
      tapeteDestino = tapeteReceptor3;
      mazoDestino = mazoReceptor3;
      contadorDestino = contReceptor3;
      break;
    case 3:
      tapeteDestino = tapeteReceptor4;
      mazoDestino = mazoReceptor4;
      contadorDestino = contReceptor4;
      break;
  }

  // Validar si el movimiento es válido
  if (!esMovimientoValido(carta, mazoDestino)) {
    // Movimiento inválido - no hacer nada
    // Podrías agregar un efecto visual aquí (shake, color rojo, etc.)
    return;
  }

  // Remover la carta del mazoSobrantes
  mazoSobrantes.pop();

  // Agregar la carta al mazo receptor
  mazoDestino.push(carta);

  // Actualizar el atributo data-mazo
  carta.setAttribute("data-mazo", "receptor" + (indiceReceptor + 1));

  // Mover visualmente la carta al tapete receptor
  tapeteDestino.appendChild(carta);

  // Posicionar la carta con desplazamiento según cuántas cartas hay
  let numCartas = mazoDestino.length - 1;
  carta.style.top = numCartas * paso + "px";
  carta.style.left = numCartas * paso + "px";

  // Actualizar contadores
  decContador(contSobrantes);
  incContador(contadorDestino);
  incContador(contMovimientos);

  // Verificar si el jugador ganó
  verificarVictoria();
}

/**
 * Valida si una carta puede ser colocada en un receptor
 * Las cartas deben colocarse en orden ascendente (9, 10, 11, 12)
 *
 * @param {HTMLElement} carta - La carta que se quiere mover
 * @param {Array} mazoDestino - El mazo receptor donde se quiere colocar
 * @returns {boolean} - true si el movimiento es válido, false si no
 */
function esMovimientoValido(carta, mazoDestino) {
  // Obtener el número de la carta desde el nombre del archivo
  // Ejemplo: "imagenes/baraja/9-viu.png" -> extraer "9"
  let src = carta.src;
  let nombreArchivo = src.substring(src.lastIndexOf("/") + 1); // "9-viu.png"
  let partes = nombreArchivo.split("-"); // ["9", "viu.png"]
  let numeroStr = partes[0]; // "9"
  let numero = parseInt(numeroStr); // 9

  // Si el receptor está vacío, solo se puede colocar el 9
  if (mazoDestino.length === 0) {
    return numero === numeros[0]; // Debe ser el primer número (9)
  }

  // Si el receptor tiene cartas, obtener el número de la última carta
  let ultimaCarta = mazoDestino[mazoDestino.length - 1];
  let srcUltima = ultimaCarta.src;
  let nombreUltima = srcUltima.substring(srcUltima.lastIndexOf("/") + 1);
  let partesUltima = nombreUltima.split("-");
  let numeroUltimaStr = partesUltima[0];
  let numeroUltima = parseInt(numeroUltimaStr);

  // La nueva carta debe ser el siguiente número en secuencia
  let indiceActual = numeros.indexOf(numeroUltima);
  let siguienteNumero = numeros[indiceActual + 1];

  return numero === siguienteNumero;
}

/**
 * Verifica si el jugador ha ganado
 * El jugador gana cuando los 4 receptores tienen 4 cartas cada uno (todas las cartas)
 */
function verificarVictoria() {
  // Verificar si cada receptor tiene todas sus cartas (4 cartas)
  let cantidadPorReceptor = numeros.length; // 4 cartas

  if (
    mazoReceptor1.length === cantidadPorReceptor &&
    mazoReceptor2.length === cantidadPorReceptor &&
    mazoReceptor3.length === cantidadPorReceptor &&
    mazoReceptor4.length === cantidadPorReceptor
  ) {
    // ¡Victoria! Detener el temporizador
    if (temporizador) {
      clearInterval(temporizador);
    }

    // Mostrar el modal de victoria
    setTimeout(() => {
      document.getElementById("victory").style.display = "block";
    }, 500); // Pequeño delay para que se vea la última carta colocada
  }
}

/**
 * Función especial para mover una carta de Inicial directamente a un Receptor
 * sin tener que pasar por sobrantes (si es un movimiento válido)
 */
function moverDirectoAReceptor(carta, origen) {
  // Extraer palo
  let src = carta.src;
  let nombreArchivo = src.substring(src.lastIndexOf("/") + 1);
  let palo = nombreArchivo.split("-")[1].replace(".png", "");
  let indiceReceptor = palos.indexOf(palo);

  let mazoDestino, tapeteDestino, contadorDestino;
  if (indiceReceptor === 0) {
    mazoDestino = mazoReceptor1;
    tapeteDestino = tapeteReceptor1;
    contadorDestino = contReceptor1;
  } else if (indiceReceptor === 1) {
    mazoDestino = mazoReceptor2;
    tapeteDestino = tapeteReceptor2;
    contadorDestino = contReceptor2;
  } else if (indiceReceptor === 2) {
    mazoDestino = mazoReceptor3;
    tapeteDestino = tapeteReceptor3;
    contadorDestino = contReceptor3;
  } else if (indiceReceptor === 3) {
    mazoDestino = mazoReceptor4;
    tapeteDestino = tapeteReceptor4;
    contadorDestino = contReceptor4;
  }

  if (esMovimientoValido(carta, mazoDestino)) {
    mazoInicial.pop();
    mazoDestino.push(carta);
    carta.setAttribute("data-mazo", "receptor" + (indiceReceptor + 1));
    tapeteDestino.appendChild(carta);

    let num = mazoDestino.length - 1;
    carta.style.top = num * paso + "px";
    carta.style.left = num * paso + "px";

    decContador(contInicial);
    incContador(contadorDestino);
    incContador(contMovimientos);
    verificarVictoria();
  }
}

/***** FIN FUNCIONES DE MOVIMIENTO DE CARTAS *****/
