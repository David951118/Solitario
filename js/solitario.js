/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/

// Array de palos
let palos = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
//let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// En las pruebas iniciales solo se trabajará con cuatro cartas por palo:
let numeros = [9, 10, 11, 12];

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
 */
function configurarEventosReinicio() {
  let botonesReset = document.querySelectorAll("#reset");

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
 * Y las BARAJA automáticamente (Requisito: Mazo cíclico aleatorio)
 */
function recogerMazo() {
  // 1. Barajar las cartas que están en sobrantes
  barajar(mazoSobrantes);

  // 2. Moverlas a inicial
  while (mazoSobrantes.length > 0) {
    let carta = mazoSobrantes.pop();
    mazoInicial.push(carta);
    carta.setAttribute("data-mazo", "inicial");
  }

  // 3. Limpiar tapete y renderizar de nuevo
  limpiarTapete(tapeteSobrantes);
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
      // 2. Si soltamos en un RECEPTOR
      else if (tapete.classList.contains("receptor")) {
        // Obtener el mazo correspondiente al tapete
        let mazoDestino = getMazoDesdeTapete(idTapeteDestino);

        // Verificar validez (esMovimientoValido ahora validará el palo también)
        if (esMovimientoValido(cartaArrastrada, mazoDestino)) {
          if (mazoOrigen === "inicial") {
            moverDirectoAReceptor(cartaArrastrada, idTapeteDestino);
          } else if (mazoOrigen === "sobrantes") {
            moverDesdeSobrantes(cartaArrastrada, idTapeteDestino);
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

/**
 * Helper para limpiar cartas de un tapete sin borrar el contador
 */
function limpiarTapete(tapete) {
  // Eliminar todas las imagenes (cartas)
  let cartas = tapete.querySelectorAll("img");
  cartas.forEach((c) => c.remove());
}

/**
 * Reinicia completamente el juego
 */
function reiniciarJuego() {
  if (temporizador) {
    clearInterval(temporizador);
    temporizador = null;
  }

  // Limpiar cartas de todos los tapetes (manteniendo los contadores)
  limpiarTapete(tapeteInicial);
  limpiarTapete(tapeteSobrantes);
  limpiarTapete(tapeteReceptor1);
  limpiarTapete(tapeteReceptor2);
  limpiarTapete(tapeteReceptor3);
  limpiarTapete(tapeteReceptor4);

  // Vaciar arrays
  mazoInicial = [];
  mazoSobrantes = [];
  mazoReceptor1 = [];
  mazoReceptor2 = [];
  mazoReceptor3 = [];
  mazoReceptor4 = [];

  document.getElementById("noMoves").style.display = "none";
  document.getElementById("victory").style.display = "none";

  comenzarJuego();
}

/***** FIN FUNCIONES DE INICIALIZACIÓN Y EVENTOS *****/

// Desarrollo del comienzo de juego
function comenzarJuego() {
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

function arrancarTiempo() {
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

function cargarTapeteInicial(mazo) {
  // Limpiar cartas anteriores pero mantener el contador
  limpiarTapete(tapeteInicial);

  for (let i = 0; i < mazo.length; i++) {
    let carta = mazo[i];

    carta.style.width = "70px";
    carta.style.position = "absolute";
    carta.style.top = i * paso + "px";
    carta.style.left = i * paso + "px";
    carta.style.transform = "";
    carta.setAttribute("data-mazo", "inicial");

    // Habilitar arrastre
    carta.draggable = true;

    // Evento de clic
    carta.addEventListener("click", function (e) {
      e.stopPropagation();
      manejarClicCarta(carta);
    });

    // Eventos de Drag & Drop
    carta.addEventListener("dragstart", function (e) {
      if (esLaDeArriba(carta)) {
        e.dataTransfer.setData("text/plain", carta.src);
        carta.classList.add("dragging");
      } else {
        e.preventDefault();
      }
    });

    carta.addEventListener("dragend", function (e) {
      carta.classList.remove("dragging");
    });

    tapeteInicial.appendChild(carta);
  }

  setContador(contInicial, mazo.length);
}

function esLaDeArriba(carta) {
  let mazoNombre = carta.getAttribute("data-mazo");
  if (mazoNombre === "inicial")
    return mazoInicial[mazoInicial.length - 1] === carta;
  if (mazoNombre === "sobrantes")
    return mazoSobrantes[mazoSobrantes.length - 1] === carta;
  return false;
}

function incContador(contador) {
  // Obtener el valor actual del contador (es texto, lo convertimos a número)
  let valorActual = parseInt(contador.textContent);
  // Sumar 1 al valor
  let nuevoValor = valorActual + 1;
  // Actualizar el texto del contador con el nuevo valor
  contador.textContent = nuevoValor;
} // incContador

function decContador(contador) {
  // Obtener el valor actual del contador
  let valorActual = parseInt(contador.textContent);
  // Restar 1 al valor
  let nuevoValor = valorActual - 1;
  // Actualizar el texto del contador
  contador.textContent = nuevoValor;
} // decContador

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

  // REGLA: "qu no haga automovimientos"
  // Solo permitimos clic en INICIAL para pasar a SOBRANTES (dealing)
  if (mazoOrigen === "inicial") {
    moverDesdeInicial(carta);
  }
  // Si es sobrantes, NO HACEMOS NADA. El usuario debe arrastrar.
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
  carta.style.top = "50%";
  carta.style.left = "50%";
  carta.style.transform = "translate(-50%, -50%)";

  // Actualizar contadores
  decContador(contInicial);
  incContador(contSobrantes);
  incContador(contMovimientos);
}

/**
 * Mueve una carta desde sobrantes a un receptor específico
 * (Adapada para Drag & Drop dinámico)
 */
function moverDesdeSobrantes(carta, idReceptorDestino) {
  // Validar origen
  if (mazoSobrantes[mazoSobrantes.length - 1] !== carta) return;

  // Obtener info del receptor destino
  let infoDestino;
  if (idReceptorDestino) {
    infoDestino = getInfoReceptor(idReceptorDestino);
  } else {
    // Si no se especifica (esto era para el autocompletado antiguo), no hacemos nada
    return;
  }

  // Ejecutar movimiento
  mazoSobrantes.pop();
  infoDestino.mazo.push(carta);

  carta.setAttribute("data-mazo", infoDestino.id);
  infoDestino.tapete.appendChild(carta);

  // RESETEO NUCLEAR DE ESTILOS
  // Usamos cssText para sobrescribir todo de una sola vez
  let numCartasDestino = infoDestino.mazo.length - 1; // Assuming this is the intended value for positioning
  let topPx = numCartasDestino * paso;
  let leftPx = numCartasDestino * paso;

  carta.style.cssText = `width: 70px; position: absolute; top: ${topPx}px; left: ${leftPx}px; transform: none !important; margin: 0; padding: 0;`;

  decContador(contSobrantes);
  incContador(infoDestino.contador);
  incContador(contMovimientos);

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
/**
 * Helper: Extrae información clave de la carta
 */
function getInfoCarta(carta) {
  let src = carta.src;
  let nombreArchivo = src.substring(src.lastIndexOf("/") + 1); // "12-viu.png"
  let partes = nombreArchivo.split("-");
  let numero = parseInt(partes[0]);
  let palo = partes[1].replace(".png", "");

  // Naranja: viu, cua | Gris: hex, cir
  let color = palo === "viu" || palo === "cua" ? "naranja" : "gris"; // Revisar si viu/cua son naranjas
  // Segun enunciado: "los dos primeros son narajas y lso otros sion grises" -> viu, cua = naranja

  return { numero, palo, color };
}

/**
 * Valida si una carta puede ir al mazo destino
 * Regla: Decreciente (12->1) y Alternando Color
 */
function esMovimientoValido(carta, mazoDestino) {
  let infoCarta = getInfoCarta(carta);

  // 1. Si está vacío, solo admite el 12
  if (mazoDestino.length === 0) {
    return infoCarta.numero === 12;
  }

  // 2. Si no está vacío
  let ultimaCarta = mazoDestino[mazoDestino.length - 1];
  let infoUltima = getInfoCarta(ultimaCarta);

  // Orden Decreciente: La carta en el tapete (infoUltima) debe ser mayor por 1
  // Ejemplo: En tapete hay un 12. Quiero poner un 11. 12 == 11 + 1 ? Si.
  let esDecreciente = infoUltima.numero === infoCarta.numero + 1;

  // Color Alterno
  let esColorDistinto = infoUltima.color !== infoCarta.color;

  return esDecreciente && esColorDistinto;
}

/**
 * Verifica Victoria: Si no quedan cartas en MazoInicial ni Sobrantes
 */
function verificarVictoria() {
  if (mazoInicial.length === 0 && mazoSobrantes.length === 0) {
    if (temporizador) clearInterval(temporizador);
    setTimeout(() => {
      document.getElementById("victory").style.display = "block";
    }, 500);
  }
}

/**
 * Mueve carta directamente al receptor (usado en Drag & Drop)
 */
function moverDirectoAReceptor(
  carta,
  mazoDestino,
  tapeteDestino,
  contadorDestino,
) {
  mazoInicial.pop();
  mazoDestino.push(carta);
  carta.setAttribute("data-mazo", tapeteDestino.id);
  tapeteDestino.appendChild(carta);

  let num = mazoDestino.length - 1;
  carta.style.top = num * paso + "px";
  carta.style.left = num * paso + "px";
  carta.style.transform = "none";

  decContador(contInicial);
  incContador(contadorDestino);
  incContador(contMovimientos);
  verificarVictoria();
}
/**
 * Configura los eventos dragover y drop para permitir mover a cualquier receptor válido
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

      // 1. Soltar en SOBRANTES (solo desde Inicial)
      if (idTapeteDestino === "sobrantes") {
        if (mazoOrigen === "inicial") {
          moverDesdeInicial(cartaArrastrada);
        }
      }
      // 2. Soltar en CUALQUIER RECEPTOR
      else if (tapete.classList.contains("receptor")) {
        // Identificar variables del destino
        let mazoDestino, contadorDestino;
        if (idTapeteDestino === "receptor1") {
          mazoDestino = mazoReceptor1;
          contadorDestino = contReceptor1;
        } else if (idTapeteDestino === "receptor2") {
          mazoDestino = mazoReceptor2;
          contadorDestino = contReceptor2;
        } else if (idTapeteDestino === "receptor3") {
          mazoDestino = mazoReceptor3;
          contadorDestino = contReceptor3;
        } else if (idTapeteDestino === "receptor4") {
          mazoDestino = mazoReceptor4;
          contadorDestino = contReceptor4;
        }

        // Verificar si el movimiento es legal en ESTE receptor
        if (esMovimientoValido(cartaArrastrada, mazoDestino)) {
          // Ejecutar movimiento
          if (mazoOrigen === "inicial") {
            moverDirectoAReceptor(
              cartaArrastrada,
              mazoDestino,
              tapete,
              contadorDestino,
            );
          } else if (mazoOrigen === "sobrantes") {
            // Lógica manual de movimiento desde sobrantes
            mazoSobrantes.pop();
            mazoDestino.push(cartaArrastrada);
            cartaArrastrada.setAttribute("data-mazo", idTapeteDestino);
            tapete.appendChild(cartaArrastrada);
            // Posicionar
            let num = mazoDestino.length - 1;
            cartaArrastrada.style.top = num * paso + "px";
            cartaArrastrada.style.left = num * paso + "px";

            decContador(contSobrantes);
            incContador(contadorDestino);
            incContador(contMovimientos);
            verificarVictoria();
          }
        }
      }

      cartaArrastrada.classList.remove("dragging");
    });
  });
}

/***** FIN FUNCIONES DE MOVIMIENTO DE CARTAS *****/
