const screens = [
  {
    title: "Pantalla 1 — Admisión",
    desc: "Registro del paciente, motivo de atención y validación de cobertura."
  },
  {
    title: "Pantalla 2 — Clasificación inicial",
    desc: "Evaluación temprana para determinar si el paciente es grave o no."
  },
  {
    title: "Pantalla 3 — Triage",
    desc: "Captura de signos vitales, síntoma principal y nivel de triage."
  },
  {
    title: "Pantalla 4 — Diagnóstico",
    desc: "Selección de estudios y obtención de diagnóstico simulado."
  },
  {
    title: "Pantalla 5 — Decisión clínica",
    desc: "Determinación de si el caso puede resolverse en clínica o requiere hospital."
  },
  {
    title: "Pantalla 6 — Control de tiempo",
    desc: "Validación de permanencia máxima en clínica de 2 horas."
  },
  {
    title: "Pantalla 7 — Resultado del caso",
    desc: "Resolución ambulatoria o escalamiento hospitalario."
  },
  {
    title: "Pantalla 8 — Traslado",
    desc: "Coordinación con ambulancia y hospital receptor cuando aplica."
  },
  {
    title: "Pantalla 9 — Liquidación",
    desc: "Distribución financiera entre paciente, aseguradora y operadores."
  },
  {
    title: "Pantalla 10 — Dashboard",
    desc: "Indicadores ejecutivos del modelo."
  }
];

const timelineStages = [
  "Admisión",
  "Clasificación",
  "Triage",
  "Diagnóstico",
  "Decisión",
  "Tiempo",
  "Resultado",
  "Traslado",
  "Liquidación",
  "Dashboard"
];

function defaultState() {
  return {
    mode: "interactive",
    currentStep: 0,
    autoTimer: null,
    autoRunning: false,
    autoPaused: false,
    patient: {
      folio: "SD-URG-2026-001",
      nombre: "María López",
      nacimiento: "1986-08-14",
      poliza: "POL-AXA-882341",
      motivo: "Dolor torácico y mareo",
      edad: 39
    },
    coverage: {
      validada: false,
      activa: true,
      deducible: 2000,
      elegible: true
    },
    classification: {
      grave: false
    },
    triage: {
      signos: "TA 110/70, FC 98, FR 20, Sat 97%",
      sintoma: "Dolor torácico moderado",
      nivel: "Nivel 3 – Urgente estable",
      mensaje: "Se puede atender en clínica"
    },
    diagnostic: {
      estudios: ["Laboratorio", "ECG"],
      resultado: "Dolor musculoesquelético, sin datos de evento agudo"
    },
    decision: {
      resolubleClinica: true
    },
    timeControl: {
      minutos: 80,
      maximo: 120,
      excedido: false
    },
    outcome: {
      tipo: "clinica",
      texto: "Paciente resuelto en clínica",
      alta: "Alta médica"
    },
    transfer: {
      required: false,
      hospital: "San Ángel Inn",
      ambulancia: "En camino",
      eta: "12 min",
      folioReferencia: "REF-SD-49021",
      trasladoPropio: "Permitido con indicación médica y expediente completo"
    },
    financial: {
      costoTotal: 3850,
      pagoPaciente: 2000,
      pagoAseguradora: 1850,
      saludDigna: 1500,
      hospital: 0,
      operador: 2350,
      tieneSeguro: true
    },
    dashboard: {
      pacientes: 128,
      pctClinica: 74,
      pctHospital: 26,
      tiempoPromedio: "1h 18m",
      costoPromedio: "$3,850"
    }
  };
}

let state = defaultState();

const stepList = document.getElementById("stepList");
const timeline = document.getElementById("timeline");
const screenTitle = document.getElementById("screenTitle");
const screenDescription = document.getElementById("screenDescription");
const screenContent = document.getElementById("screenContent");
const stepBadge = document.getElementById("stepBadge");

const summaryFolio = document.getElementById("summaryFolio");
const summaryName = document.getElementById("summaryName");
const summaryAge = document.getElementById("summaryAge");
const summaryMode = document.getElementById("summaryMode");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const recalcBtn = document.getElementById("recalcBtn");
const resetBtn = document.getElementById("resetBtn");

const modeInteractiveBtn = document.getElementById("modeInteractiveBtn");
const modeAutoBtn = document.getElementById("modeAutoBtn");
const startAutoBtn = document.getElementById("startAutoBtn");
const pauseAutoBtn = document.getElementById("pauseAutoBtn");
const resumeAutoBtn = document.getElementById("resumeAutoBtn");

function calcAge(dateStr) {
  if (!dateStr) return "";
  const birth = new Date(dateStr + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatMoney(n) {
  return "$" + Number(n).toLocaleString("es-MX");
}

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m} min`;
}

function recomputeCase() {
  state.patient.edad = calcAge(state.patient.nacimiento);

  const triageText = (state.triage.nivel || "").toLowerCase();
  const severeByTriage = triageText.includes("nivel 1") || triageText.includes("nivel 2");
  const severeByClassification = state.classification.grave === true;
  const exceedsTime = Number(state.timeControl.minutos) > Number(state.timeControl.maximo);

  state.timeControl.excedido = exceedsTime;

  if (severeByClassification) {
    state.triage.mensaje = "Traslado inmediato a hospital";
  } else if (severeByTriage) {
    state.triage.mensaje = "Caso de mayor riesgo: evaluar hospital";
  } else {
    state.triage.mensaje = "Se puede atender en clínica";
  }

  const diagnosticText = (state.diagnostic.resultado || "").toLowerCase();
  const hospitalKeywords = [
    "fractura complicada",
    "cirugía",
    "infarto",
    "evento agudo",
    "trauma mayor",
    "hospital",
    "internamiento",
    "apendicitis",
    "hemorragia"
  ];

  const resultSuggestsHospital = hospitalKeywords.some((k) => diagnosticText.includes(k));

  const shouldTransfer =
    severeByClassification ||
    severeByTriage ||
    resultSuggestsHospital ||
    !state.decision.resolubleClinica ||
    exceedsTime;

  state.transfer.required = shouldTransfer;

  if (shouldTransfer) {
    state.outcome.tipo = "hospital";
    state.outcome.texto = "Requiere hospital";
    state.outcome.alta = "Se activa traslado";
  } else {
    state.outcome.tipo = "clinica";
    state.outcome.texto = "Paciente resuelto en clínica";
    state.outcome.alta = "Alta médica";
  }

  if (state.financial.tieneSeguro) {
    if (state.outcome.tipo === "clinica") {
      state.financial.costoTotal = 3850;
      state.financial.pagoPaciente = 2000;
      state.financial.pagoAseguradora = 1850;
      state.financial.saludDigna = 1500;
      state.financial.hospital = 0;
      state.financial.operador = 2350;
    } else {
      state.financial.costoTotal = 16800;
      state.financial.pagoPaciente = 2000;
      state.financial.pagoAseguradora = 14800;
      state.financial.saludDigna = 1500;
      state.financial.hospital = 11800;
      state.financial.operador = 3500;
    }
  } else {
    if (state.outcome.tipo === "clinica") {
      state.financial.costoTotal = 3850;
      state.financial.pagoPaciente = 3850;
      state.financial.pagoAseguradora = 0;
      state.financial.saludDigna = 2200;
      state.financial.hospital = 0;
      state.financial.operador = 1650;
    } else {
      state.financial.costoTotal = 16800;
      state.financial.pagoPaciente = 16800;
      state.financial.pagoAseguradora = 0;
      state.financial.saludDigna = 1500;
      state.financial.hospital = 11800;
      state.financial.operador = 3500;
    }
  }

  state.dashboard.pctClinica = state.outcome.tipo === "clinica" ? 74 : 69;
  state.dashboard.pctHospital = 100 - state.dashboard.pctClinica;
  state.dashboard.tiempoPromedio = state.outcome.tipo === "clinica" ? "1h 18m" : "1h 46m";
  state.dashboard.costoPromedio = state.outcome.tipo === "clinica" ? "$3,850" : "$5,920";
}

function renderSidebar() {
  if (!stepList) return;

  stepList.innerHTML = "";

  screens.forEach((screen, idx) => {
    const item = document.createElement("div");
    item.className = "step-item";

    if (idx === state.currentStep) item.classList.add("active");
    if (idx < state.currentStep) item.classList.add("done");

    item.innerHTML = `
      <div class="step-number">Paso ${idx + 1}</div>
      <div class="step-name">${timelineStages[idx]}</div>
    `;

    item.addEventListener("click", () => {
      state.currentStep = idx;
      render();
    });

    stepList.appendChild(item);
  });

  if (summaryFolio) summaryFolio.textContent = state.patient.folio;
  if (summaryName) summaryName.textContent = state.patient.nombre || "Sin nombre";
  if (summaryAge) summaryAge.textContent = state.patient.edad ? `${state.patient.edad} años` : "--";
  if (summaryMode) summaryMode.textContent = state.mode === "interactive" ? "Interactivo" : "Automático";
}

function renderTimeline() {
  if (!timeline) return;

  timeline.innerHTML = "";

  timelineStages.forEach((name, idx) => {
    const stage = document.createElement("div");
    stage.className = "timeline-stage";

    if (idx === state.currentStep) stage.classList.add("active");
    if (idx < state.currentStep) stage.classList.add("done");

    let status = "Pendiente";
    if (idx < state.currentStep) status = "Completado";
    if (idx === state.currentStep) status = "En curso";
    if (idx === 7 && state.transfer.required) status = "Traslado activado";
    if (idx === 6) status = state.outcome.tipo === "clinica" ? "Alta en clínica" : "Escalado a hospital";

    stage.innerHTML = `
      <div class="t-step">Etapa ${idx + 1}</div>
      <div class="t-name">${name}</div>
      <div class="t-status">${status}</div>
    `;

    timeline.appendChild(stage);
  });
}

function renderKpis() {
  const patients = document.getElementById("kpiPatients");
  const clinic = document.getElementById("kpiClinic");
  const hospital = document.getElementById("kpiHospital");
  const time = document.getElementById("kpiTime");
  const cost = document.getElementById("kpiCost");

  if (patients) patients.textContent = state.dashboard.pacientes;
  if (clinic) clinic.textContent = `${state.dashboard.pctClinica}%`;
  if (hospital) hospital.textContent = `${state.dashboard.pctHospital}%`;
  if (time) time.textContent = state.dashboard.tiempoPromedio;
  if (cost) cost.textContent = state.dashboard.costoPromedio;
}

function renderScreen() {
  const meta = screens[state.currentStep];

  if (screenTitle) screenTitle.textContent = meta.title;
  if (screenDescription) screenDescription.textContent = meta.desc;
  if (stepBadge) stepBadge.textContent = `Paso ${state.currentStep + 1} de ${screens.length}`;

  switch (state.currentStep) {
    case 0:
      renderAdmission();
      break;
    case 1:
      renderClassification();
      break;
    case 2:
      renderTriage();
      break;
    case 3:
      renderDiagnostic();
      break;
    case 4:
      renderDecision();
      break;
    case 5:
      renderTimeControl();
      break;
    case 6:
      renderOutcome();
      break;
    case 7:
      renderTransfer();
      break;
    case 8:
      renderFinancial();
      break;
    case 9:
      renderDashboard();
      break;
    default:
      renderAdmission();
      break;
  }

  if (prevBtn) prevBtn.disabled = state.currentStep === 0;
  if (nextBtn) nextBtn.disabled = state.currentStep === screens.length - 1;
  if (pauseAutoBtn) pauseAutoBtn.disabled = !state.autoRunning;
  if (resumeAutoBtn) resumeAutoBtn.disabled = !state.autoPaused;
  if (startAutoBtn) startAutoBtn.disabled = state.autoRunning && !state.autoPaused;
}

function renderAdmission() {
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Nombre del paciente</label>
        <input id="inputNombre" value="${state.patient.nombre}" />
      </div>
      <div class="form-group">
        <label>Fecha de nacimiento</label>
        <input id="inputNacimiento" type="date" value="${state.patient.nacimiento}" />
      </div>
      <div class="form-group">
        <label>Número de póliza</label>
        <input id="inputPoliza" value="${state.patient.poliza}" />
      </div>
      <div class="form-group">
        <label>Folio de expediente</label>
        <input id="inputFolio" value="${state.patient.folio}" />
      </div>
      <div class="form-group full">
        <label>Motivo de atención</label>
        <textarea id="inputMotivo">${state.patient.motivo}</textarea>
      </div>
    </div>

    <div class="toolbar" style="margin-top:16px;">
      <div class="toolbar-left">
        <button class="btn btn-success" id="validateCoverageBtn">Validar cobertura</button>
      </div>
    </div>

    <div class="result-box">
      <h3>Resultado de cobertura</h3>
      <div class="result-grid">
        <div class="result-item">
          <div class="label">Cobertura</div>
          <div class="value">${state.coverage.validada ? (state.coverage.activa ? "Activa" : "Inactiva") : "Pendiente de validar"}</div>
        </div>
        <div class="result-item">
          <div class="label">Deducible</div>
          <div class="value">${state.coverage.validada ? formatMoney(state.coverage.deducible) : "--"}</div>
        </div>
        <div class="result-item">
          <div class="label">Elegibilidad</div>
          <div class="value">${state.coverage.validada ? (state.coverage.elegible ? "Elegible" : "No elegible") : "--"}</div>
        </div>
      </div>
    </div>
  `;

  const inputNombre = document.getElementById("inputNombre");
  const inputNacimiento = document.getElementById("inputNacimiento");
  const inputPoliza = document.getElementById("inputPoliza");
  const inputFolio = document.getElementById("inputFolio");
  const inputMotivo = document.getElementById("inputMotivo");
  const validateCoverageBtn = document.getElementById("validateCoverageBtn");

  if (inputNombre) {
    inputNombre.addEventListener("input", (e) => {
      state.patient.nombre = e.target.value;
      renderSidebar();
    });
  }

  if (inputNacimiento) {
    inputNacimiento.addEventListener("input", (e) => {
      state.patient.nacimiento = e.target.value;
      recomputeCase();
      renderSidebar();
    });
  }

  if (inputPoliza) {
    inputPoliza.addEventListener("input", (e) => {
      state.patient.poliza = e.target.value;
    });
  }

  if (inputFolio) {
    inputFolio.addEventListener("input", (e) => {
      state.patient.folio = e.target.value;
      renderSidebar();
    });
  }

  if (inputMotivo) {
    inputMotivo.addEventListener("input", (e) => {
      state.patient.motivo = e.target.value;
    });
  }

  if (validateCoverageBtn) {
    validateCoverageBtn.addEventListener("click", () => {
      state.coverage.validada = true;
      state.coverage.activa = true;
      state.coverage.deducible = 2000;
      state.coverage.elegible = true;
      state.financial.tieneSeguro = true;
      recomputeCase();
      render();
    });
  }
}

function renderClassification() {
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="form-group full">
      <label>¿El paciente es grave?</label>
      <div class="radio-group">
        <div class="chip ${state.classification.grave ? "active-red" : ""}" id="graveYes">Sí</div>
        <div class="chip ${!state.classification.grave ? "active-green" : ""}" id="graveNo">No</div>
      </div>
    </div>

    <div class="result-box">
      <h3>Resultado de clasificación</h3>
      ${
        state.classification.grave
          ? `<div class="alert alert-red">Traslado inmediato a hospital. El caso cumple criterio de severidad desde clasificación inicial.</div>`
          : `<div class="alert alert-green">Paciente no grave. Continúa flujo en clínica para triage, estudios y resolución ambulatoria si aplica.</div>`
      }
    </div>
  `;

  const graveYes = document.getElementById("graveYes");
  const graveNo = document.getElementById("graveNo");

  if (graveYes) {
    graveYes.addEventListener("click", () => {
      state.classification.grave = true;
      recomputeCase();
      render();
    });
  }

  if (graveNo) {
    graveNo.addEventListener("click", () => {
      state.classification.grave = false;
      recomputeCase();
      render();
    });
  }
}

function renderTriage() {
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Signos vitales</label>
        <input id="inputSignos" value="${state.triage.signos}" />
      </div>
      <div class="form-group">
        <label>Síntoma principal</label>
        <input id="inputSintoma" value="${state.triage.sintoma}" />
      </div>
      <div class="form-group full">
        <label>Nivel de triage</label>
        <div class="radio-group">
          <div class="chip ${state.triage.nivel.includes("Nivel 1") ? "active-red" : ""}" data-triage="Nivel 1 – Reanimación">Nivel 1</div>
          <div class="chip ${state.triage.nivel.includes("Nivel 2") ? "active-yellow" : ""}" data-triage="Nivel 2 – Trauma leve">Nivel 2</div>
          <div class="chip ${state.triage.nivel.includes("Nivel 3") ? "active-blue" : ""}" data-triage="Nivel 3 – Urgente estable">Nivel 3</div>
          <div class="chip ${state.triage.nivel.includes("Nivel 4") ? "active-green" : ""}" data-triage="Nivel 4 – Ambulatorio">Nivel 4</div>
        </div>
      </div>
    </div>

    <div class="result-box">
      <h3>Resultado automático</h3>
      <div class="result-grid">
        <div class="result-item">
          <div class="label">Nivel de triage</div>
          <div class="value">${state.triage.nivel}</div>
        </div>
        <div class="result-item">
          <div class="label">Síntoma principal</div>
          <div class="value">${state.triage.sintoma}</div>
        </div>
        <div class="result-item">
          <div class="label">Mensaje</div>
          <div class="value">${state.triage.mensaje}</div>
        </div>
      </div>
    </div>
  `;

  const inputSignos = document.getElementById("inputSignos");
  const inputSintoma = document.getElementById("inputSintoma");

  if (inputSignos) {
    inputSignos.addEventListener("input", (e) => {
      state.triage.signos = e.target.value;
    });
  }

  if (inputSintoma) {
    inputSintoma.addEventListener("input", (e) => {
      state.triage.sintoma = e.target.value;
    });
  }

  screenContent.querySelectorAll("[data-triage]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.triage.nivel = btn.dataset.triage;
      recomputeCase();
      render();
    });
  });
}

function renderDiagnostic() {
  if (!screenContent) return;

  const selected = state.diagnostic.estudios;

  screenContent.innerHTML = `
    <div class="form-group full">
      <label>Selecciona estudios</label>
      <div class="check-group">
        <div class="chip ${selected.includes("Radiografía") ? "active-blue" : ""}" data-estudio="Radiografía">Radiografía</div>
        <div class="chip ${selected.includes("Laboratorio") ? "active-blue" : ""}" data-estudio="Laboratorio">Laboratorio</div>
        <div class="chip ${selected.includes("ECG") ? "active-blue" : ""}" data-estudio="ECG">ECG</div>
      </div>
    </div>

    <div class="toolbar" style="margin-top:10px;">
      <div class="toolbar-left">
        <button class="btn btn-success" id="requestStudiesBtn">Solicitar estudios</button>
      </div>
    </div>

    <div class="result-box">
      <h3>Resultado simulado</h3>
      <div class="result-grid">
        <div class="result-item">
          <div class="label">Estudios solicitados</div>
          <div class="value">${selected.length ? selected.join(", ") : "Ninguno"}</div>
        </div>
        <div class="result-item" style="grid-column:span 2;">
          <div class="label">Diagnóstico</div>
          <div class="value">${state.diagnostic.resultado || "Pendiente"}</div>
        </div>
      </div>
    </div>
  `;

  screenContent.querySelectorAll("[data-estudio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const estudio = btn.dataset.estudio;
      const idx = state.diagnostic.estudios.indexOf(estudio);

      if (idx >= 0) {
        state.diagnostic.estudios.splice(idx, 1);
      } else {
        state.diagnostic.estudios.push(estudio);
      }

      render();
    });
  });

  const requestStudiesBtn = document.getElementById("requestStudiesBtn");
  if (requestStudiesBtn) {
    requestStudiesBtn.addEventListener("click", () => {
      const hasRx = state.diagnostic.estudios.includes("Radiografía");
      const hasLab = state.diagnostic.estudios.includes("Laboratorio");
      const hasEcg = state.diagnostic.estudios.includes("ECG");

      if (state.classification.grave) {
        state.diagnostic.resultado = "Paciente de alto riesgo, requiere estabilización y hospital";
      } else if (hasRx && hasLab && !hasEcg) {
        state.diagnostic.resultado = "Fractura no complicada";
      } else if (hasEcg && hasLab) {
        state.diagnostic.resultado = "Dolor musculoesquelético, sin datos de evento agudo";
      } else if (hasRx) {
        state.diagnostic.resultado = "Trauma leve sin desplazamiento";
      } else if (hasLab) {
        state.diagnostic.resultado = "Proceso inflamatorio leve";
      } else {
        state.diagnostic.resultado = "Diagnóstico preliminar ambulatorio";
      }

      recomputeCase();
      render();
    });
  }
}

function renderDecision() {
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="form-group full">
      <label>¿Se puede resolver en clínica?</label>
      <div class="radio-group">
        <div class="chip ${state.decision.resolubleClinica ? "active-green" : ""}" id="resolveYes">Sí</div>
        <div class="chip ${!state.decision.resolubleClinica ? "active-red" : ""}" id="resolveNo">No</div>
      </div>
    </div>

    <div class="result-box">
      <h3>Decisión clínica actual</h3>
      ${
        state.transfer.required
          ? `<div class="alert alert-red">El caso activa flujo hospitalario. Solo se envía al hospital lo necesario, pero este caso sí cumple criterio de traslado.</div>`
          : `<div class="alert alert-green">El caso puede continuar en clínica. Atención ambulatoria y control operativo dentro del límite de tiempo.</div>`
      }
    </div>
  `;

  const resolveYes = document.getElementById("resolveYes");
  const resolveNo = document.getElementById("resolveNo");

  if (resolveYes) {
    resolveYes.addEventListener("click", () => {
      state.decision.resolubleClinica = true;
      recomputeCase();
      render();
    });
  }

  if (resolveNo) {
    resolveNo.addEventListener("click", () => {
      state.decision.resolubleClinica = false;
      recomputeCase();
      render();
    });
  }
}

function renderTimeControl() {
  if (!screenContent) return;

  const exceeded = state.timeControl.excedido;

  screenContent.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Tiempo en clínica (minutos)</label>
        <input id="timeMinutes" type="number" min="0" max="300" value="${state.timeControl.minutos}" />
      </div>
      <div class="form-group">
        <label>Máximo permitido</label>
        <input value="${state.timeControl.maximo} min" disabled />
      </div>
    </div>

    <div class="result-box">
      <h3>Control crítico de tiempo</h3>
      <div class="result-grid">
        <div class="result-item">
          <div class="label">Tiempo actual</div>
          <div class="value">${formatMinutes(state.timeControl.minutos)}</div>
        </div>
        <div class="result-item">
          <div class="label">Regla visible</div>
          <div class="value">Máximo permitido: 2 horas</div>
        </div>
        <div class="result-item">
          <div class="label">Estado</div>
          <div class="value">${exceeded ? "Superado" : "Dentro del límite"}</div>
        </div>
      </div>

      ${
        exceeded
          ? `<div class="alert alert-red">Se superó el máximo de 2 horas. Traslado hospitalario obligatorio.</div>`
          : `<div class="alert alert-green">Tiempo dentro del rango permitido. El paciente puede permanecer en clínica bajo el flujo ambulatorio.</div>`
      }
    </div>
  `;

  const timeMinutes = document.getElementById("timeMinutes");
  if (timeMinutes) {
    timeMinutes.addEventListener("input", (e) => {
      state.timeControl.minutos = Number(e.target.value || 0);
      recomputeCase();
      render();
    });
  }
}

function renderOutcome() {
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="result-box">
      <h3>Resultado del caso</h3>
      <div class="result-grid">
        <div class="result-item">
          <div class="label">Escenario</div>
          <div class="value">${state.outcome.texto}</div>
        </div>
        <div class="result-item">
          <div class="label">Acción</div>
          <div class="value">${state.outcome.alta}</div>
        </div>
        <div class="result-item">
          <div class="label">Tipo de atención</div>
          <div class="value">${state.outcome.tipo === "clinica" ? "Ambulatoria en clínica" : "Escalamiento hospitalario"}</div>
        </div>
      </div>
    </div>

    ${
      state.outcome.tipo === "clinica"
        ? `<div class="alert alert-green">Paciente resuelto en clínica. Se evita hospitalización innecesaria, se controla tiempo y se optimiza costo.</div>`
        : `<div class="alert alert-red">Paciente requiere hospital. Se activa referencia con ambulancia y continuidad clínica-financiera.</div>`
    }
  `;
}

function renderTransfer() {
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="result-box">
      <h3>Traslado hospitalario</h3>
      <div class="result-grid">
        <div class="result-item">
          <div class="label">Hospital receptor</div>
          <div class="value">${state.transfer.required ? state.transfer.hospital : "No aplica"}</div>
        </div>
        <div class="result-item">
          <div class="label">Ambulancia</div>
          <div class="value">${state.transfer.required ? state.transfer.ambulancia : "No requerida"}</div>
        </div>
        <div class="result-item">
          <div class="label">Tiempo estimado</div>
          <div class="value">${state.transfer.required ? state.transfer.eta : "--"}</div>
        </div>
        <div class="result-item">
          <div class="label">Folio de referencia</div>
          <div class="value">${state.transfer.required ? state.transfer.folioReferencia : "--"}</div>
        </div>
        <div class="result-item" style="grid-column:span 2;">
          <div class="label">Alternativa operativa</div>
          <div class="value">${state.transfer.required ? state.transfer.trasladoPropio : "El paciente continúa en clínica y egresa con alta."}</div>
        </div>
      </div>
    </div>

    ${
      state.transfer.required
        ? `<div class="alert alert-yellow">El paciente también puede trasladarse por sus propios medios al hospital indicado, cubierto por su póliza, llevando estudios y diagnóstico cargados en la plataforma.</div>`
        : `<div class="alert alert-green">No se requiere traslado. El caso fue resuelto dentro del modelo ambulatorio en Salud Digna.</div>`
    }
  `;
}

function renderFinancial() {
  if (!screenContent) return;

  const seguroTxt = state.financial.tieneSeguro ? "Sí" : "No";

  screenContent.innerHTML = `
    <div class="result-box">
      <h3>Liquidación financiera</h3>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Comentario</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Costo total</td>
            <td>${formatMoney(state.financial.costoTotal)}</td>
            <td>Atención integral del caso</td>
          </tr>
          <tr>
            <td>Pago paciente</td>
            <td>${formatMoney(state.financial.pagoPaciente)}</td>
            <td>${state.financial.tieneSeguro ? "Deducible / participación del paciente" : "Pago directo sin seguro"}</td>
          </tr>
          <tr>
            <td>Pago aseguradora</td>
            <td>${formatMoney(state.financial.pagoAseguradora)}</td>
            <td>${state.financial.tieneSeguro ? "Cobertura activa aplicada" : "No aplica"}</td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Distribución</th>
            <th>Monto</th>
            <th>Estatus</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Salud Digna</td>
            <td>${formatMoney(state.financial.saludDigna)}</td>
            <td><span class="status-pill status-blue">Recepción y diagnóstico</span></td>
          </tr>
          <tr>
            <td>Hospital</td>
            <td>${formatMoney(state.financial.hospital)}</td>
            <td><span class="status-pill ${state.financial.hospital > 0 ? "status-red" : "status-green"}">${state.financial.hospital > 0 ? "Atención hospitalaria" : "No requerido"}</span></td>
          </tr>
          <tr>
            <td>Operador</td>
            <td>${formatMoney(state.financial.operador)}</td>
            <td><span class="status-pill status-yellow">Coordinación y flujo</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="alert ${state.financial.tieneSeguro ? "alert-green" : "alert-yellow"}">
      ¿Cuenta con seguro? <strong>${seguroTxt}</strong>.
      ${
        state.outcome.tipo === "clinica"
          ? " En atención ambulatoria, el paciente cubre su participación correspondiente."
          : " En caso hospitalario, el deducible se cubre en el hospital y el resto sigue la lógica de la póliza, si existe."
      }
    </div>
  `;
}

function renderDashboard() {
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="result-box">
      <h3>Dashboard ejecutivo del modelo</h3>
      <table>
        <thead>
          <tr>
            <th>Indicador</th>
            <th>Valor</th>
            <th>Lectura ejecutiva</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pacientes atendidos</td>
            <td>${state.dashboard.pacientes}</td>
            <td>Volumen de casos simulados en el periodo</td>
          </tr>
          <tr>
            <td>% resueltos en clínica</td>
            <td>${state.dashboard.pctClinica}%</td>
            <td>Reducción de hospitalizaciones innecesarias</td>
          </tr>
          <tr>
            <td>% enviados a hospital</td>
            <td>${state.dashboard.pctHospital}%</td>
            <td>Escalamiento solo cuando es necesario</td>
          </tr>
          <tr>
            <td>Tiempo promedio</td>
            <td>${state.dashboard.tiempoPromedio}</td>
            <td>Control del límite operativo de 2 horas</td>
          </tr>
          <tr>
            <td>Costo promedio</td>
            <td>${state.dashboard.costoPromedio}</td>
            <td>Disciplina financiera y visibilidad del flujo</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="alert alert-green">
      Este demo deja claro que el sistema filtra pacientes, reduce hospitalizaciones, controla tiempo, controla costos y coordina todo el flujo clínico-financiero.
    </div>
  `;
}

function render() {
  recomputeCase();
  renderSidebar();
  renderTimeline();
  renderKpis();
  renderScreen();
}

function nextStep() {
  if (state.currentStep < screens.length - 1) {
    state.currentStep += 1;
    render();
  } else {
    stopAuto();
  }
}

function prevStep() {
  if (state.currentStep > 0) {
    state.currentStep -= 1;
    render();
  }
}

function simulateAutoStep() {
  const autoScenarios = [
    () => {
      state.coverage.validada = true;
      state.financial.tieneSeguro = true;
    },
    () => {
      state.classification.grave = false;
    },
    () => {
      state.triage.nivel = "Nivel 3 – Urgente estable";
      state.triage.sintoma = "Dolor torácico moderado";
    },
    () => {
      state.diagnostic.estudios = ["Laboratorio", "ECG"];
      state.diagnostic.resultado = "Dolor musculoesquelético, sin datos de evento agudo";
    },
    () => {
      state.decision.resolubleClinica = true;
    },
    () => {
      state.timeControl.minutos = 80;
    },
    () => {},
    () => {},
    () => {},
    () => {}
  ];

  if (autoScenarios[state.currentStep]) {
    autoScenarios[state.currentStep]();
  }

  recomputeCase();
  render();

  if (state.currentStep >= screens.length - 1) {
    stopAuto();
    return;
  }

  state.autoTimer = setTimeout(() => {
    nextStep();
    if (state.autoRunning && !state.autoPaused) {
      simulateAutoStep();
    }
  }, 1800);
}

function startAuto() {
  stopAuto();
  state.mode = "auto";
  state.autoRunning = true;
  state.autoPaused = false;
  state.currentStep = 0;
  render();
  simulateAutoStep();
}

function pauseAuto() {
  if (state.autoRunning) {
    state.autoPaused = true;
    clearTimeout(state.autoTimer);
    render();
  }
}

function resumeAuto() {
  if (state.autoRunning && state.autoPaused) {
    state.autoPaused = false;
    render();
    simulateAutoStep();
  }
}

function stopAuto() {
  clearTimeout(state.autoTimer);
  state.autoTimer = null;
  state.autoRunning = false;
  state.autoPaused = false;
  render();
}

function setInteractiveMode() {
  clearTimeout(state.autoTimer);
  state.autoTimer = null;
  state.autoRunning = false;
  state.autoPaused = false;
  state.mode = "interactive";
  render();
}

function resetDemo() {
  clearTimeout(state.autoTimer);
  state = defaultState();
  render();
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    setInteractiveMode();
    prevStep();
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    setInteractiveMode();
    nextStep();
  });
}

if (recalcBtn) {
  recalcBtn.addEventListener("click", () => {
    recomputeCase();
    render();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", resetDemo);
}

if (modeInteractiveBtn) {
  modeInteractiveBtn.addEventListener("click", setInteractiveMode);
}

if (modeAutoBtn) {
  modeAutoBtn.addEventListener("click", () => {
    state.mode = "auto";
    render();
  });
}

if (startAutoBtn) {
  startAutoBtn.addEventListener("click", startAuto);
}

if (pauseAutoBtn) {
  pauseAutoBtn.addEventListener("click", pauseAuto);
}

if (resumeAutoBtn) {
  resumeAutoBtn.addEventListener("click", resumeAuto);
}

document.addEventListener("DOMContentLoaded", () => {
  render();
});
