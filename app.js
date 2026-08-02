/**
 * REGALO AL NACER — app.js
 * Maneja navegación entre pantallas, formularios, persistencia en
 * localStorage, y el renderizado de los reportes / resumen / álbum
 * usando los cálculos de core.js
 *
 * ⚠️ IMPORTANTE PARA REPLIT / BACKEND:
 * La función generarInterpretacionIA() de más abajo es un STUB (texto de
 * ejemplo) para poder ver el diseño funcionando sin backend.
 * En producción, esta función debe llamar a un endpoint propio del
 * servidor (NO directo desde el navegador) que a su vez llame a la API
 * de Claude/OpenAI con la API key guardada del lado del servidor.
 * Nunca expongas la API key en este archivo del navegador.
 *
 * PERSISTENCIA: los datos del bebé se guardan en localStorage bajo la
 * llave "regaloAlNacer_datosBebe", para que al reabrir la app en el
 * mismo dispositivo el reporte siga disponible sin volver a capturarlo.
 */

const LLAVE_STORAGE = 'regaloAlNacer_datosBebe';
const DIAS_ESPERA_ALBUM = 7;

let datosBebe = null;       // resultado de Iniciar (persistido en localStorage)
let datosCronos = null;     // resultado de Cronos (2 fechas, no se persiste)

// Símbolos zodiacales en modo "texto" (U+FE0E), no emoji a color,
// para que se vean como símbolo tipográfico y no como emoji de caricatura.
const SIGNO_EMOJI = {
  'Aries': '♈\uFE0E', 'Tauro': '♉\uFE0E', 'Géminis': '♊\uFE0E', 'Cáncer': '♋\uFE0E',
  'Leo': '♌\uFE0E', 'Virgo': '♍\uFE0E', 'Libra': '♎\uFE0E', 'Escorpio': '♏\uFE0E',
  'Sagitario': '♐\uFE0E', 'Capricornio': '♑\uFE0E', 'Acuario': '♒\uFE0E', 'Piscis': '♓\uFE0E',
};

// ---------------------------------------------------------------
// ICONOS DE LÍNEA (reemplazan los emojis, en los colores de la marca)
// ---------------------------------------------------------------
const ICONOS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>`,
  fecha: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/><circle cx="8.3" cy="14.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="14.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15.7" cy="14.5" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  cronos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12"/><path d="M7 3c0 4 4 6 5 8-1 2-5 4-5 8M17 3c0 4-4 6-5 8 1 2 5 4 5 8"/></svg>`,
  nombre: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c-6 0-13 3-15 12-0.3 1.3 1 2.3 2.3 2 9-2 12-9 12-14Z"/><path d="M9.5 14.5 18 6"/><path d="M4 20l2.5-2.5"/></svg>`,
  resumen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12.3h8M8 15.6h5"/></svg>`,
  album: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.2c-2-1.4-5-1.9-8-1.4v13.4c3-0.5 6 0 8 1.4 2-1.4 5-1.9 8-1.4V4.8c-3-0.5-6 0-8 1.4Z"/><path d="M12 6.2v13.4"/></svg>`,
  destello: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4.2M12 16.8V21M3 12h4.2M16.8 12H21M5.8 5.8l3 3M15.2 15.2l3 3M18.2 5.8l-3 3M8.8 15.2l-3 3"/></svg>`,
  estrella: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5l2.4 6.3L21 11l-6.6 2.2L12 21.5l-2.4-8.3L3 11l6.6-2.2Z"/></svg>`,
  corazon: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20.3s-7.3-4.6-9.6-9.2C1 8 2 4.8 5.1 4.1 7.4 3.6 9.8 4.8 12 7.5c2.2-2.7 4.6-3.9 6.9-3.4 3.1 0.7 4.1 3.9 2.7 7-2.3 4.6-9.6 9.2-9.6 9.2Z"/></svg>`,
  brote: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9.5"/><path d="M12 12c0-4.2-3.2-6.3-7.3-6.3 0 4.2 3.1 6.3 7.3 6.3Z"/><path d="M12 12.5c0-3.6 2.6-5.7 6.3-5.7 0 3.6-2.7 5.7-6.3 5.7Z"/></svg>`,
  manoCorazon: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 19.5s-6.4-4-8.4-8.1C2.3 8.4 3.2 5.6 5.9 5c2-0.4 4 0.6 6.1 2.9 2.1-2.3 4.1-3.3 6.1-2.9 2.7 0.6 3.6 3.4 2.3 6.4-2 4.1-8.4 8.1-8.4 8.1Z"/></svg>`,
  libro: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.2c-2-1.4-5-1.9-8-1.4v13.4c3-0.5 6 0 8 1.4 2-1.4 5-1.9 8-1.4V4.8c-3-0.5-6 0-8 1.4Z"/><path d="M12 6.2v13.4"/></svg>`,
  destelloGrande: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M30 6v13M30 41v13M6 30h13M41 30h13M13 13l9 9M38 38l9 9M47 13l-9 9M22 38l-9 9"/><circle cx="30" cy="30" r="6" fill="currentColor" stroke="none"/></svg>`,
};

function aplicarIconos(raiz = document) {
  raiz.querySelectorAll('[data-icono]').forEach(el => {
    const clave = el.dataset.icono;
    if (ICONOS[clave]) el.innerHTML = ICONOS[clave];
  });
}

// ---------------------------------------------------------------
// PERSISTENCIA (localStorage)
// ---------------------------------------------------------------
function guardarDatosBebe() {
  try {
    localStorage.setItem(LLAVE_STORAGE, JSON.stringify(datosBebe));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
}

function cargarDatosBebe() {
  try {
    const guardado = localStorage.getItem(LLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : null;
  } catch (e) {
    console.warn('No se pudo leer de localStorage:', e);
    return null;
  }
}

// ---------------------------------------------------------------
// NAVEGACIÓN
// ---------------------------------------------------------------
function irAPantalla(nombre) {
  document.querySelectorAll('.pantalla, .pantalla-cargando').forEach(el => el.classList.add('oculto'));
  const destino = document.getElementById(`pantalla-${nombre}`);
  if (destino) destino.classList.remove('oculto');

  document.querySelectorAll('.nav-boton').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.nav === nombre);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function mostrarCargando(mensaje) {
  document.querySelectorAll('.pantalla').forEach(el => el.classList.add('oculto'));
  const pantallaCarga = document.getElementById('pantalla-cargando');
  document.getElementById('texto-cargando').textContent = mensaje;
  pantallaCarga.classList.remove('oculto');
}

function mostrarCelebracion(nombrePila, genero) {
  try {
    document.querySelectorAll('.pantalla, .pantalla-cargando').forEach(el => el.classList.add('oculto'));

    const esNino = genero === 'masculino';
    const bienvenida = esNino ? 'Bienvenido' : 'Bienvenida';

    const pantalla = document.getElementById('pantalla-celebracion');
    pantalla.classList.remove('tema-nino', 'tema-nina');
    pantalla.classList.add(esNino ? 'tema-nino' : 'tema-nina');

    document.getElementById('celebracion-titulo').textContent = '¡Felicidades!';
    document.getElementById('celebracion-texto').textContent =
      `${bienvenida} a la familia, ${nombrePila}. Aquí crecerás con todo el amor y cuidados.`;
    document.getElementById('celebracion-frase').textContent =
      'Tu llegada es el comienzo de un nuevo viaje lleno de esperanzas, sueños y posibilidades.';

    // GIF de celebración según género (colócalos en images/boy.gif e images/girl.gif).
    // Si el archivo no existe todavía, el <img> simplemente no se muestra (sin romper la pantalla).
    const gif = document.getElementById('celebracion-gif');
    gif.src = esNino ? 'images/boy.gif' : 'images/girl.gif';
    gif.onload = () => gif.classList.remove('oculto');
    gif.onerror = () => gif.classList.add('oculto');

    pantalla.classList.remove('oculto');
    aplicarIconos(pantalla);
  } catch (error) {
    console.error('Error al mostrar la pantalla de celebración:', error);
    // Si algo falla, no dejamos a la persona atorada: la mandamos igual al reporte.
    irAPantalla('reporte-fecha');
  }
}

// ---------------------------------------------------------------
// VALIDACIÓN PERSONALIZADA (mensajes en español, sin depender del navegador)
// ---------------------------------------------------------------
function mostrarErrorFormulario(idError) {
  const el = document.getElementById(idError);
  if (el) el.classList.remove('oculto');
}
function ocultarErrorFormulario(idError) {
  const el = document.getElementById(idError);
  if (el) el.classList.add('oculto');
}

function alternarCamposNacimiento() {
  const marcado = document.getElementById('iniciar-ya-nacio').checked;
  const contenedor = document.getElementById('campos-ya-nacio');
  contenedor.classList.toggle('oculto', !marcado);
}

// ---------------------------------------------------------------
// FORMULARIO: INICIAR
// ---------------------------------------------------------------
function manejarEnvioIniciar(evento) {
  evento.preventDefault();
  ocultarErrorFormulario('error-iniciar');

  const nombre = document.getElementById('iniciar-nombre').value.trim();
  const apellidos = document.getElementById('iniciar-apellidos').value.trim();
  const fecha = document.getElementById('iniciar-fecha').value;
  const yaNacio = document.getElementById('iniciar-ya-nacio').checked;
  const genero = document.getElementById('iniciar-genero').value;
  const hora = document.getElementById('iniciar-hora').value;
  const peso = document.getElementById('iniciar-peso').value.trim();
  const talla = document.getElementById('iniciar-talla').value.trim();
  const mensajePapas = document.getElementById('iniciar-mensaje-papas').value.trim();

  // Validación: nombre, apellidos y fecha siempre son obligatorios.
  // Si ya nació, el género también es obligatorio (define el tema del Álbum).
  if (!nombre || !apellidos || !fecha || (yaNacio && !genero)) {
    mostrarErrorFormulario('error-iniciar');
    return false;
  }

  mostrarCargando('Descifrando el Mapa Energético de tu bebé...');

  // Simula el tiempo de la llamada a IA para la interpretación.
  // En producción: aquí iría el fetch real al backend.
  setTimeout(() => {
    try {
      const calculado = window.NumerologiaCore.calcularReporteBebe(nombre, apellidos, fecha);

      // Si "ya nació" está marcado, siempre celebramos (regla simple y predecible,
      // sin depender de si había un registro previo en este dispositivo).
      const fechaMarcadoNacidoPrevia = (datosBebe && datosBebe.fechaMarcadoNacido) || null;

      datosBebe = {
        ...calculado,
        yaNacio,
        genero: yaNacio ? genero : null,
        hora: yaNacio ? hora : '',
        peso: yaNacio ? peso : '',
        talla: yaNacio ? talla : '',
        mensajePapas: yaNacio ? mensajePapas : '',
        fechaMarcadoNacido: yaNacio ? (fechaMarcadoNacidoPrevia || new Date().toISOString()) : null,
      };

      guardarDatosBebe();
      renderizarReporteFecha(datosBebe);
      renderizarReporteNombre(datosBebe);
      renderizarResumen(datosBebe);
      renderizarAlbum(datosBebe);

      if (yaNacio) {
        mostrarCelebracion(datosBebe.nombrePila, genero);
      } else {
        irAPantalla('reporte-fecha');
      }
    } catch (error) {
      console.error('Error al generar el Mapa Energético:', error);
      alert('Ocurrió un error generando el reporte. Revisa la consola (F12) para más detalle.');
    }
  }, 1200);

  return false;
}

// ---------------------------------------------------------------
// FORMULARIO: CRONOS
// ---------------------------------------------------------------
function manejarEnvioCronos(evento) {
  evento.preventDefault();
  ocultarErrorFormulario('error-cronos');

  const fechaA = document.getElementById('cronos-fecha-a').value;
  const fechaB = document.getElementById('cronos-fecha-b').value;

  if (!fechaA || !fechaB) {
    mostrarErrorFormulario('error-cronos');
    return false;
  }

  const resultadoA = window.NumerologiaCore.calcularReporteBebe('', '', fechaA);
  const resultadoB = window.NumerologiaCore.calcularReporteBebe('', '', fechaB);
  datosCronos = { resultadoA, resultadoB };

  renderizarCronos(datosCronos);
  return false;
}

function renderizarCronos({ resultadoA, resultadoB }) {
  const contenedor = document.getElementById('resultado-cronos');
  const filas = [
    ['Alma', 'alma'], ['Personalidad', 'personalidad'], ['Regalo', 'regalo'],
    ['Camino de Crecimiento', 'retos'], ['Misión Natal', 'mision'],
  ];

  const columnaHtml = (resultado, etiqueta) => `
    <div class="columna-fecha">
      <h4>Opción ${etiqueta}<br><span class="fecha-grande">${formatearFecha(resultado.fechaNacimiento)}</span></h4>
      <div class="signo-linea"><span class="signo-emoji">${SIGNO_EMOJI[resultado.signoSolar] || ''}</span>${resultado.signoSolar}</div>
      ${filas.map(([label, key]) => `
        <div class="mini-numero"><span>${label}</span><b>${resultado.fecha[key]}</b></div>
      `).join('')}
    </div>
  `;

  contenedor.innerHTML = `
    <div class="comparacion-columnas">
      ${columnaHtml(resultadoA, 'A')}
      ${columnaHtml(resultadoB, 'B')}
    </div>
    <div class="veredicto-cronos">
      ${generarVeredictoCronos(resultadoA, resultadoB)}
    </div>
  `;
}

// STUB — reemplazar con llamada real a IA para comparar ambas energías.
function generarVeredictoCronos(resultadoA, resultadoB) {
  return `
    <h3 style="color:var(--dorado); font-family:'Fraunces',serif; font-size:17px; margin-bottom:10px;">¿Cuál energía elegir?</h3>
    <p style="margin-bottom:14px;">Con la que ustedes como papás se sientan más identificados:</p>
    <p><strong>La opción A</strong> — [Aquí se generará con IA un párrafo cálido describiendo la energía general que trae esta fecha para tu bebé, sin repetir los números.]</p>
    <p><strong>La opción B</strong> — [Aquí se generará con IA un párrafo cálido describiendo la energía general que trae esta fecha para tu bebé, sin repetir los números.]</p>
    <p>[Aquí se generará con IA un cierre comparando ambos caminos en un par de párrafos, para ayudarles a decidir con qué energía se sienten más identificados.]</p>
  `;
}

// ---------------------------------------------------------------
// BIBLIOTECA DE CONTENIDO — REPORTE DE FECHA
// Lee de window.ESTRUCTURA_FECHA (textos fijos, biblioteca/fecha-estructura.js)
// y window.BIBLIOTECA_FECHA[numero] (contenido por número, biblioteca/fecha-N.js).
// Sin llamadas a IA ni backend: todo el texto ya está en esos archivos.
// ---------------------------------------------------------------

const ORDEN_SECCIONES_FECHA = [
  { campo: 'alma', seccion: 'alma' },
  { campo: 'personalidad', seccion: 'personalidad' },
  { campo: 'regalo', seccion: 'regalo' },
  { campo: 'retos', seccion: 'caminoDeCrecimiento' },
  { campo: 'mision', seccion: 'misionNatal' },
];

const SUBSECCIONES_FECHA = {
  alma: [
    ['¿Qué significa este número en el Alma?', 'queSignifica'],
    ['Fortalezas', 'fortalezas'],
    ['Aprendizajes', 'aprendizajes'],
    ['Cómo darle seguridad', 'comoDarleSeguridad'],
    ['Qué necesita emocionalmente', 'queNecesitaEmocionalmente'],
  ],
  personalidad: [
    ['¿Qué significa este número en la Personalidad?', 'queSignifica'],
    ['Cualidades', 'cualidades'],
    ['Aprendizajes', 'aprendizajes'],
    ['Cómo fortalecer esta Personalidad', 'comoFortalecer'],
    ['Qué necesita emocionalmente', 'queNecesitaEmocionalmente'],
    ['Cómo expresa su energía', 'comoExpresaSuEnergia'],
    ['Cómo lo verán los demás', 'comoLoVeranLosDemas'],
    ['Cómo aprende', 'comoAprende'],
    ['Cómo suele reaccionar', 'comoSueleReaccionar'],
  ],
  regalo: [
    ['¿Qué significa este número como Regalo?', 'queSignificaComoRegalo'],
    ['Talentos naturales', 'talentosNaturales'],
    ['Cómo potenciar este regalo', 'comoPotenciar'],
    ['Riesgos cuando este regalo no se desarrolla', 'riesgos'],
    ['Lo que conviene estimular', 'loQueConvieneEstimular'],
  ],
  caminoDeCrecimiento: [
    ['Lo que viene a aprender', 'loQueVieneAAprender'],
    ['Desafíos que pueden presentarse', 'desafios'],
    ['Cómo acompañar estos aprendizajes', 'comoAcompanar'],
    ['Señales de que está integrando este aprendizaje', 'senalesDeIntegracion'],
    ['Qué tenderá a costarle más esfuerzo', 'queLeCostaraMasEsfuerzo'],
    ['Emociones que aparecerán como desafío', 'emocionesComoDesafio'],
    ['Frases a evitar', 'frasesAEvitar'],
    ['Frases que le ayudan', 'frasesQueAyudan'],
  ],
  misionNatal: [
    ['¿Qué significa este número en la Misión?', 'queSignificaEnMision'],
    ['Fortalezas para cumplir su misión', 'fortalezasParaCumplirMision'],
    ['Desafíos en su camino', 'desafiosEnSuCamino'],
    ['Cómo acompañar el desarrollo de su misión', 'comoAcompanarDesarrolloMision'],
    ['Lo que viene a desarrollar o a trabajar en sí y hacia los demás', 'loQueVieneADesarrollar'],
    ['Su aportación al mundo', 'suAportacionAlMundo'],
  ],
};

const SUBSECCIONES_ESENCIA = [
  ['Potencial en su máxima expresión', 'potencialMaximaExpresion'],
  ['Su superpoder cuando vibra en positivo', 'superpoder'],
  ['Cuando la energía está en desequilibrio', 'desequilibrio'],
  ['Cómo acompañarlo de 0 a 2 años', 'comoAcompanarPorEtapa.0-2'],
  ['Cómo acompañarlo de 3 a 5 años', 'comoAcompanarPorEtapa.3-5'],
  ['Actividades que potencian esta energía', 'actividades'],
  ['Frases que nutren su autoestima', 'frasesQueNutren'],
  ['Frases que conviene evitar', 'frasesQueEvitar'],
  ['Cómo suele aprender', 'comoSueleAprender'],
];

function parrafosHtml(texto) {
  if (!texto) return '';
  return texto.split('\n\n').map(p => `<p>${p}</p>`).join('');
}

function listaHtml(items) {
  if (!items || !items.length) return '';
  return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

function contenidoSubseccionHtml(contenido) {
  if (contenido == null) return '<p><em>Contenido pendiente en la biblioteca.</em></p>';
  if (typeof contenido === 'string') return parrafosHtml(contenido);
  if (Array.isArray(contenido)) return listaHtml(contenido);
  if (typeof contenido === 'object') {
    let html = '';
    if (contenido.intro) html += parrafosHtml(contenido.intro);
    if (contenido.items) html += listaHtml(contenido.items);
    if (contenido.cierre) html += parrafosHtml(contenido.cierre);
    if (contenido.haciaLosDemas) html += parrafosHtml(contenido.haciaLosDemas);
    return html;
  }
  return '';
}

function obtenerValorAnidado(obj, ruta) {
  return ruta.split('.').reduce((acc, llave) => (acc == null ? undefined : acc[llave]), obj);
}

// Elige (y persiste en datosBebe) 1 frase poderosa al azar por sección,
// para que no cambie cada vez que se vuelve a abrir el reporte.
function elegirFrasePersistente(seccionKey, frases) {
  if (!frases || !frases.length) return '';
  if (!datosBebe.frasesElegidas) datosBebe.frasesElegidas = {};
  if (!datosBebe.frasesElegidas[seccionKey]) {
    const indice = Math.floor(Math.random() * frases.length);
    datosBebe.frasesElegidas[seccionKey] = frases[indice];
    guardarDatosBebe();
  }
  return datosBebe.frasesElegidas[seccionKey];
}

// Renderiza una de las 5 secciones del reporte de fecha a partir de la biblioteca.
function renderizarSeccionFecha(posicion, campo, seccionKey, numero, nombrePila) {
  const estructura = (window.ESTRUCTURA_FECHA || {})[seccionKey] || {};
  const libroNumero = (window.BIBLIOTECA_FECHA || {})[numero];
  const contenido = libroNumero ? libroNumero[seccionKey] : null;

  if (!contenido) {
    return `
      <div class="seccion-numero">
        <div class="numero-cabecera">
          <div class="numero-estrella">${numero}</div>
          <div>
            <h3 class="numero-titulo">${posicion}. ${estructura.titulo || seccionKey}</h3>
            <p class="numero-vibracion">Vibración número ${numero}</p>
          </div>
        </div>
        <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${estructura.queRepresenta || ''}</p>
        <div class="interpretacion-texto"><p><em>La biblioteca para el número ${numero} todavía no está cargada en esta sección.</em></p></div>
      </div>
    `;
  }

  const frase = elegirFrasePersistente(seccionKey, contenido.frasesPoderosas);
  const subsecciones = (SUBSECCIONES_FECHA[seccionKey] || [])
    .map(([label, campoContenido]) => `
      <details class="subseccion-detalle">
        <summary>${label}</summary>
        <div class="subseccion-detalle-cuerpo">${contenidoSubseccionHtml(contenido[campoContenido])}</div>
      </details>
    `).join('');

  return `
    <div class="seccion-numero">
      <div class="numero-cabecera">
        <div class="numero-estrella">${numero}</div>
        <div>
          <h3 class="numero-titulo">${posicion}. ${estructura.titulo || seccionKey}</h3>
          <p class="numero-vibracion">Vibración número ${numero}</p>
        </div>
      </div>
      <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${estructura.queRepresenta || ''}</p>
      ${estructura.fraseDestacadaFija ? `<p class="frase-destacada-fija">${estructura.fraseDestacadaFija}</p>` : ''}
      <div class="numero-frase-poder">"${frase}"</div>
      <div class="interpretacion-texto">
        ${parrafosHtml(contenido.resumen)}
        ${contenido.don ? `<p><strong>Don:</strong> ${contenido.don}</p>` : ''}
        ${contenido.reto ? `<p><strong>Reto:</strong> ${contenido.reto}</p>` : ''}
        <div class="subsecciones-grupo">${subsecciones}</div>
        <div class="acompanar-box"><strong>Recomendaciones para los padres</strong><br>${parrafosHtml(contenido.recomendacionesPadres)}</div>
      </div>
    </div>
  `;
}

// Iconos para la ficha de Esencia Energética. Mapa amplio (cubre los
// elementos y colores más comunes en numerología); si aparece uno nuevo
// que no esté aquí, se usa un icono neutro de respaldo.
const ICONO_ELEMENTO = {
  'fuego': '🔥', 'tierra': '🌍', 'agua': '💧', 'aire': '💨',
  'éter': '✨', 'eter': '✨', 'akasha': '✨', 'luz': '☀️', 'metal': '⚙️', 'madera': '🌳',
};
const ICONO_COLOR = {
  'rojo': '🔴', 'naranja': '🟠', 'amarillo': '🟡', 'dorado': '🟡', 'verde': '🟢',
  'azul': '🔵', 'celeste': '🔵', 'turquesa': '🔵', 'índigo': '🟣', 'indigo': '🟣',
  'violeta': '🟣', 'morado': '🟣', 'púrpura': '🟣', 'purpura': '🟣', 'rosa': '🩷',
  'blanco': '⚪', 'plateado': '⚪', 'gris': '⚪', 'negro': '⚫',
};
function iconoPorNombre(mapa, nombre) {
  if (!nombre) return '';
  const clave = Object.keys(mapa).find(k => nombre.toLowerCase().includes(k));
  return clave ? mapa[clave] : '✨';
}


// Renderiza la ficha de Esencia Energética (en base al número del Alma).
// El Signo Solar (ya calculado en core.js) se despliega aquí también.
function renderizarEsenciaEnergetica(numeroAlma, signoSolar) {
  const estructura = (window.ESTRUCTURA_FECHA || {}).esenciaEnergetica || {};
  const libroNumero = (window.BIBLIOTECA_FECHA || {})[numeroAlma];
  const contenido = libroNumero ? libroNumero.esenciaEnergetica : null;

  if (!contenido) {
    return `<div class="ficha-energetica"><h3>${estructura.titulo || 'Esencia Energética'}</h3><p><em>La biblioteca para el número ${numeroAlma} todavía no está cargada en esta sección.</em></p></div>`;
  }

  const subsecciones = SUBSECCIONES_ESENCIA
    .map(([label, ruta]) => `
      <details class="subseccion-detalle">
        <summary>${label}</summary>
        <div class="subseccion-detalle-cuerpo">${contenidoSubseccionHtml(obtenerValorAnidado(contenido, ruta))}</div>
      </details>
    `).join('');

  const lenguajeAmorHtml = contenido.lenguajeDeAmor ? `
    <details class="subseccion-detalle">
      <summary>Su lenguaje de amor predominante</summary>
      <div class="subseccion-detalle-cuerpo">
        ${parrafosHtml(contenido.lenguajeDeAmor.intro)}
        <ul>${(contenido.lenguajeDeAmor.items || []).map(i => `<li><strong>${i.nombre}:</strong> ${i.descripcion}</li>`).join('')}</ul>
      </div>
    </details>
  ` : '';

  // Grid de 2 columnas, orden row-major para que quede:
  // Col.1 = Elemento, Arquetipo, Signo Solar   |   Col.2 = Color, Símbolo, Verbo
  const fichaItems = [];
  if (contenido.elemento) {
    fichaItems.push(`<div class="ficha-item"><span>Elemento</span><b>${iconoPorNombre(ICONO_ELEMENTO, contenido.elemento.nombre)} ${contenido.elemento.nombre}</b><p>${contenido.elemento.descripcion}</p></div>`);
  }
  if (contenido.colorEnergetico) {
    fichaItems.push(`<div class="ficha-item"><span>Color energético</span><b>${iconoPorNombre(ICONO_COLOR, contenido.colorEnergetico.nombre)} ${contenido.colorEnergetico.nombre}</b><p>${contenido.colorEnergetico.descripcion}</p></div>`);
  }
  if (contenido.arquetipo) {
    fichaItems.push(`<div class="ficha-item"><span>Arquetipo</span><b>${contenido.arquetipo.nombre}</b><p>${contenido.arquetipo.descripcion}</p></div>`);
  }
  if (contenido.simbolo) {
    fichaItems.push(`<div class="ficha-item"><span>Símbolo</span><b>${contenido.simbolo.nombre}</b><p>${contenido.simbolo.descripcion}</p></div>`);
  }
  if (signoSolar) {
    fichaItems.push(`<div class="ficha-item"><span>Signo solar</span><b>${SIGNO_EMOJI[signoSolar] || ''} ${signoSolar}</b></div>`);
  }
  if (contenido.verbo) {
    fichaItems.push(`<div class="ficha-item"><span>Verbo</span><b>${contenido.verbo}</b></div>`);
  }

  return `
    <div class="ficha-energetica">
      <h3>${estructura.titulo || 'Esencia Energética'} <span style="font-size:13px; font-weight:400; color:#6b6180;">${estructura.subtitulo || ''}</span></h3>
      <p class="numero-vibracion" style="margin-bottom:10px;">Vibración número ${numeroAlma}</p>
      ${parrafosHtml(contenido.laEsencia)}
      <div class="subsecciones-grupo">
        ${subsecciones}
        ${lenguajeAmorHtml}
      </div>
      <div class="ficha-energetica-grid">${fichaItems.join('')}</div>
      ${contenido.afirmacion ? `<div class="afirmacion-box">"${contenido.afirmacion}"</div>` : ''}
    </div>
  `;
}

const CONTENIDO_NUMEROS_NOMBRE = [
  {
    key: 'formaDeSer', bibliotecaKey: 'formaDeSer', numero: 1, titulo: 'Forma de Ser',
    queRepresenta: 'Describe la manera más natural en que tu bebé actuará y enfrentará la vida. Refleja sus talentos innatos, sus capacidades y la forma en que tenderá a desenvolverse en diferentes situaciones.',
  },
  {
    key: 'deseosDelSer', bibliotecaKey: 'deseosDelSer', numero: 2, titulo: 'Deseos del Ser',
    queRepresenta: 'Es la voz de su mundo interior. Revela aquello que anhela profundamente, lo que le inspira, le motiva y le hace sentir realizado, aunque muchas veces no lo exprese con palabras.',
  },
  {
    key: 'comoLoPercibiran', bibliotecaKey: 'comoLoPercibiran', numero: 3, titulo: 'Cómo lo percibirán los demás',
    queRepresenta: 'Muestra la imagen que proyecta hacia el exterior y la impresión que suele generar en quienes lo conocen. No siempre coincide con cómo se siente por dentro, pero influye en la manera en que los demás se relacionan con él.',
  },
  {
    key: 'potenciador', bibliotecaKey: 'potenciador', numero: 4, titulo: 'Su Potenciador',
    queRepresenta: 'Es la energía que ayuda a integrar y fortalecer el resto de las vibraciones de su mapa. Al desarrollarla conscientemente, facilita que sus talentos florezcan y que sus aprendizajes se vivan con mayor equilibrio.',
  },
];

// STUB — reemplazar con la llamada real a IA (vía backend).
function generarInterpretacionIA(seccion, numero, nombrePila, puntos, fraseIntro, conAcompanarBox = true) {
  const listaPuntos = (puntos || [])
    .map(punto => `<li><strong>${punto}:</strong> [generado por IA]</li>`)
    .join('');

  return `
    <div class="numero-frase-poder">${fraseIntro ? fraseIntro : `[Frase poderosa que la IA generará para la vibración ${numero} en ${seccion}]`}</div>
    <div class="interpretacion-texto">
      <p>[Aquí se generará con IA la interpretación completa de este número para ${nombrePila || 'tu bebé'} en esta posición.]</p>
      <ul>${listaPuntos}</ul>
      ${conAcompanarBox ? `<div class="acompanar-box"><strong>Los padres pueden ayudarle cuando...</strong> [generado por IA]</div>` : ''}
    </div>
  `;
}

// ---------------------------------------------------------------
// RENDERIZADO: REPORTE DE FECHA
// ---------------------------------------------------------------
function renderizarReporteFecha(datos) {
  const { nombrePila, fecha, signoSolar } = datos;

  const seccionesFecha = ORDEN_SECCIONES_FECHA
    .map((item, indice) => renderizarSeccionFecha(indice + 1, item.campo, item.seccion, fecha[item.campo], nombrePila))
    .join('');

  const esenciaEnergeticaHtml = renderizarEsenciaEnergetica(fecha.alma, signoSolar);

  document.getElementById('reporte-fecha-contenido').innerHTML = `
    <div class="reporte-bienvenida">
      <div class="eyebrow">Tu Mapa Energético de Nacimiento</div>
      <h1>Bienvenido(a) a este mundo, ${nombrePila}</h1>
      <p class="subt">Una mirada a los talentos, regalos y propósito que acompañan tu llegada a esta vida.</p>
    </div>

    ${seccionesFecha}

    ${esenciaEnergeticaHtml}

    <button class="boton-secundario" onclick="irAPantalla('reporte-nombre')">Ver el Reporte de Nombre</button>
  `;
}

// ---------------------------------------------------------------
// RENDERIZADO: REPORTE DE NOMBRE
// ---------------------------------------------------------------
function renderizarReporteNombre(datos) {
  const { nombrePila, nombreNumerologia } = datos;
  const bibliotecaNombre = window.BIBLIOTECA_NOMBRE || {};

  const seccionesNombre = CONTENIDO_NUMEROS_NOMBRE.map(item => {
    const numero = nombreNumerologia[item.key];
    const contenidoNumero = bibliotecaNombre[numero] || {};
    const texto = contenidoNumero[item.bibliotecaKey];

    return `
      <div class="seccion-numero">
        <div class="numero-cabecera">
          <div class="numero-estrella">${numero}</div>
          <div>
            <h3 class="numero-titulo">${item.numero}. ${item.titulo}</h3>
            <p class="numero-vibracion">Vibración número ${numero}</p>
          </div>
        </div>
        <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${item.queRepresenta}</p>
        <div class="interpretacion-texto">
          ${texto ? parrafosHtml(texto) : '<p><em>La biblioteca para este número todavía no está cargada.</em></p>'}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('reporte-nombre-contenido').innerHTML = `
    <div class="encabezado-seccion">
      <div class="eyebrow">Reporte de Nombre</div>
      <h2>Lo que revela el nombre de ${nombrePila}</h2>
      <p>Mientras la fecha de nacimiento revela la energía con la que tu bebé llega a este mundo, el nombre añade una vibración que influye en la manera en que esa esencia se expresa y se desarrolla a lo largo de la vida. El nombre representa la energía que elegimos para acompañar esa alma.</p>
    </div>

    ${seccionesNombre}


<button class="boton-secundario" onclick="irAPantalla('reporte-fecha')">Ver el Mapa Energético de ${nombrePila}</button>  `;
}

// ---------------------------------------------------------------
// RENDERIZADO: RESUMEN
// ---------------------------------------------------------------
function renderizarResumen(datos) {
  const { nombrePila } = datos;

  document.getElementById('resumen-contenido').innerHTML = `
    <div class="resumen-titulo">
      <div class="eyebrow">Resumen</div>
      <h2>El Mapa Energético de ${nombrePila}</h2>
    </div>

    <div class="resumen-item">
      <div class="icono" data-icono="estrella"></div>
      <div class="texto"><strong>Su mayor fortaleza</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono icono-rosa" data-icono="corazon"></div>
      <div class="texto"><strong>Lo que más necesitará</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono" data-icono="brote"></div>
      <div class="texto"><strong>Su aprendizaje más importante</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono" data-icono="estrella"></div>
      <div class="texto"><strong>El talento que vino a compartir</strong><span>[generado por IA]</span></div>
    </div>
    <div class="resumen-item">
      <div class="icono icono-rosa" data-icono="manoCorazon"></div>
      <div class="texto"><strong>Cómo pueden acompañarle mejor sus padres</strong><span>[generado por IA]</span></div>
    </div>

    <div class="carta-final">
      <p>Querid@ ${nombrePila}:</p>
      <p>Hoy aún eres muy pequeño para leer estas palabras... pero algún día quizá vuelvas a este documento y descubras que muchas de estas semillas ya vivían dentro de ti desde el día en que naciste.</p>
      <p>Nunca olvides que los números no escriben tu destino. Solo iluminan el potencial que siempre ha habitado en ti.</p>
      <p>Que tu camino esté lleno de amor, curiosidad y propósito.</p>
      <p class="firma">Con cariño.<br><small>Este estudio fue preparado para acompañarte desde tus primeros pasos.</small></p>
    </div>
  `;

  aplicarIconos(document.getElementById('resumen-contenido'));
}

// ---------------------------------------------------------------
// RENDERIZADO: ÁLBUM DEL BEBÉ
// ---------------------------------------------------------------
function diasTranscurridosDesde(fechaISOConHora) {
  const entonces = new Date(fechaISOConHora);
  const ahora = new Date();
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.floor((ahora - entonces) / msPorDia);
}

// Agrega la unidad (cm/kg) solo si el valor capturado es un número puro,
// para no duplicarla si la persona ya escribió "3.2 kg" o "50 cm".
function formatearConUnidad(valor, unidad) {
  if (!valor) return '—';
  const soloNumero = /^[\d.,]+$/.test(valor.trim());
  return soloNumero ? `${valor.trim()} ${unidad}` : valor.trim();
}

function renderizarAlbum(datos) {
  const contenedor = document.getElementById('album-contenido');

  if (!datos || !datos.yaNacio) {
    contenedor.innerHTML = `
      <div class="encabezado-seccion">
        <div class="eyebrow">Álbum del Bebé</div>
        <h2>Un recuerdo para toda la vida</h2>
      </div>
      <div class="estado-vacio">
        <p>El Álbum de tu bebé estará listo cuando nos indiques que ya nació.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Marcar que ya nació</button>
      </div>
    `;
    return;
  }

  const diasTranscurridos = diasTranscurridosDesde(datos.fechaMarcadoNacido);
  const diasFaltantes = DIAS_ESPERA_ALBUM - diasTranscurridos;

  if (diasFaltantes > 0) {
    contenedor.innerHTML = `
      <div class="encabezado-seccion">
        <div class="eyebrow">Álbum del Bebé</div>
        <h2>Un recuerdo para toda la vida</h2>
      </div>
      <div class="estado-vacio">
        <p>Estamos generando el Álbum de tu bebé, lo podrás descargar dentro de ${diasFaltantes} día${diasFaltantes === 1 ? '' : 's'}.</p>
      </div>
    `;
    return;
  }

  // Álbum desbloqueado
  const tema = datos.genero === 'masculino' ? 'tema-nino' : 'tema-nina';
  contenedor.innerHTML = `
    <div class="album-desbloqueado ${tema}">
      ${construirHtmlAlbum(datos)}
      <button class="boton-primario boton-imprimir boton-con-icono" onclick="window.print()">
        <span class="icono-boton" data-icono="libro"></span> Descargar / Imprimir Álbum
      </button>
    </div>
  `;
  aplicarIconos(contenedor);
}

// Construye una sección del Reporte de Fecha como texto continuo para el Álbum.
function construirSeccionFechaContinuaParaAlbum(posicion, seccionKey, numero) {
  const estructura = (window.ESTRUCTURA_FECHA || {})[seccionKey] || {};
  const libroNumero = (window.BIBLIOTECA_FECHA || {})[numero];
  const contenido = libroNumero ? libroNumero[seccionKey] : null;

  if (!contenido) {
    return `
      <div class="album-reporte-seccion">
        <div class="numero-cabecera">
          <div class="numero-estrella">${numero}</div>
          <div>
            <h3 class="numero-titulo">${posicion}. ${estructura.titulo || seccionKey}</h3>
            <p class="numero-vibracion">Vibración número ${numero}</p>
          </div>
        </div>
        <p><em>La biblioteca para el número ${numero} todavía no está cargada en esta sección.</em></p>
      </div>
    `;
  }

  const frase = elegirFrasePersistente(seccionKey, contenido.frasesPoderosas);
  const subsecciones = (SUBSECCIONES_FECHA[seccionKey] || [])
    .map(([label, campoContenido]) => `
      <div class="album-subseccion-continua">
        <h4>${label}</h4>
        ${contenidoSubseccionHtml(contenido[campoContenido])}
      </div>
    `).join('');

  return `
    <div class="album-reporte-seccion">
      <div class="numero-cabecera">
        <div class="numero-estrella">${numero}</div>
        <div>
          <h3 class="numero-titulo">${posicion}. ${estructura.titulo || seccionKey}</h3>
          <p class="numero-vibracion">Vibración número ${numero}</p>
        </div>
      </div>
      <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${estructura.queRepresenta || ''}</p>
      ${estructura.fraseDestacadaFija ? `<p class="frase-destacada-fija">${estructura.fraseDestacadaFija}</p>` : ''}
      <div class="numero-frase-poder">"${frase}"</div>
      <div class="interpretacion-texto">
        ${parrafosHtml(contenido.resumen)}
        ${contenido.don ? `<p><strong>Don:</strong> ${contenido.don}</p>` : ''}
        ${contenido.reto ? `<p><strong>Reto:</strong> ${contenido.reto}</p>` : ''}
        ${subsecciones}
        <div class="acompanar-box">
          <strong>Recomendaciones para los padres</strong>
          ${parrafosHtml(contenido.recomendacionesPadres)}
        </div>
      </div>
    </div>
  `;
}

// Construye la Esencia Energética como texto continuo para el Álbum.
function construirEsenciaContinuaParaAlbum(numeroAlma, signoSolar) {
  const estructura = (window.ESTRUCTURA_FECHA || {}).esenciaEnergetica || {};
  const libroNumero = (window.BIBLIOTECA_FECHA || {})[numeroAlma];
  const contenido = libroNumero ? libroNumero.esenciaEnergetica : null;

  if (!contenido) return '';

  const subsecciones = SUBSECCIONES_ESENCIA
    .map(([label, ruta]) => `
      <div class="album-subseccion-continua">
        <h4>${label}</h4>
        ${contenidoSubseccionHtml(obtenerValorAnidado(contenido, ruta))}
      </div>
    `).join('');

  const lenguajeAmor = contenido.lenguajeDeAmor ? `
    <div class="album-subseccion-continua">
      <h4>Su lenguaje de amor predominante</h4>
      ${parrafosHtml(contenido.lenguajeDeAmor.intro)}
      <ul>
        ${(contenido.lenguajeDeAmor.items || []).map(i =>
          `<li><strong>${i.nombre}:</strong> ${i.descripcion}</li>`
        ).join('')}
      </ul>
    </div>
  ` : '';

  return `
    <div class="album-reporte-seccion ficha-energetica album-esencia-continua">
      <h3>${estructura.titulo || 'Esencia Energética'}</h3>
      <p class="numero-vibracion">Vibración número ${numeroAlma}</p>
      ${parrafosHtml(contenido.laEsencia)}
      ${subsecciones}
      ${lenguajeAmor}
      <div class="ficha-energetica-grid">
        ${contenido.elemento ? `<div class="ficha-item"><span>Elemento</span><b>${iconoPorNombre(ICONO_ELEMENTO, contenido.elemento.nombre)} ${contenido.elemento.nombre}</b><p>${contenido.elemento.descripcion}</p></div>` : ''}
        ${contenido.colorEnergetico ? `<div class="ficha-item"><span>Color energético</span><b>${iconoPorNombre(ICONO_COLOR, contenido.colorEnergetico.nombre)} ${contenido.colorEnergetico.nombre}</b><p>${contenido.colorEnergetico.descripcion}</p></div>` : ''}
        ${contenido.arquetipo ? `<div class="ficha-item"><span>Arquetipo</span><b>${contenido.arquetipo.nombre}</b><p>${contenido.arquetipo.descripcion}</p></div>` : ''}
        ${contenido.simbolo ? `<div class="ficha-item"><span>Símbolo</span><b>${contenido.simbolo.nombre}</b><p>${contenido.simbolo.descripcion}</p></div>` : ''}
        ${signoSolar ? `<div class="ficha-item"><span>Signo solar</span><b>${SIGNO_EMOJI[signoSolar] || ''} ${signoSolar}</b></div>` : ''}
        ${contenido.verbo ? `<div class="ficha-item"><span>Verbo</span><b>${contenido.verbo}</b></div>` : ''}
      </div>
      ${contenido.afirmacion ? `<div class="afirmacion-box">"${contenido.afirmacion}"</div>` : ''}
    </div>
  `;
}

// Construye el Reporte de Fecha completo para integrarlo dentro del Álbum.
function construirReporteFechaParaAlbum(datos) {
  const { nombrePila, fecha, signoSolar } = datos;

  const seccionesFecha = ORDEN_SECCIONES_FECHA
    .map((item, indice) =>
      construirSeccionFechaContinuaParaAlbum(indice + 1, item.seccion, fecha[item.campo])
    )
    .join('');

  return `
    <section class="album-reporte-completo album-reporte-fecha">
      <div class="album-portadilla-reporte">
        <div class="eyebrow">Reporte de Fecha</div>
        <h1>El Mapa Energético de ${nombrePila}</h1>
        <p>Talentos, fortalezas, aprendizajes y propósito asociados a su fecha de nacimiento.</p>
      </div>
      <div class="album-reporte-contenido">
        ${seccionesFecha}
        ${construirEsenciaContinuaParaAlbum(fecha.alma, signoSolar)}
      </div>
    </section>
  `;
}

// Construye el Reporte de Nombre completo para integrarlo dentro del Álbum.
// Lee directamente de window.BIBLIOTECA_NOMBRE, sin duplicar los textos.
function construirReporteNombreParaAlbum(datos) {
  const { nombrePila, nombreNumerologia } = datos;
  const bibliotecaNombre = window.BIBLIOTECA_NOMBRE || {};

  const seccionesNombre = CONTENIDO_NUMEROS_NOMBRE.map(item => {
    const numero = nombreNumerologia[item.key];
    const contenidoNumero = bibliotecaNombre[numero] || {};
    const texto = contenidoNumero[item.bibliotecaKey];

    return `
      <div class="seccion-numero">
        <div class="numero-cabecera">
          <div class="numero-estrella">${numero}</div>
          <div>
            <h3 class="numero-titulo">${item.numero}. ${item.titulo}</h3>
            <p class="numero-vibracion">Vibración número ${numero}</p>
          </div>
        </div>
        <p class="numero-que-representa"><strong>¿Qué representa?</strong> ${item.queRepresenta}</p>
        <div class="interpretacion-texto">
          ${texto ? parrafosHtml(texto) : '<p><em>La biblioteca para este número todavía no está cargada.</em></p>'}
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="album-reporte-completo album-reporte-nombre">
      <div class="album-portadilla-reporte">
        <div class="eyebrow">Reporte de Nombre</div>
        <h1>Lo que revela el nombre de ${nombrePila}</h1>
        <p>La vibración que acompaña la forma en que su esencia se expresa y se desarrolla.</p>
      </div>
      <div class="album-reporte-contenido">
        ${seccionesNombre}
      </div>
    </section>
  `;
}

function construirHtmlAlbum(datos) {
  const { nombrePila, fecha, nombreNumerologia, signoSolar, hora, peso, talla, mensajePapas, fechaNacimiento } = datos;
  const esNino = datos.genero === 'masculino';
  const generoTexto = esNino ? 'niño' : 'niña';
  const articuloGenero = esNino ? 'Un' : 'Una';
  const unicoTexto = esNino ? 'Lo que lo hace único' : 'Lo que la hace única';

  const filasNumerosFecha = [
    ['Alma', fecha.alma], ['Personalidad', fecha.personalidad], ['Regalo', fecha.regalo],
    ['Camino de Crecimiento', fecha.retos], ['Misión Natal', fecha.mision],
  ].map(([label, valor]) => `<div class="album-mini-numero"><span>${label}</span><b>${valor}</b></div>`).join('');

  const filasNumerosNombre = [
    ['Forma de Ser', nombreNumerologia.formaDeSer], ['Deseos del Ser', nombreNumerologia.deseosDelSer],
    ['Cómo lo perciben', nombreNumerologia.comoLoPercibiran], ['Potenciador', nombreNumerologia.potenciador],
  ].map(([label, valor]) => `<div class="album-mini-numero"><span>${label}</span><b>${valor}</b></div>`).join('');

  const filasBitacora = Array.from({ length: 12 }, (_, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="celda-llenar"></td>
      <td class="celda-llenar"></td>
      <td class="celda-llenar"></td>
    </tr>
  `).join('');

  // Genera N renglones en blanco para llenar a mano
  const renglones = (cantidad, claseExtra = '') => Array.from({ length: cantidad }, () => `<div class="album-renglon ${claseExtra}"></div>`).join('');
  const renglonesCortos = (cantidad) => Array.from({ length: cantidad }, () => `<div class="album-renglon-corto"></div>`).join('');

  return `
    <!-- Portada + Carta para el bebé -->
    <div class="album-pagina album-portada album-hoja-1">
      <div class="eyebrow">Álbum de</div>
      <h1>${nombrePila}</h1>
      <p class="subt">${articuloGenero} ${generoTexto} que llegó a iluminar nuestras vidas</p>
    </div>
    <div class="album-pagina album-carta-bebe album-hoja-2">
      <p>Querid${esNino ? 'o' : 'a'} ${nombrePila}:</p>
      ${mensajePapas
        ? parrafosHtml(mensajePapas)
        : '<p>Este espacio está reservado para el mensaje que sus papás quieran dedicarle.</p>'
      }
    </div>

    <!-- Datos generales -->
    <div class="album-pagina album-hoja-3">
      <h2>Datos generales</h2>
      <div class="album-datos-grid">
        <div><span>Nombre completo</span><b>${datos.nombreCompleto}</b></div>
        <div><span>Fecha de nacimiento</span><b>${formatearFecha(fechaNacimiento)}</b></div>
        <div><span>Hora de nacimiento</span><b>${hora || '—'}</b></div>
        <div><span>Peso al nacer</span><b>${formatearConUnidad(peso, 'kg')}</b></div>
        <div><span>Tamaño al nacer</span><b>${formatearConUnidad(talla, 'cm')}</b></div>
        <div><span>Signo solar</span><b>${SIGNO_EMOJI[signoSolar] || ''} ${signoSolar}</b></div>
      </div>
    </div>

    <!-- Mapa energético condensado -->
    <div class="album-pagina">
      <h2>Su Mapa Energético</h2>
      <p class="album-parrafo-ia">[Aquí se generará con IA la esencia general de ${nombrePila}, combinando todos sus números.]</p>
      <div class="album-numeros-grid">
        ${filasNumerosFecha}
        ${filasNumerosNombre}
      </div>
    </div>

    <!-- Huellitas -->
    <div class="album-pagina album-hoja-4">
      <h2>Sus huellitas</h2>
      <div class="album-huellas-grid">
        <div class="album-huella-caja"><span>Huella de pie izquierdo</span></div>
        <div class="album-huella-caja"><span>Huella de pie derecho</span></div>
      </div>
    </div>

    <!-- Familia y visitas -->
    <div class="album-pagina album-hoja-5">
      <h2>Familia y primeras visitas</h2>
      <div class="album-linea-llenar"><span>Nombre de los abuelos</span>${renglones(4)}</div>
      <div class="album-linea-llenar"><span>¿Quiénes lo visitaron al nacer?</span>${renglones(7)}</div>
      <div class="album-linea-llenar"><span>Regalos que recibió</span>${renglones(7)}</div>
    </div>

    <!-- Espacio para fotos -->
    <div class="album-pagina album-hoja-6">
      <h2>Momentos para recordar</h2>
      <div class="album-fotos-grid">
        <div class="album-foto-caja"></div>
        <div class="album-foto-caja"></div>
        <div class="album-foto-caja"></div>
        <div class="album-foto-caja"></div>
      </div>
    </div>

    <!-- Bitácora mensual -->
    <div class="album-pagina album-hoja-7">
      <h2>Bitácora del primer año</h2>
      <table class="album-tabla-bitacora">
        <thead>
          <tr><th>Mes</th><th>Peso</th><th>Tamaño</th><th>Logro del mes</th></tr>
        </thead>
        <tbody>
          ${filasBitacora}
        </tbody>
      </table>
    </div>

    <!-- Primeras veces -->
    <div class="album-pagina album-hoja-8">
      <h2>Sus primeras veces</h2>
      <div class="album-linea-llenar">
        <span>Le salió su primer diente <em>(Indica la fecha o momento especial)</em></span>
        ${renglonesCortos(2)}
      </div>
      <div class="album-linea-llenar">
        <span>Empezó a gatear <em>(Indica la fecha o momento especial)</em></span>
        ${renglonesCortos(2)}
      </div>
      <div class="album-linea-llenar">
        <span>Dio sus primeros pasos <em>(Indica la fecha o momento especial)</em></span>
        ${renglonesCortos(2)}
      </div>
      <div class="album-linea-llenar">
        <span>Su primera palabra fue <em>(Indica la fecha o momento especial)</em></span>
        ${renglonesCortos(2)}
      </div>
    </div>

    <!-- Preferencias -->
    <div class="album-pagina album-hoja-9">
      <h2>${unicoTexto}</h2>
      <div class="album-linea-llenar"><span>Lo que más le gusta</span>${renglones(6)}</div>
      <div class="album-linea-llenar"><span>Lo que le hace enojar</span>${renglones(6)}</div>
      <div class="album-linea-llenar"><span>Los sabores que más disfruta</span>${renglones(6)}</div>
    </div>
<!-- Reportes completos anexados al final del Álbum -->
    ${construirReporteFechaParaAlbum(datos)}
    ${construirReporteNombreParaAlbum(datos)}
  `;
}

// ---------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${dia} ${meses[Number(mes) - 1]} ${anio}`;
}

// ---------------------------------------------------------------
// ESTADOS VACÍOS: si entran sin haber hecho Iniciar
// ---------------------------------------------------------------
function verificarEstadosVacios() {
  if (!datosBebe) {
    document.getElementById('reporte-fecha-contenido').innerHTML = `
      <div class="estado-vacio">
        <p>Aún no has generado un Mapa Energético.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Ir a Iniciar</button>
      </div>`;
    document.getElementById('reporte-nombre-contenido').innerHTML = `
      <div class="estado-vacio">
        <p>Aún no has generado un Mapa Energético.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Ir a Iniciar</button>
      </div>`;
    document.getElementById('resumen-contenido').innerHTML = `
      <div class="estado-vacio">
        <p>Aún no hay un resumen que mostrar.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Ir a Iniciar</button>
      </div>`;
    document.getElementById('album-contenido').innerHTML = `
      <div class="estado-vacio">
        <p>El Álbum de tu bebé estará listo cuando nos indiques que ya nació.</p>
        <button class="boton-primario" onclick="irAPantalla('iniciar')">Ir a Iniciar</button>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarIconos();

  datosBebe = cargarDatosBebe();

  if (datosBebe) {
    renderizarReporteFecha(datosBebe);
    renderizarReporteNombre(datosBebe);
    renderizarResumen(datosBebe);
    renderizarAlbum(datosBebe);
  } else {
    verificarEstadosVacios();
  }

  // La pantalla de Bienvenida siempre se muestra primero al entrar.
  irAPantalla('bienvenida');
});
