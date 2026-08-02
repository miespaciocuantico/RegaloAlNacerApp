/**
 * REGALO AL NACER - Módulo de cálculo completo
 * ------------------------------------------------------------
 * No requiere IA ni llamadas externas: es aritmética + tabla de fechas.
 * Pégalo tal cual en Replit y llama a calcularReporteBebe(nombreCompleto, fechaNacimiento)
 *
 * Devuelve:
 *  DEL DÍA/MES/AÑO (reducción con números maestros 11, 22, 33):
 *   - alma            -> día de nacimiento reducido
 *   - personalidad     -> mes de nacimiento reducido
 *   - regalo           -> últimos 2 dígitos del año, sumados y reducidos
 *   - retos            -> los 4 dígitos del año, sumados y reducidos
 *   - mision           -> día + mes + año, todos los dígitos sumados y reducidos
 *
 *  DEL NOMBRE (reducción simple a un solo dígito 1-9, SIN números maestros):
 *   - deseosDelSer         -> suma de vocales
 *   - personalidadExterna  -> suma de consonantes
 *   - personalidadPropia   -> suma de todas las letras
 *   - potenciador          -> 2 x (suma de todas las letras), reducido
 *
 *  SOL:
 *   - signoSolar -> signo zodiacal por rango de fecha
 */

// ---------------------------------------------------------------
// TABLA DE LETRAS (sistema pitagórico). La ñ se trata como n.
// ---------------------------------------------------------------
const TABLA_LETRAS = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, ñ: 5, // ñ = n
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOCALES = new Set(["a", "e", "i", "o", "u"]);
const NUMEROS_MAESTROS = new Set([11, 22, 33]);

// ---------------------------------------------------------------
// UTILIDADES DE REDUCCIÓN
// ---------------------------------------------------------------

/**
 * Reduce sumando dígitos hasta llegar a un rango 1-11, respetando
 * los números maestros 11, 22, 33 (se detiene ahí sin seguir reduciendo).
 * Se usa para TODOS los cálculos de fecha (alma, personalidad, regalo, retos, misión).
 */
// Reducción para MISIÓN ÚNICAMENTE: respeta 11, 22 y 33 como maestros.
function reducirConMaestros(numero) {
  while (numero > 11 && !NUMEROS_MAESTROS.has(numero)) {
    numero = sumarDigitos(numero);
  }
  return numero;
}

// Reducción para Alma, Personalidad, Regalo y Retos: SOLO el 11 se respeta
// como maestro. El 22 y el 33 NUNCA son válidos fuera de Misión, así que
// aquí se siguen reduciendo hasta quedar en el rango 1-11.
function reducirEstricta(numero) {
  while (numero > 11) {
    numero = sumarDigitos(numero);
  }
  return numero;
}

/**
 * Reduce sumando dígitos hasta llegar a un solo dígito (1-9), SIN excepción
 * de números maestros. Se usa solo para los cálculos del NOMBRE.
 */
function reducirSimple(numero) {
  while (numero > 9) {
    numero = sumarDigitos(numero);
  }
  return numero;
}

function sumarDigitos(numero) {
  return String(numero)
    .split("")
    .reduce((suma, digito) => suma + Number(digito), 0);
}

/**
 * Normaliza el nombre: quita acentos, pasa a minúsculas, deja solo letras a-z y ñ
 */
function normalizarNombre(nombreCompleto) {
  return nombreCompleto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos (José -> Jose), OJO: esto también quita la tilde de ñ, se corrige abajo
    .toLowerCase()
    .replace(/[^a-zñ]/g, ""); // deja solo letras a-z y ñ
}

// ---------------------------------------------------------------
// CÁLCULOS DE FECHA
// ---------------------------------------------------------------

function obtenerPartesFecha(fechaNacimiento) {
  const fecha = new Date(fechaNacimiento);
  return {
    dia: fecha.getUTCDate(),
    mes: fecha.getUTCMonth() + 1,
    anio: fecha.getUTCFullYear(),
  };
}

// Alma = día de nacimiento, reducido con maestros
function calcularAlma(fechaNacimiento) {
  const { dia } = obtenerPartesFecha(fechaNacimiento);
  return reducirEstricta(dia);
}

// Personalidad = mes de nacimiento, reducido con maestros
function calcularPersonalidad(fechaNacimiento) {
  const { mes } = obtenerPartesFecha(fechaNacimiento);
  return reducirEstricta(mes);
}

// Regalo = últimos 2 dígitos del año, sumados y reducidos con maestros
function calcularRegalo(fechaNacimiento) {
  const { anio } = obtenerPartesFecha(fechaNacimiento);
  const ultimosDosDigitos = anio % 100; // ej. 1974 -> 74, 2011 -> 11
  return reducirEstricta(ultimosDosDigitos);
}

// Retos / "Camino de Crecimiento" = los 4 dígitos del año, sumados.
// El 22 y el 33 NO son válidos aquí (ej. 1993, 1984... suman 22),
// por eso se usa reducción estricta (solo respeta el 11).
function calcularRetos(fechaNacimiento) {
  const { anio } = obtenerPartesFecha(fechaNacimiento);
  const sumaInicial = sumarDigitos(anio); // ej. 1974 -> 1+9+7+4 = 21
  return reducirEstricta(sumaInicial);
}

// Misión = día + mes + año, TODOS los dígitos juntos, sumados y reducidos con maestros
function calcularMision(fechaNacimiento) {
  const { dia, mes, anio } = obtenerPartesFecha(fechaNacimiento);
  const todosLosDigitos = `${dia}${mes}${anio}`;
  const sumaInicial = sumarDigitos(Number(todosLosDigitos.split("").join("")));
  // sumamos dígito por dígito directamente por seguridad:
  const suma = `${dia}${mes}${anio}`
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
  return reducirConMaestros(suma);
}

// ---------------------------------------------------------------
// CÁLCULOS DE NOMBRE (reducción simple, sin maestros)
// ---------------------------------------------------------------

function valorDeLetra(letra) {
  return TABLA_LETRAS[letra] || 0;
}

// Deseos del Ser = suma de vocales, reducida simple
function calcularDeseosDelSer(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const suma = nombre
    .split("")
    .filter((letra) => VOCALES.has(letra))
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(suma);
}

// Personalidad vista por los demás = suma de consonantes, reducida simple
function calcularPersonalidadExterna(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const suma = nombre
    .split("")
    .filter((letra) => !VOCALES.has(letra))
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(suma);
}

// Personalidad propia (cómo me veo yo) = suma de TODAS las letras, reducida simple
function calcularPersonalidadPropia(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const suma = nombre
    .split("")
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(suma);
}

// Potenciador = 2 x (suma de todas las letras), reducido simple
function calcularPotenciador(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const sumaTotal = nombre
    .split("")
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(sumaTotal * 2);
}

// ---------------------------------------------------------------
// SIGNO SOLAR (tabla fija de rangos, sin cálculo astronómico)
// ---------------------------------------------------------------

const RANGOS_ZODIACO = [
  { signo: "Capricornio", inicio: [12, 22], fin: [1, 19] },
  { signo: "Acuario", inicio: [1, 20], fin: [2, 18] },
  { signo: "Piscis", inicio: [2, 19], fin: [3, 20] },
  { signo: "Aries", inicio: [3, 21], fin: [4, 19] },
  { signo: "Tauro", inicio: [4, 20], fin: [5, 20] },
  { signo: "Géminis", inicio: [5, 21], fin: [6, 20] },
  { signo: "Cáncer", inicio: [6, 21], fin: [7, 22] },
  { signo: "Leo", inicio: [7, 23], fin: [8, 22] },
  { signo: "Virgo", inicio: [8, 23], fin: [9, 22] },
  { signo: "Libra", inicio: [9, 23], fin: [10, 22] },
  { signo: "Escorpio", inicio: [10, 23], fin: [11, 21] },
  { signo: "Sagitario", inicio: [11, 22], fin: [12, 21] },
];

function calcularSignoSolar(fechaNacimiento) {
  const { dia, mes } = obtenerPartesFecha(fechaNacimiento);
  const valor = mes * 100 + dia; // ej. 14 de marzo -> 314

  for (const rango of RANGOS_ZODIACO) {
    const [mesInicio, diaInicio] = rango.inicio;
    const [mesFin, diaFin] = rango.fin;
    const valorInicio = mesInicio * 100 + diaInicio;
    const valorFin = mesFin * 100 + diaFin;

    if (valorInicio > valorFin) {
      // caso Capricornio: cruza fin de año (22 dic - 19 ene)
      if (valor >= valorInicio || valor <= valorFin) return rango.signo;
    } else {
      if (valor >= valorInicio && valor <= valorFin) return rango.signo;
    }
  }
  return null; // no debería pasar nunca
}

// ---------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------

/**
 * @param {string} nombreCompleto - nombre completo del bebé
 * @param {string} fechaNacimiento - formato 'YYYY-MM-DD'
 * @returns {object} reporte numerológico + signo solar completo
 */
function calcularReporteBebe(nombreCompleto, fechaNacimiento) {
  return {
    // Del nombre y la fecha
    fecha: {
      alma: calcularAlma(fechaNacimiento),
      personalidad: calcularPersonalidad(fechaNacimiento),
      regalo: calcularRegalo(fechaNacimiento),
      retos: calcularRetos(fechaNacimiento),
      mision: calcularMision(fechaNacimiento),
    },
    nombre: {
      deseosDelSer: calcularDeseosDelSer(nombreCompleto),
      personalidadExterna: calcularPersonalidadExterna(nombreCompleto),
      personalidadPropia: calcularPersonalidadPropia(nombreCompleto),
      potenciador: calcularPotenciador(nombreCompleto),
    },
    signoSolar: calcularSignoSolar(fechaNacimiento),
  };
}

module.exports = { calcularReporteBebe };

// ---- Ejemplo de uso ----
// const reporte = calcularReporteBebe("María José Núñez", "1974-03-14");
// console.log(reporte);
