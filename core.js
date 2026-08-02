/**
 * REGALO AL NACER - Módulo de cálculo (versión navegador)
 * ------------------------------------------------------------
 * Aritmética pura + tabla de fechas. Sin dependencias externas.
 * Expone window.NumerologiaCore con calcularReporteBebe(nombre, apellidos, fechaNacimiento)
 */

const TABLA_LETRAS = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, ñ: 5, // ñ = n (mismo valor)
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOCALES = new Set(["a", "e", "i", "o", "u"]);
const NUMEROS_MAESTROS = new Set([11, 22, 33]);

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

function normalizarNombre(texto) {
  return texto
    .replace(/ñ/gi, "\u0001") // protege la Ñ antes de quitar acentos (si no, se convierte en N)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0001/g, "ñ")
    .toLowerCase()
    .replace(/[^a-zñ]/g, "");
}

function obtenerPartesFecha(fechaNacimiento) {
  const fecha = new Date(fechaNacimiento + "T00:00:00Z");
  return {
    dia: fecha.getUTCDate(),
    mes: fecha.getUTCMonth() + 1,
    anio: fecha.getUTCFullYear(),
  };
}

function calcularAlma(fechaNacimiento) {
  const { dia } = obtenerPartesFecha(fechaNacimiento);
  return reducirEstricta(dia);
}

function calcularPersonalidad(fechaNacimiento) {
  const { mes } = obtenerPartesFecha(fechaNacimiento);
  return reducirEstricta(mes);
}

function calcularRegalo(fechaNacimiento) {
  const { anio } = obtenerPartesFecha(fechaNacimiento);
  const ultimosDosDigitos = anio % 100;
  return reducirEstricta(ultimosDosDigitos);
}

// Retos / "Camino de Crecimiento": el 22 y el 33 NO son válidos aquí
// (ej. años como 1993, 1984... suman 22), por eso se usa reducción estricta.
function calcularRetos(fechaNacimiento) {
  const { anio } = obtenerPartesFecha(fechaNacimiento);
  const sumaInicial = sumarDigitos(anio);
  return reducirEstricta(sumaInicial);
}

function calcularMision(fechaNacimiento) {
  const { dia, mes, anio } = obtenerPartesFecha(fechaNacimiento);
  const suma = `${dia}${mes}${anio}`
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
  return reducirConMaestros(suma);
}

function valorDeLetra(letra) {
  return TABLA_LETRAS[letra] || 0;
}

function calcularDeseosDelSer(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const suma = nombre
    .split("")
    .filter((letra) => VOCALES.has(letra))
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(suma);
}

function calcularPersonalidadExterna(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const suma = nombre
    .split("")
    .filter((letra) => !VOCALES.has(letra))
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(suma);
}

function calcularPersonalidadPropia(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const suma = nombre
    .split("")
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(suma);
}

function calcularPotenciador(nombreCompleto) {
  const nombre = normalizarNombre(nombreCompleto);
  const sumaTotal = nombre
    .split("")
    .reduce((acc, letra) => acc + valorDeLetra(letra), 0);
  return reducirSimple(sumaTotal * 2);
}

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
  const valor = mes * 100 + dia;

  for (const rango of RANGOS_ZODIACO) {
    const [mesInicio, diaInicio] = rango.inicio;
    const [mesFin, diaFin] = rango.fin;
    const valorInicio = mesInicio * 100 + diaInicio;
    const valorFin = mesFin * 100 + diaFin;

    if (valorInicio > valorFin) {
      if (valor >= valorInicio || valor <= valorFin) return rango.signo;
    } else {
      if (valor >= valorInicio && valor <= valorFin) return rango.signo;
    }
  }
  return null;
}

function capitalizarPalabras(texto) {
  return texto
    .trim()
    .split(/\s+/)
    .map(palabra => palabra.charAt(0).toLocaleUpperCase('es') + palabra.slice(1).toLocaleLowerCase('es'))
    .join(' ');
}

/**
 * @param {string} nombre - primer nombre (o nombres) del bebé, para personalizar textos
 * @param {string} apellidos - apellidos del bebé
 * @param {string} fechaNacimiento - formato 'YYYY-MM-DD'
 */
function calcularReporteBebe(nombre, apellidos, fechaNacimiento) {
  const nombreCompleto = `${nombre} ${apellidos}`.trim();
  return {
    nombrePila: capitalizarPalabras(nombre),
    nombreCompleto,
    fechaNacimiento,
    fecha: {
      alma: calcularAlma(fechaNacimiento),
      personalidad: calcularPersonalidad(fechaNacimiento),
      regalo: calcularRegalo(fechaNacimiento),
      retos: calcularRetos(fechaNacimiento),
      mision: calcularMision(fechaNacimiento),
    },
    nombreNumerologia: {
      formaDeSer: calcularPersonalidadPropia(nombreCompleto),
      deseosDelSer: calcularDeseosDelSer(nombreCompleto),
      comoLoPercibiran: calcularPersonalidadExterna(nombreCompleto),
      potenciador: calcularPotenciador(nombreCompleto),
    },
    signoSolar: calcularSignoSolar(fechaNacimiento),
  };
}

window.NumerologiaCore = { calcularReporteBebe };
