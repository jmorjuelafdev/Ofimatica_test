const dom = {
  pregunta: document.getElementById('pregunta'),
  opciones: document.getElementById('opciones'),
  questionCount: document.getElementById('questionCount'),
  progressText: document.getElementById('progressText'),
  panelResumen: document.getElementById('panelResumen'),
  timer: document.getElementById('timer'),
  btnAnterior: document.getElementById('btnAnterior'),
  btnSiguiente: document.getElementById('btnSiguiente'),
  btnFinalizar: document.getElementById('btnFinalizar'),
  btnComenzar: document.getElementById('btnComenzar'),
  datasetSelect: document.getElementById('datasetSelect'),
  modal: document.getElementById('modalResultado'),
  detalleResultado: document.getElementById('detalleResultado'),
  listaResumen: document.getElementById('listaResumen'),
  mapaPreguntas: document.getElementById('mapaPreguntas'),
  landingScreen: document.getElementById('landingScreen'),
  appShell: document.getElementById('appShell'),
  adminScreen: document.getElementById('adminScreen'),
  btnEntrarTest: document.getElementById('btnEntrarTest'),
  btnAdmin: document.getElementById('btnAdmin'),
  btnVolverInicio: document.getElementById('btnVolverInicio'),
  btnSalirAdmin: document.getElementById('btnSalirAdmin'),
  landingStatusText: document.getElementById('landingStatusText'),
  candidateForm: document.getElementById('candidateForm'),
  inputNombre: document.getElementById('inputNombre'),
  inputDocumento: document.getElementById('inputDocumento'),
  btnCerrarModal: document.getElementById('btnCerrarModal'),
  adminPassword: document.getElementById('adminPassword'),
  adminError: document.getElementById('adminError'),
  adminLoginView: document.getElementById('adminLoginView'),
  adminResultsView: document.getElementById('adminResultsView'),
  adminTabla: document.getElementById('adminTabla'),
  adminDetalle: document.getElementById('adminDetalle'),
  adminFilterDocumento: document.getElementById('adminFilterDocumento'),
  adminFilterPerfil: document.getElementById('adminFilterPerfil'),
  adminFilterFecha: document.getElementById('adminFilterFecha'),
  btnIngresarAdmin: document.getElementById('btnIngresarAdmin'),
  themeToggle: document.getElementById('themeToggle'),
  perfilDescripcion: document.getElementById('perfilDescripcion'),
  btnExportExcel: document.getElementById('btnExportExcel'),
  btnExportPdf: document.getElementById('btnExportPdf')
};

const PERFIL_MINIMOS = {
  'Operativo y servicios generales': 55,
  'Logístico y Operaciones': 60,
  'Comercial y Atención al Cliente': 65,
  'Administrativo / Oficina': 70,
  'Financiero / Contable': 75
};

const STORAGE_KEYS = {
  RESULTADOS: 'ofimaticaResultados',
  TEMA: 'ofimaticaTema'
};

const TEST_DURATION = 50 * 60; // 50 minutos
const TOTAL_PREGUNTAS = 25;
const ADMIN_PASSWORD = 'Talento2026';
const THEMES = ['dark', 'light'];
const THEME_MEDIA_QUERY = '(prefers-color-scheme: light)';
const PERFIL_DESCRIPCIONES = {
  'src/json/administrativo_oficina.json': 'Cargos afines: Auxiliar administrativo, secretario/a, recepcionista, asistente ejecutivo, auxiliar de archivo.',
  'src/json/logistico_operaciones.json': 'Cargos afines: Auxiliar logístico, coordinador de inventarios, analista de operaciones.',
  'src/json/financiero_contable.json': 'Cargos afines: Auxiliar contable, analista financiero, auxiliar de facturación.',
  'src/json/comercial_at_cliente.json': 'Cargos afines: Agente de call center, asesor comercial, ejecutivo de servicio al cliente.',
  'src/json/operativo_servicios.json': 'Cargos afines: Vigilancia privada, portería, control de accesos, apoyo operativo.'
};

const PERFIL_INTERPRETACIONES = {
  'Operativo y servicios generales': [
    { min: 75, descripcion: 'Excelente, potencial de crecimiento.' },
    { min: 55, descripcion: 'Cumple con los requisitos del área.' },
    { min: 0, descripcion: 'Riesgo operativo (registros, reportes, comunicación).' }
  ],
  'Logístico y Operaciones': [
    { min: 80, descripcion: 'Excelente, alta confiabilidad en registros.' },
    { min: 60, descripcion: 'Cumple con los estándares de logística.' },
    { min: 0, descripcion: 'Riesgo operativo (control de inventarios, datos).' }
  ],
  'Comercial y Atención al Cliente': [
    { min: 80, descripcion: 'Excelente, alta eficiencia digital.' },
    { min: 65, descripcion: 'Cumple con los objetivos comerciales.' },
    { min: 0, descripcion: 'Riesgo operativo (correo, CRM, registros).' }
  ],
  'Administrativo / Oficina': [
    { min: 85, descripcion: 'Excelente, alto dominio ofimático.' },
    { min: 70, descripcion: 'Cumple con los requerimientos administrativos.' },
    { min: 0, descripcion: 'Riesgo administrativo (documentos, reportes).' }
  ],
  'Financiero / Contable': [
    { min: 85, descripcion: 'Excelente, alta precisión digital.' },
    { min: 75, descripcion: 'Cumple con los parámetros financieros.' },
    { min: 0, descripcion: 'Riesgo crítico (errores en datos y reportes).' }
  ]
};

let preguntas = [];
let totalPreguntas = 0;
let actual = 0;
let puntaje = 0;
let aciertos = 0;
let tiempoRestante = TEST_DURATION;
let temporizador = null;
let respondidas = new Set();
let respuestasUsuario = [];
let datasetNombre = '';
let datasetArchivo = '';
let candidato = null;
let testEnCurso = false;
let resultadosCache = [];
let vistaActual = 'landing';
let systemThemeWatcher = null;

function mezclar(array = []) {
  const copia = array.slice();
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function interpretarResultado(perfil, porcentaje) {
  const reglas = PERFIL_INTERPRETACIONES[perfil];
  if (!reglas || !reglas.length) {
    return porcentaje >= 70 ? 'Desempeño aceptable.' : 'Requiere refuerzo en competencias digitales.';
  }
  const regla = reglas.find((item) => porcentaje >= item.min) || reglas[reglas.length - 1];
  return regla.descripcion;
}

function buildResultadosData() {
  return obtenerResultadosFiltrados().map((registro) => ({
    Candidato: registro.candidato,
    Documento: registro.documento,
    Perfil: registro.dataset,
    Aciertos: `${registro.aciertos}/${registro.total}`,
    Porcentaje: `${registro.porcentaje}%`,
    Interpretacion: registro.interpretacion || interpretarResultado(registro.dataset, registro.porcentaje || 0),
    Resultado: registro.aprobado ? 'Aprobado' : 'Reprobado',
    Fecha: new Date(registro.fecha).toLocaleString('es-CO')
  }));
}

function exportarExcel() {
  const datos = buildResultadosData();
  if (!datos.length) {
    alert('No hay registros para exportar con los filtros actuales.');
    return;
  }
  const encabezados = Object.keys(datos[0]);
  const filas = datos.map((fila) => encabezados.map((clave) => fila[clave]));
  const csv = [encabezados.join(';'), ...filas.map((celdas) => celdas.join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-test-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportarPdf() {
  const datos = buildResultadosData();
  if (!datos.length) {
    alert('No hay registros para exportar con los filtros actuales.');
    return;
  }
  if (!window.jspdf?.jsPDF) {
    alert('No se pudo cargar la librería para exportar a PDF.');
    return;
  }
  const doc = new window.jspdf.jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text('Informe resultados Test Ofimática', 14, 18);
  doc.setFontSize(10);
  const headers = ['Candidato', 'Documento', 'Perfil', 'Puntaje', 'Aciertos', 'Porcentaje', 'Fecha'];
  const rows = datos.map((fila) => headers.map((key) => fila[key]));
  const startY = 26;
  let posY = startY;
  doc.setFont('Helvetica', 'bold');
  doc.text(headers.join(' | '), 14, posY);
  doc.setFont('Helvetica', 'normal');
  posY += 6;
  rows.forEach((row) => {
    doc.text(row.join(' | '), 14, posY);
    posY += 6;
    if (posY > 190) {
      doc.addPage();
      posY = 20;
    }
  });
  doc.save(`reporte-test-${Date.now()}.pdf`);
}

function sanitizeTheme(value) {
  return THEMES.includes(value) ? value : 'dark';
}

function getSystemTheme() {
  if (window.matchMedia) {
    return window.matchMedia(THEME_MEDIA_QUERY).matches ? 'light' : 'dark';
  }
  return 'dark';
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TEMA);
    return sanitizeTheme(stored);
  } catch (error) {
    console.warn('No se pudo leer el tema almacenado', error);
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMA, sanitizeTheme(theme));
  } catch (error) {
    console.warn('No se pudo guardar el tema seleccionado', error);
  }
}

function applyTheme(theme) {
  if (!document.body) return;
  const targetTheme = sanitizeTheme(theme);
  document.body.dataset.theme = targetTheme;
  const isLight = targetTheme === 'light';
  if (dom.themeToggle) {
    dom.themeToggle.dataset.mode = targetTheme;
    const label = dom.themeToggle.querySelector('.theme-toggle__label');
    if (label) {
      label.textContent = isLight ? 'Modo oscuro' : 'Modo claro';
    }
    dom.themeToggle.setAttribute('aria-pressed', String(isLight));
  }
}

function handleSystemThemeChange(event) {
  if (getStoredTheme()) return;
  applyTheme(event.matches ? 'light' : 'dark');
}

function initializeTheme() {
  const stored = getStoredTheme();
  applyTheme(stored || getSystemTheme());

  if (window.matchMedia) {
    systemThemeWatcher = window.matchMedia(THEME_MEDIA_QUERY);
    if (systemThemeWatcher?.addEventListener) {
      systemThemeWatcher.addEventListener('change', handleSystemThemeChange);
    } else if (systemThemeWatcher?.addListener) {
      systemThemeWatcher.addListener(handleSystemThemeChange);
    }
  }
}

function toggleTheme() {
  const current = document.body?.dataset.theme === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  saveTheme(next);
}

function prepararPreguntas(lista = []) {
  const universo = Array.isArray(lista) ? lista.slice(0, TOTAL_PREGUNTAS) : [];
  return universo.map((pregunta, indice) => {
    const opcionesOriginales = Array.isArray(pregunta.options || pregunta.opciones)
      ? [...(pregunta.options || pregunta.opciones)]
      : [];
    const respuestaIdx =
      typeof pregunta.correct_answer === 'number'
        ? pregunta.correct_answer
        : typeof pregunta.respuesta_correcta === 'number'
          ? pregunta.respuesta_correcta
          : 0;
    const enunciado = pregunta.question || pregunta.pregunta || 'Pregunta sin texto';
    const explicacion = pregunta.explicacion || pregunta.explanation || '';
    const puntaje = typeof pregunta.puntaje === 'number' ? pregunta.puntaje : 4;
    const imagen = pregunta.image || pregunta.imagen || null;
    if (!opcionesOriginales.length) {
      return { ...pregunta, pregunta: enunciado, explicacion, puntaje, imagen, opciones: [], respuesta_correcta: 0 };
    }
    const idxCorrecto = Math.min(Math.max(respuestaIdx ?? 0, 0), opcionesOriginales.length - 1);
    const opcionCorrecta = opcionesOriginales[idxCorrecto];
    const distractores = opcionesOriginales.filter((_, idx) => idx !== idxCorrecto);
    while (distractores.length < 2) {
      distractores.push(distractores[distractores.length - 1] || opcionCorrecta);
    }
    const seleccion = [...distractores.slice(0, 2), opcionCorrecta];
    const opciones = mezclar(seleccion);
    return {
      ...pregunta,
      pregunta: enunciado,
      explicacion,
      puntaje,
      imagen,
      opciones,
      respuesta_correcta: opciones.indexOf(opcionCorrecta),
      ordenOriginal: indice + 1
    };
  });
}

function formatearTiempo(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, '0');
  const seg = String(segundos % 60).padStart(2, '0');
  return `${min}:${seg}`;
}

function bloquearFormularioCandidato(estado) {
  dom.inputNombre.disabled = estado;
  dom.inputDocumento.disabled = estado;
  dom.datasetSelect.disabled = estado;
}

function landingStatus(texto) {
  dom.landingStatusText.textContent = texto;
}

function resetearInterfaz() {
  preguntas = [];
  totalPreguntas = 0;
  actual = 0;
  puntaje = 0;
  aciertos = 0;
  respondidas = new Set();
  respuestasUsuario = [];
  candidato = null;
  datasetNombre = '';
  datasetArchivo = '';
  testEnCurso = false;
  tiempoRestante = TEST_DURATION;
  dom.questionCount.textContent = 'Pregunta 0 de 0';
  dom.progressText.textContent = '0% completado';
  dom.pregunta.textContent = 'Registra tus datos, selecciona un perfil y haz clic en “Comenzar test”.';
  dom.opciones.innerHTML = '';
  dom.mapaPreguntas.innerHTML = '';
  dom.panelResumen.textContent = `Llevas 0 de ${TOTAL_PREGUNTAS} preguntas respondidas.`;
  dom.timer.textContent = formatearTiempo(TEST_DURATION);
  activarControles(false);
}

function mostrarLanding() {
  dom.modal.hidden = true;
  dom.appShell.classList.add('is-hidden');
  dom.adminScreen.classList.add('is-hidden');
  dom.landingScreen.classList.remove('is-hidden');
  dom.candidateForm.reset();
  dom.datasetSelect.value = '';
  actualizarDescripcionPerfil('');
  bloquearFormularioCandidato(false);
  vistaActual = 'landing';
}

function mostrarTest() {
  dom.landingScreen.classList.add('is-hidden');
  dom.adminScreen.classList.add('is-hidden');
  dom.appShell.classList.remove('is-hidden');
  resetearInterfaz();
  vistaActual = 'test';
}

function volverAlInicioDesdeTest() {
  if (vistaActual !== 'test') {
    mostrarLanding();
    return;
  }
  const ejecutarSalida = () => {
    if (testEnCurso) {
      detenerTimer();
      testEnCurso = false;
    }
    resetearInterfaz();
    mostrarLanding();
  };

  if (testEnCurso && window.Swal) {
    Swal.fire({
      title: '¿Salir del test?',
      text: 'Si abandonas ahora, perderás el progreso realizado y deberás iniciar un nuevo intento.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Continuar en el test',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        ejecutarSalida();
      }
    });
    return;
  }

  if (testEnCurso) {
    const confirma = window.confirm('Si abandonas el test se perderá el avance. ¿Deseas continuar?');
    if (!confirma) return;
  }

  ejecutarSalida();
}

function limpiarFiltrosAdmin() {
  if (dom.adminFilterDocumento) dom.adminFilterDocumento.value = '';
  if (dom.adminFilterPerfil) dom.adminFilterPerfil.value = 'todos';
  if (dom.adminFilterFecha) dom.adminFilterFecha.value = '';
}

function mostrarAdminScreen() {
  dom.landingScreen.classList.add('is-hidden');
  dom.appShell.classList.add('is-hidden');
  dom.adminScreen.classList.remove('is-hidden');
  dom.adminLoginView.hidden = false;
  dom.adminLoginView.classList.remove('is-hidden');
  dom.adminResultsView.hidden = true;
  dom.adminResultsView.classList.add('is-hidden');
  dom.adminPassword.value = '';
  dom.adminError.textContent = '';
  limpiarFiltrosAdmin();
  vistaActual = 'admin';
}

function salirAdminScreen() {
  dom.adminScreen.classList.add('is-hidden');
  dom.adminPassword.value = '';
  dom.adminError.textContent = '';
  dom.adminLoginView.hidden = false;
  dom.adminLoginView.classList.remove('is-hidden');
  dom.adminResultsView.hidden = true;
  dom.adminResultsView.classList.add('is-hidden');
  limpiarFiltrosAdmin();
  mostrarLanding();
}

function actualizarPanelResumen() {
  const total = totalPreguntas || TOTAL_PREGUNTAS;
  dom.panelResumen.textContent = `Llevas ${respondidas.size} de ${total} preguntas respondidas.`;
}

function actualizarTimer() {
  if (tiempoRestante <= 0) {
    finalizarTest(true);
    return;
  }
  tiempoRestante -= 1;
  dom.timer.textContent = formatearTiempo(tiempoRestante);
}

function iniciarTimer() {
  detenerTimer();
  dom.timer.textContent = formatearTiempo(tiempoRestante);
  temporizador = setInterval(actualizarTimer, 1000);
}

function detenerTimer() {
  if (temporizador) {
    clearInterval(temporizador);
    temporizador = null;
  }
}

function cargarPreguntas() {
  if (testEnCurso) {
    alert('Ya hay un test en curso. Finaliza el actual antes de iniciar otro.');
    return;
  }
  if (!dom.candidateForm.reportValidity()) {
    return;
  }

  const archivo = dom.datasetSelect.value;
  if (!archivo) {
    alert('Selecciona un perfil antes de comenzar.');
    return;
  }

  candidato = {
    nombre: dom.inputNombre.value.trim(),
    documento: dom.inputDocumento.value.replace(/\D+/g, '')
  };

  if (!candidato.nombre || candidato.documento.length < 5) {
    alert('Debes registrar tu nombre e identificación (mínimo 5 dígitos numéricos).');
    return;
  }

  datasetNombre = dom.datasetSelect.options[dom.datasetSelect.selectedIndex].textContent;
  datasetArchivo = archivo;
  dom.btnComenzar.disabled = true;
  bloquearFormularioCandidato(true);
  landingStatus(`Cargando test para ${candidato.nombre}…`);

  fetch(archivo)
    .then((r) => r.json())
    .then((data) => {
      const listadoCrudo = Array.isArray(data?.preguntas)
        ? data.preguntas
        : Array.isArray(data)
          ? data
          : [];
      preguntas = prepararPreguntas(listadoCrudo);
      totalPreguntas = preguntas.length;
      if (!totalPreguntas) {
        throw new Error('El archivo seleccionado no contiene preguntas.');
      }
      respuestasUsuario = new Array(totalPreguntas).fill(null);
      respondidas = new Set();
      puntaje = 0;
      aciertos = 0;
      tiempoRestante = TEST_DURATION;
      testEnCurso = true;
      reiniciarEstado();
      mostrarPregunta();
      activarControles(true);
      iniciarTimer();
      landingStatus(`Test en curso para ${candidato.nombre}.`);
    })
    .catch((error) => {
      console.error(error);
      alert('No se pudo cargar el perfil seleccionado. Inténtalo nuevamente.');
      bloquearFormularioCandidato(false);
      landingStatus('Ocurrió un error al iniciar el test.');
    })
    .finally(() => {
      dom.btnComenzar.disabled = false;
    });
}

function reiniciarEstado() {
  actual = 0;
  dom.listaResumen.innerHTML = '';
  dom.detalleResultado.textContent = '';
  dom.questionCount.textContent = `Pregunta 0 de ${totalPreguntas}`;
  dom.progressText.textContent = '0% completado';
  actualizarPanelResumen();
  renderMapaPreguntas();
}

function activarControles(estado) {
  dom.btnAnterior.disabled = !estado;
  dom.btnSiguiente.disabled = !estado;
  dom.btnFinalizar.disabled = !estado;
}

function actualizarDescripcionPerfil(valor) {
  if (!dom.perfilDescripcion) return;
  dom.perfilDescripcion.textContent = PERFIL_DESCRIPCIONES[valor] || 'Cargos afines: Selecciona un perfil para ver la descripción.';
}

function mostrarPregunta() {
  if (!preguntas.length) return;
  const p = preguntas[actual];
  dom.questionCount.textContent = `Pregunta ${actual + 1} de ${totalPreguntas}`;
  dom.progressText.textContent = `${Math.round(((actual + 1) / totalPreguntas) * 100)}% completado`;
  dom.pregunta.innerHTML = '';
  const textoPregunta = document.createElement('span');
  textoPregunta.textContent = p.pregunta;
  dom.pregunta.appendChild(textoPregunta);

  const imagenActual = dom.pregunta.querySelector('img');
  if (imagenActual) imagenActual.remove();
  if (p.imagen) {
    const img = document.createElement('img');
    img.src = p.imagen;
    img.alt = `Referencia visual para la pregunta ${actual + 1}`;
    img.className = 'question-media';
    const imageScale = p.imageSize || p.image_size;
    if (imageScale) {
      img.dataset.scale = imageScale;
    }
    dom.pregunta.appendChild(img);
  }

  dom.opciones.innerHTML = '';

  p.opciones.forEach((opcion, idx) => {
    const li = document.createElement('li');
    const etiqueta = String.fromCharCode(65 + idx);
    li.innerHTML = `<span class="option-label">${etiqueta})</span> <span>${opcion}</span>`;
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.addEventListener('click', () => responder(idx));
    li.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        responder(idx);
      }
    });
    const seleccionUsuario = respuestasUsuario[actual];
    if (seleccionUsuario !== null) {
      li.classList.add('bloqueada');
      if (idx === seleccionUsuario) li.classList.add('seleccionada');
    }
    dom.opciones.appendChild(li);
  });

  dom.btnAnterior.disabled = actual === 0;
  dom.btnSiguiente.disabled = actual === totalPreguntas - 1;
  actualizarPanelResumen();
  actualizarEstadoMapa();
}

function responder(indice) {
  const p = preguntas[actual];
  if (respuestasUsuario[actual] !== null) return;
  respuestasUsuario[actual] = indice;
  respondidas.add(actual);
  const esCorrecta = indice === p.respuesta_correcta;
  if (esCorrecta) {
    aciertos += 1;
    puntaje += p.puntaje || 0;
  }

  const opciones = dom.opciones.querySelectorAll('li');
  opciones.forEach((li, idx) => {
    li.classList.add('bloqueada');
    if (idx === indice) {
      li.classList.add('seleccionada');
    }
  });

  actualizarPanelResumen();
  actualizarEstadoMapa();
}

function anterior() {
  if (actual === 0) return;
  actual -= 1;
  mostrarPregunta();
}

function siguiente() {
  if (actual >= totalPreguntas - 1) return;
  actual += 1;
  mostrarPregunta();
}

function irAPregunta(indice) {
  if (indice < 0 || indice >= totalPreguntas) return;
  actual = indice;
  mostrarPregunta();
}

function construirRegistroResultado(porcentaje, fuePorTiempo) {
  const porcentajeTexto = `${porcentaje}%`;
  const perfilClave = datasetNombre || 'Perfil';
  const minimo = PERFIL_MINIMOS[perfilClave] ?? 0;
  const aprobado = porcentaje >= minimo;
  const interpretacion = interpretarResultado(perfilClave, porcentaje);
  return {
    id: Date.now(),
    candidato: candidato?.nombre || 'Sin nombre',
    documento: candidato?.documento || 'Sin documento',
    dataset: datasetNombre || 'Perfil',
    puntaje: porcentajeTexto,
    aciertos,
    total: totalPreguntas,
    porcentaje,
    aprobado,
    interpretacion,
    fecha: new Date().toISOString(),
    tiempoAgotado: fuePorTiempo,
    respuestas: respuestasUsuario.slice(),
    preguntas: preguntas.map((p, idx) => ({
      enunciado: p.pregunta,
      correcta: p.respuesta_correcta,
      respondio: respuestasUsuario[idx],
      opciones: p.opciones
    }))
  };
}

function guardarRegistroResultado(registro) {
  resultadosCache.push(registro);
  resultadosCache.sort((a, b) => parseFloat(b.puntaje) - parseFloat(a.puntaje));
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTADOS, JSON.stringify(resultadosCache));
  } catch (error) {
    console.warn('No se pudo guardar el resultado', error);
  }
}

function cargarResultados() {
  try {
    const almacenados = localStorage.getItem(STORAGE_KEYS.RESULTADOS);
    resultadosCache = almacenados ? JSON.parse(almacenados) : [];
  } catch (error) {
    console.warn('No se pudieron leer los resultados guardados', error);
    resultadosCache = [];
  }
}

function finalizarTest(fuePorTiempo = false) {
  if (!testEnCurso) return;
  detenerTimer();
  activarControles(false);
  dom.modal.hidden = false;
  testEnCurso = false;

  const porcentaje = totalPreguntas ? Math.round((aciertos / totalPreguntas) * 100) : 0;
  dom.detalleResultado.textContent = fuePorTiempo
    ? 'El tiempo se agotó. Tus respuestas han sido enviadas.'
    : 'Has finalizado el test. El área administrativa revisará tu desempeño.';
  dom.listaResumen.innerHTML = `
    <li><strong>Puntaje:</strong> ${puntaje.toFixed(1)} puntos</li>
    <li><strong>Aciertos:</strong> ${aciertos} de ${totalPreguntas} (${porcentaje}%)</li>
    <li><strong>Perfil evaluado:</strong> ${datasetNombre}</li>
  `;

  const registro = construirRegistroResultado(porcentaje, fuePorTiempo);
  guardarRegistroResultado(registro);
  bloquearFormularioCandidato(false);
  dom.candidateForm.reset();
  dom.datasetSelect.value = '';
  actualizarTablaAdmin();
  landingStatus('Último test registrado. Esperando al próximo candidato.');
}

function cerrarModal() {
  dom.modal.hidden = true;
  mostrarLanding();
}

function renderMapaPreguntas() {
  dom.mapaPreguntas.innerHTML = '';
  preguntas.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'map-item';
    btn.textContent = idx + 1;
    btn.addEventListener('click', () => irAPregunta(idx));
    dom.mapaPreguntas.appendChild(btn);
  });
  actualizarEstadoMapa();
}

function actualizarEstadoMapa() {
  const botones = dom.mapaPreguntas.querySelectorAll('.map-item');
  botones.forEach((btn) => {
    const idx = parseInt(btn.textContent, 10) - 1;
    btn.classList.remove('activo', 'estado-pendiente', 'estado-correcto', 'estado-incorrecto', 'estado-respondida');
    const respuesta = respuestasUsuario[idx];
    if (respuesta === null || Number.isNaN(respuesta)) {
      btn.classList.add('estado-pendiente');
    } else {
      btn.classList.add('estado-respondida');
    }
    if (idx === actual) {
      btn.classList.add('activo');
    }
  });
}

function manejarIngresoAdmin() {
  if (dom.adminPassword.value.trim() !== ADMIN_PASSWORD) {
    dom.adminError.textContent = 'Clave incorrecta. Inténtalo nuevamente.';
    return;
  }
  dom.adminError.textContent = '';
  dom.adminLoginView.hidden = true;
  dom.adminLoginView.classList.add('is-hidden');
  dom.adminResultsView.hidden = false;
  dom.adminResultsView.classList.remove('is-hidden');
  actualizarTablaAdmin();
}

function obtenerResultadosFiltrados() {
  if (!resultadosCache.length) return [];
  const docQuery = (dom.adminFilterDocumento?.value || '').replace(/\D+/g, '');
  const perfilSeleccionado = dom.adminFilterPerfil?.value || 'todos';
  const fechaFiltro = dom.adminFilterFecha?.value || '';

  return resultadosCache.filter((registro) => {
    const documento = (registro.documento || '').toString();
    const coincideDocumento = !docQuery || documento.includes(docQuery);
    const coincidePerfil = perfilSeleccionado === 'todos' || registro.dataset === perfilSeleccionado;
    const isoFecha = registro.fecha ? new Date(registro.fecha).toISOString().slice(0, 10) : '';
    const coincideFecha = !fechaFiltro || isoFecha === fechaFiltro;
    return coincideDocumento && coincidePerfil && coincideFecha;
  });
}

function actualizarTablaAdmin() {
  const resultados = obtenerResultadosFiltrados();
  if (!resultados.length) {
    dom.adminTabla.innerHTML = '<tr><td colspan="8">No se encontraron registros con los filtros actuales.</td></tr>';
    dom.adminDetalle.textContent = 'Selecciona un registro para ver las respuestas.';
    return;
  }

  const filas = resultados
    .map((registro) => `
      <tr>
        <td>${registro.candidato}</td>
        <td>${registro.documento}</td>
        <td>${registro.dataset}</td>
        <td>${registro.porcentaje}%</td>
        <td>${registro.aciertos}/${registro.total}</td>
        <td>
          <span class="badge ${registro.aprobado ? 'ok' : 'warn'}">${registro.aprobado ? 'Aprobado' : 'Reprobado'}</span>
        </td>
        <td>${new Date(registro.fecha).toLocaleString('es-CO')}</td>
        <td><button class="primary" data-id="${registro.id}">Ver detalle</button></td>
      </tr>
    `)
    .join('');
  dom.adminTabla.innerHTML = filas;
}

function mostrarDetalleAdminPorId(id) {
  const registro = resultadosCache.find((item) => item.id === id);
  if (!registro) {
    dom.adminDetalle.textContent = 'Registro no encontrado.';
    return;
  }
  const detallePreguntas = registro.preguntas
    .map((p, idx) => {
      const letra = p.respondio === null || p.respondio === undefined ? '—' : String.fromCharCode(65 + p.respondio);
      const correcta = String.fromCharCode(65 + p.correcta);
      return `<li><strong>P${idx + 1}:</strong> ${p.enunciado}<br/>Respuesta candidato: ${letra} · Correcta: ${correcta}</li>`;
    })
    .join('');

  const interpretacion = registro.interpretacion || interpretarResultado(registro.dataset, registro.porcentaje || 0);
  const porcentajeTexto = `${registro.porcentaje ?? 0}%`;

  dom.adminDetalle.innerHTML = `
    <p><strong>Candidato:</strong> ${registro.candidato} (${registro.documento})</p>
    <p><strong>Perfil:</strong> ${registro.dataset}</p>
    <p><strong>Resultados:</strong> ${porcentajeTexto} · Aciertos: ${registro.aciertos}/${registro.total}<br/>${interpretacion}</p>
    <p><strong>Fecha:</strong> ${new Date(registro.fecha).toLocaleString('es-CO')}</p>
    <ul>${detallePreguntas}</ul>
  `;
}

function manejarClickTabla(event) {
  const boton = event.target.closest('button[data-id]');
  if (!boton) return;
  const id = Number(boton.getAttribute('data-id'));
  mostrarDetalleAdminPorId(id);
}

function finalizarTestManual() {
  if (!testEnCurso) {
    alert('No hay un test en curso.');
    return;
  }
  finalizarTest(false);
}

// Eventos principales

dom.btnEntrarTest.addEventListener('click', mostrarTest);
dom.btnAdmin.addEventListener('click', mostrarAdminScreen);
dom.btnVolverInicio?.addEventListener('click', volverAlInicioDesdeTest);
dom.btnComenzar.addEventListener('click', cargarPreguntas);
dom.btnAnterior.addEventListener('click', anterior);
dom.btnSiguiente.addEventListener('click', siguiente);
dom.btnFinalizar.addEventListener('click', finalizarTestManual);
dom.btnCerrarModal.addEventListener('click', cerrarModal);
dom.btnIngresarAdmin.addEventListener('click', manejarIngresoAdmin);
dom.adminTabla.addEventListener('click', manejarClickTabla);
dom.inputDocumento.addEventListener('input', () => {
  dom.inputDocumento.value = dom.inputDocumento.value.replace(/\D+/g, '');
});
dom.adminPassword.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    manejarIngresoAdmin();
  }
});

dom.btnSalirAdmin.addEventListener('click', salirAdminScreen);
dom.adminFilterDocumento?.addEventListener('input', actualizarTablaAdmin);
dom.adminFilterPerfil?.addEventListener('change', actualizarTablaAdmin);
dom.adminFilterFecha?.addEventListener('input', actualizarTablaAdmin);
dom.themeToggle?.addEventListener('click', toggleTheme);
dom.datasetSelect?.addEventListener('change', (event) => actualizarDescripcionPerfil(event.target.value));
dom.btnExportExcel?.addEventListener('click', exportarExcel);
dom.btnExportPdf?.addEventListener('click', exportarPdf);

window.addEventListener('beforeunload', () => detenerTimer());

// Inicio
resetearInterfaz();
cargarResultados();
mostrarLanding();
initializeTheme();
