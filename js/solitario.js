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
    carta.style.transform = "";
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
  carta.style.top = "50%";
  carta.style.left = "50%";
  carta.style.transform = "translate(-50%, -50%)";

  // Actualizar contadores
  decContador(contInicial);
  incContador(contSobrantes);
  incContador(contMovimientos);
}

/**
 * Mueve una carta desde el tapete de sobrantes a un receptor
 * Si se especifica destinoId, intenta mover a ese receptor.
 * Si no, busca automáticamente el mejor receptor.
 *
 * @param {HTMLElement} carta - La carta a mover
 * @param {string} [destinoId] - ID del tapete destino (opcional)
 */
function moverDesdeSobrantes(carta, destinoId = null) {
  // Verificar que sea la última carta del mazo de sobrantes
  if (mazoSobrantes[mazoSobrantes.length - 1] !== carta) {
    return;
  }

  // Determinar el destino
  let infoDestino = null;

  if (destinoId) {
    // Si hay un destino explícito (drag & drop)
    infoDestino = getInfoReceptor(destinoId);
    if (!esMovimientoValido(carta, infoDestino.mazo)) return;
  } else {
    // Automático (clic): Buscar el mejor receptor
    infoDestino = buscarReceptorParaCarta(carta);
    if (!infoDestino) return; // No hay movimiento válido
  }

  // Ejecutar movimiento
  let { tapete, mazo, contador, id } = infoDestino;

  // Remover de sobrantes
  mazoSobrantes.pop();

  // Agregar al receptor
  mazo.push(carta);

  // Actualizar atributo
  carta.setAttribute("data-mazo", id);

  // Mover visualmente
  tapete.appendChild(carta);

  // Posicionar
  let numCartas = mazo.length - 1;
  carta.style.top = numCartas * paso + "px";
  carta.style.left = numCartas * paso + "px";
  carta.style.transform = "";

  // Actualizar contadores
  decContador(contSobrantes);
  incContador(contador);
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
function esMovimientoValido(carta, mazoDestino) {
  // Obtener el número de la carta desde el nombre del archivo
  // Ejemplo: "imagenes/baraja/9-viu.png" -> extraer "9"
  let src = carta.src;
  let nombreArchivo = src.substring(src.lastIndexOf("/") + 1); // "9-viu.png"
  let partes = nombreArchivo.split("-"); // ["9", "viu.png"]
  let numeroStr = partes[0]; // "9"
  let numero = parseInt(numeroStr); // 9

  // Si el receptor está vacío, solo se puede colocar el 9 (en este caso el 1/As si numeros[0] es 1)
  if (mazoDestino.length === 0) {
    return numero === numeros[0];
  }

  // Si tiene cartas, obtener la última para comparar palo y número
  let ultimaCarta = mazoDestino[mazoDestino.length - 1];
  let infoUltima = obtenerInfoCarta(ultimaCarta);
  let infoNueva = obtenerInfoCarta(carta);

  // 1. Validar PALO: Debe ser el mismo palo
  if (infoUltima.palo !== infoNueva.palo) return false;

  // 2. Validar NÚMERO: Debe ser consecutivo
  let indiceActual = numeros.indexOf(infoUltima.numero);
  if (indiceActual === -1) return false; // Error inesperado

  let siguienteNumero = numeros[indiceActual + 1];
  return infoNueva.numero === siguienteNumero;
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

function moverDirectoAReceptor(carta, destinoId) {
  // Solo se puede mover la de arriba
  if (!esLaDeArriba(carta)) return;

  // Si viene de drag & drop, destinoId está definido.
  let infoDestino = getInfoReceptor(destinoId);

  // Validar movimiento
  if (esMovimientoValido(carta, infoDestino.mazo)) {
    // Ejecutar movimiento
    mazoInicial.pop();
    infoDestino.mazo.push(carta);
    carta.setAttribute("data-mazo", infoDestino.id);
    infoDestino.tapete.appendChild(carta);

    let num = infoDestino.mazo.length - 1;
    carta.style.top = num * paso + "px";
    carta.style.left = num * paso + "px";

    decContador(contInicial);
    incContador(infoDestino.contador);
    incContador(contMovimientos);
    verificarVictoria();
  }
}

/**
 * Utilería para obtener info de una carta (palo y número) desde su src
 */
function obtenerInfoCarta(carta) {
  let src = carta.src;
  let nombreArchivo = src.substring(src.lastIndexOf("/") + 1);
  let partes = nombreArchivo.split("-");
  return {
    numero: parseInt(partes[0]),
    palo: partes[1].replace(".png", "")
  };
}

/**
 * Obtiene el objeto mazo array a partir del ID del tapete
 */
function getMazoDesdeTapete(idTapete) {
  return getInfoReceptor(idTapete).mazo;
}

/**
 * Obtiene referencia al tapete, mazo y contador a partir de un ID (receptor1, etc)
 */
function getInfoReceptor(id) {
  switch (id) {
    case "receptor1": return { id: "receptor1", tapete: tapeteReceptor1, mazo: mazoReceptor1, contador: contReceptor1 };
    case "receptor2": return { id: "receptor2", tapete: tapeteReceptor2, mazo: mazoReceptor2, contador: contReceptor2 };
    case "receptor3": return { id: "receptor3", tapete: tapeteReceptor3, mazo: mazoReceptor3, contador: contReceptor3 };
    case "receptor4": return { id: "receptor4", tapete: tapeteReceptor4, mazo: mazoReceptor4, contador: contReceptor4 };
    default: return null;
  }
}

/**
 * Busca un receptor válido para una carta dada (auto-move)
 */
function buscarReceptorParaCarta(carta) {
  let infoCarta = obtenerInfoCarta(carta);

  // 1. Buscar si ya hay un mazo con ese palo
  // Iteramos receptores 1 a 4
  for (let i = 1; i <= 4; i++) {
    let info = getInfoReceptor("receptor" + i);
    if (info.mazo.length > 0) {
      let ultima = info.mazo[info.mazo.length - 1];
      let infoUltima = obtenerInfoCarta(ultima);
      // Si coincide el palo
      if (infoUltima.palo === infoCarta.palo) {
        // Verificar si el número es el siguiente
        if (esMovimientoValido(carta, info.mazo)) return info;
      }
    }
  }

  // 2. Si no encontramos palo existente, buscar vacíos (Solo si es As)
  if (infoCarta.numero === numeros[0]) {
    for (let i = 1; i <= 4; i++) {
      let info = getInfoReceptor("receptor" + i);
      if (info.mazo.length === 0) return info;
    }
  }

  return null;
}

/***** FIN FUNCIONES DE MOVIMIENTO DE CARTAS *****/
