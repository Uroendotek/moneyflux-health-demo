const defaultCase = {
  patient: {
    nombre: "María López García",
    edad: "47",
    sexo: "Femenino",
    aseguradora: "Aseguradora Demo / Póliza validada",
    motivo: "Dolor torácico y dificultad respiratoria",
    triage: "Alto",
    vitals: "TA 150/95, FC 104, SatO2 93%",
    diagnostico: "Sospecha de síndrome coronario agudo"
  },
  selectedStudies: ["ECG", "Laboratorio", "Radiografía"],
  admission: "hospitalizacion"
};

const studyCatalog = {
  ECG: "Cambios compatibles con isquemia; requiere valoración hospitalaria.",
  Laboratorio: "Marcadores cardiacos solicitados; evento clínico registrado.",
  Radiografía: "Sin hallazgos pulmonares agudos; se mantiene sospecha cardiaca.",
  Ultrasonido: "Estudio complementario para descartar complicaciones asociadas."
};

const hospitalByRoute = {
  ambulatorio: "Resolución local en sede",
  observacion: "Unidad de observación clínica",
  hospitalizacion: "Hospital aliado Santa Elena"
};

const authByRoute = {
  ambulatorio: "AUTH-LOCAL-2148",
  observacion: "AUTH-OBS-4821",
  hospitalizacion: "AUTH-HOSP-88214"
};

const flowTemplates = {
  ambulatorio: [
    { numero: "Paso 1", titulo: "Admisión", detalle: "Se registra al paciente en sede Salud Digna y se activa el caso clínico." },
    { numero: "Paso 2", titulo: "Triage", detalle: "Se clasifican signos vitales, urgencia y motivo de consulta." },
    { numero: "Paso 3", titulo: "Integración diagnóstica", detalle: "Se concentran estudios y hallazgos para definir conducta médica." },
    { numero: "Paso 4", titulo: "Validación financiera", detalle: "MoneyFlux confirma elegibilidad, cobertura y viabilidad del caso." },
    { numero: "Paso 5", titulo: "Decisión clínica", detalle: "Se define manejo ambulatorio supervisado con trazabilidad completa." },
    { numero: "Paso 6", titulo: "Resolución local", detalle: "El paciente se egresa con indicaciones, receta y seguimiento." },
    { numero: "Paso 7", titulo: "Liquidación", detalle: "Se cierra el expediente y se inicia conciliación simplificada." }
  ],
  observacion: [
    { numero: "Paso 1", titulo: "Admisión", detalle: "Se registra al paciente y se abre el evento clínico." },
    { numero: "Paso 2", titulo: "Triage", detalle: "Se clasifican signos vitales y severidad inicial." },
    { numero: "Paso 3", titulo: "Integración diagnóstica", detalle: "Se realizan estudios para reducir incertidumbre clínica." },
    { numero: "Paso 4", titulo: "Validación financiera", detalle: "MoneyFlux confirma cobertura preliminar y condiciones operativas." },
    { numero: "Paso 5", titulo: "Decisión clínica", detalle: "Se define observación con monitoreo y posible escalamiento." },
    { numero: "Paso 6", titulo: "Seguimiento dinámico", detalle: "Se mantiene vigilancia clínica con trazabilidad del caso." },
    { numero: "Paso 7", titulo: "Cierre / escalamiento", detalle: "Se determina egreso o referencia posterior con conciliación del evento." }
  ],
  hospitalizacion: [
    { numero: "Paso 1", titulo: "Admisión", detalle: "Se registra al paciente en sede Salud Digna y se abre el evento clínico." },
    { numero: "Paso 2", titulo: "Triage", detalle: "Se clasifican signos vitales, nivel de urgencia y motivo de consulta." },
    { numero: "Paso 3", titulo: "Integración diagnóstica", detalle: "Se realizan estudios y se consolidan hallazgos clínicos." },
    { numero: "Paso 4", titulo: "Validación financiera", detalle: "MoneyFlux confirma elegibilidad, póliza y condiciones de aseguramiento." },
    { numero: "Paso 5", titulo: "Decisión clínica", detalle: "Se documenta la necesidad de hospitalización y se activa autorización." },
    { numero: "Paso 6", titulo: "Referencia hospitalaria", detalle: "El paciente es referido con resumen clínico, resultados y trazabilidad." },
    { numero: "Paso 7", titulo: "Liquidación", detalle: "Se consolida el expediente y se inicia conciliación financiera del caso." }
  ]
};

const orchestrationTemplate = [
  {
    label: "Caso activo",
    title: "Caso",
    pending: "Paciente pendiente de activación",
    active: "Caso clínico en proceso",
    done: "Caso consolidado"
  },
  {
    label: "Validación financiera",
    title: "Validación",
    pending: "Cobertura pendiente",
    active: "Elegibilidad y respaldo en revisión",
    done: "Viabilidad confirmada"
  },
  {
    label: "Decisión clínica",
    title: "Decisión",
    pending: "Conducta pendiente",
    active: "Ruta médica en definición",
    done: "Ruta clínica definida"
  },
  {
    label: "Destino / liquidación",
    title: "Liquidación",
    pending: "Sin destino operativo",
    active: "Transferencia / cierre en curso",
    done: "Trazabilidad financiera iniciada"
  }
];

const patientCard = document.getElementById("patientCard");
const studiesList = document.getElementById("studiesList");
const decisionCard = document.getElementById("decisionCard");
const flowBoard = document.getElementById("flowBoard");
const metricsGrid = document.getElementById("metricsGrid");
const orchestrationStrip = document.getElementById("orchestrationStrip");
const caseMetaCard = document.getElementById("caseMetaCard");
const clinicalSummaryCard = document.getElementById("clinicalSummaryCard");
const actorsGrid = document.getElementById("actorsGrid");
const activityLog = document.getElementById("activityLog");

const startBtn = document.getElementById("startBtn");
const modeBtn = document.getElementById("modeBtn");
const applyBtn = document.getElementById("applyBtn");
const advanceBtn = document.getElementById("advanceBtn");
const resetBtn = document.getElementById("resetBtn");
const modeBadge = document.getElementById("modeBadge");

const patientName = document.getElementById("patientName");
const patientAge = document.getElementById("patientAge");
const patientSex = document.getElementById("patientSex");
const patientInsurance = document.getElementById("patientInsurance");
const patientComplaint = document.getElementById("patientComplaint");
const triageLevel = document.getElementById("triageLevel");
const vitalsInput = document.getElementById("vitalsInput");
const diagnosisInput = document.getElementById("diagnosisInput");
const admissionSelector = document.getElementById("admissionSelector");
const studyCheckboxes = document.querySelectorAll('.study-selector input[type="checkbox"]');

let caseData = structuredClone(defaultCase);
let currentStep = -1;
let demoRunning = false;
let timer = null;
let isInteractiveMode = false;
let caseStartTime = new Date(2026, 2, 17, 18, 42, 0);
let caseId = "MF-2026-0317-004";
let authorizationId = authByRoute[defaultCase.admission];

function generateCaseId() {
  const routes = {
    ambulatorio: "AMB",
    observacion: "OBS",
    hospitalizacion: "HSP"
  };
  const serial = String(Math.floor(Math.random() * 900) + 100);
  return `MF-${routes[caseData.admission]}-2026-${serial}`;
}

function getSelectedStudies() {
  return Array.from(studyCheckboxes)
    .filter(item => item.checked)
    .map(item => item.value);
}

function populateForm() {
  patientName.value = caseData.patient.nombre;
  patientAge.value = caseData.patient.edad;
  patientSex.value = caseData.patient.sexo;
  patientInsurance.value = caseData.patient.aseguradora;
  patientComplaint.value = caseData.patient.motivo;
  triageLevel.value = caseData.patient.triage;
  vitalsInput.value = caseData.patient.vitals;
  diagnosisInput.value = caseData.patient.diagnostico;

  studyCheckboxes.forEach(item => {
    item.checked = caseData.selectedStudies.includes(item.value);
  });

  updateAdmissionButtons();
}

function updateAdmissionButtons() {
  const buttons = admissionSelector.querySelectorAll(".admission-btn");
  buttons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === caseData.admission);
  });
}

function readFormToCase() {
  caseData.patient.nombre = patientName.value.trim() || "Paciente no especificado";
  caseData.patient.edad = patientAge.value.trim() || "—";
  caseData.patient.sexo = patientSex.value;
  caseData.patient.aseguradora = patientInsurance.value.trim() || "Validación pendiente";
  caseData.patient.motivo = patientComplaint.value.trim() || "Motivo pendiente";
  caseData.patient.triage = triageLevel.value;
  caseData.patient.vitals = vitalsInput.value.trim() || "Signos vitales pendientes";
  caseData.patient.diagnostico = diagnosisInput.value.trim() || "Diagnóstico preliminar pendiente";
  caseData.selectedStudies = getSelectedStudies();
  authorizationId = authByRoute[caseData.admission];
}

function resetCaseClock() {
  caseStartTime = new Date(2026, 2, 17, 18, 42, 0);
}

function getFlowSteps() {
  return flowTemplates[caseData.admission];
}

function getStepMinutes(index) {
  const maps = {
    ambulatorio: [0, 4, 10, 16, 22, 31, 45],
    observacion: [0, 5, 12, 20, 32, 56, 90],
    hospitalizacion: [0, 4, 10, 19, 27, 38, 74]
  };
  return maps[caseData.admission][index] ?? 0;
}

function formatTime(date) {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function getStepTime(index) {
  const d = new Date(caseStartTime.getTime() + getStepMinutes(index) * 60000);
  return formatTime(d);
}

function getElapsedTimeLabel() {
  if (currentStep < 0) return "0 min";
  const minutes = currentStep >= getFlowSteps().length
    ? getStepMinutes(getFlowSteps().length - 1)
    : getStepMinutes(Math.max(currentStep, 0));
  return `${minutes} min`;
}

function renderCaseMeta() {
  caseMetaCard.innerHTML = `
    <div class="case-meta-grid">
      <div class="meta-pill">
        <div class="meta-label">Caso</div>
        <div class="meta-value">${caseId}</div>
      </div>
      <div class="meta-pill">
        <div class="meta-label">Autorización</div>
        <div class="meta-value">${currentStep >= 4 ? authorizationId : "Pendiente"}</div>
      </div>
      <div class="meta-pill">
        <div class="meta-label">Hora de inicio</div>
        <div class="meta-value">${formatTime(caseStartTime)}</div>
      </div>
      <div class="meta-pill">
        <div class="meta-label">Tiempo transcurrido</div>
        <div class="meta-value emphasis">${getElapsedTimeLabel()}</div>
      </div>
    </div>
  `;
}

function renderPatient() {
  patientCard.innerHTML = `
    <div class="patient-grid">
      <div class="data-box ${currentStep >= 0 ? "highlight" : ""}">
        <div class="label">Paciente</div>
        <div class="value">${caseData.patient.nombre}</div>
      </div>

      <div class="data-box ${currentStep >= 0 ? "highlight" : ""}">
        <div class="label">Edad</div>
        <div class="value">${caseData.patient.edad === "—" ? "—" : `${caseData.patient.edad} años`}</div>
      </div>

      <div class="data-box">
        <div class="label">Sexo</div>
        <div class="value">${caseData.patient.sexo}</div>
      </div>

      <div class="data-box ${currentStep >= 3 ? "highlight" : ""}">
        <div class="label">Aseguradora</div>
        <div class="value small">${caseData.patient.aseguradora}</div>
      </div>

      <div class="data-box">
        <div class="label">Motivo</div>
        <div class="value small">${caseData.patient.motivo}</div>
      </div>

      <div class="data-box ${currentStep >= 4 ? "highlight" : ""}">
        <div class="label">Diagnóstico</div>
        <div class="value small">${caseData.patient.diagnostico}</div>
      </div>
    </div>
  `;
}

function buildStudiesFromCase() {
  const triageText = `${caseData.patient.vitals}; prioridad ${caseData.patient.triage.toLowerCase()}`;
  const studies = [
    {
      titulo: "Triage",
      resultado: triageText
    }
  ];

  caseData.selectedStudies.forEach(studyName => {
    studies.push({
      titulo: studyName,
      resultado: studyCatalog[studyName] || "Resultado integrado al expediente clínico."
    });
  });

  return studies;
}

function renderStudies() {
  const studies = buildStudiesFromCase();

  studiesList.innerHTML = studies.map((item) => `
    <div class="study-item">
      <div class="study-title">${item.titulo}</div>
      <div class="study-result">${item.resultado}</div>
    </div>
  `).join("");
}

function getDecisionContent() {
  if (caseData.admission === "ambulatorio") {
    return {
      type: "route-ambulatory",
      title: "Decisión médica: Manejo ambulatorio",
      text: "El caso puede resolverse localmente con trazabilidad clínica, egreso supervisado e indicaciones de seguimiento. MoneyFlux mantiene validación y conciliación simplificada."
    };
  }

  if (caseData.admission === "observacion") {
    return {
      type: "route-observation",
      title: "Decisión médica: Observación clínica",
      text: "El paciente requiere observación, monitoreo y posible escalamiento. MoneyFlux conserva continuidad clínica, visibilidad operativa y validación financiera en curso."
    };
  }

  return {
    type: "route-hospital",
    title: "Decisión médica: Hospitalización",
    text: "Paciente con hallazgos que justifican referencia hospitalaria. MoneyFlux activa autorización, trazabilidad documental, coordinación operativa y arranque de conciliación financiera."
  };
}

function renderDecision(initial = true) {
  if (initial) {
    decisionCard.className = "decision-card";
    decisionCard.innerHTML = `
      <div class="decision-title">Decisión médica</div>
      <div class="decision-text">En espera de integración diagnóstica, validación financiera y definición de ruta clínica.</div>
    `;
    return;
  }

  const decision = getDecisionContent();
  decisionCard.className = `decision-card ${decision.type}`;
  decisionCard.innerHTML = `
    <div class="decision-title">${decision.title}</div>
    <div class="decision-text">${decision.text}</div>
  `;
}

function getClinicalCriteria() {
  const criteria = [];

  if (caseData.patient.motivo.toLowerCase().includes("dolor")) {
    criteria.push("Motivo de consulta con componente de dolor agudo.");
  }

  if (caseData.patient.motivo.toLowerCase().includes("respir")) {
    criteria.push("Síntoma respiratorio asociado al episodio clínico.");
  }

  if (caseData.patient.triage === "Alto") {
    criteria.push("Nivel de triage alto con priorización inmediata.");
  } else if (caseData.patient.triage === "Medio") {
    criteria.push("Nivel de triage medio con necesidad de evaluación estructurada.");
  } else {
    criteria.push("Nivel de triage bajo con menor probabilidad de escalamiento.");
  }

  if (caseData.selectedStudies.includes("ECG")) {
    criteria.push("ECG integrado para valoración cardiovascular.");
  }

  if (caseData.selectedStudies.includes("Laboratorio")) {
    criteria.push("Laboratorio disponible para soporte diagnóstico.");
  }

  if (currentStep >= 3) {
    criteria.push("Cobertura y viabilidad financiera evaluadas por MoneyFlux.");
  }

  if (caseData.admission === "hospitalizacion") {
    criteria.push("Red hospitalaria disponible para referencia inmediata.");
  } else if (caseData.admission === "observacion") {
    criteria.push("Ruta de observación activable con monitoreo continuo.");
  } else {
    criteria.push("Capacidad resolutiva local suficiente para cierre ambulatorio.");
  }

  return criteria.slice(0, 6);
}

function renderClinicalSummary() {
  clinicalSummaryCard.innerHTML = `
    <div class="summary-title">Resumen clínico ejecutivo</div>

    <div class="summary-grid">
      <div class="summary-row">
        <strong>Resumen del caso</strong>
        <span>${caseData.patient.nombre}, ${caseData.patient.edad === "—" ? "edad no especificada" : `${caseData.patient.edad} años`}, ${caseData.patient.sexo.toLowerCase()}. Motivo principal: ${caseData.patient.motivo}.</span>
      </div>

      <div class="summary-row">
        <strong>Impresión diagnóstica</strong>
        <span>${caseData.patient.diagnostico}</span>
      </div>

      <div class="summary-row">
        <strong>Ruta operativa sugerida</strong>
        <span>${hospitalByRoute[caseData.admission]}.</span>
      </div>

      <div class="summary-row">
        <strong>Criterios activados</strong>
        <div class="criteria-list">
          ${getClinicalCriteria().map(item => `
            <div class="criteria-item">
              <div class="criteria-dot"></div>
              <div>${item}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function getMetricsByRoute() {
  const base = [
    {
      label: "Tiempo de triage",
      value: currentStep >= 1 ? "4 min" : "Pendiente",
      note: currentStep >= 1 ? "Clasificación completada en tiempo objetivo" : "En espera de clasificación"
    },
    {
      label: "Cobertura",
      value: currentStep >= 3 ? "Confirmada" : "Pendiente",
      note: currentStep >= 3 ? "Elegibilidad financiera validada" : "En espera de validación"
    }
  ];

  if (caseData.admission === "ambulatorio") {
    return [
      ...base,
      {
        label: "Ruta definida",
        value: currentStep >= 4 ? "Ambulatorio" : "Pendiente",
        note: "Resolución local con seguimiento"
      },
      {
        label: "Costo estimado",
        value: "$3.8K",
        note: "Menor costo relativo del episodio"
      },
      {
        label: "Tiempo estimado de resolución",
        value: "45 min",
        note: "Desde admisión hasta egreso"
      },
      {
        label: "Liquidación",
        value: currentStep >= 6 ? "Iniciada" : "En espera",
        note: "Conciliación simplificada del evento"
      }
    ];
  }

  if (caseData.admission === "observacion") {
    return [
      ...base,
      {
        label: "Ruta definida",
        value: currentStep >= 4 ? "Observación" : "Pendiente",
        note: "Monitoreo y posible escalamiento"
      },
      {
        label: "Costo estimado",
        value: "$8.9K",
        note: "Episodio intermedio con vigilancia"
      },
      {
        label: "Tiempo estimado de resolución",
        value: "2.5 h",
        note: "Incluye observación clínica"
      },
      {
        label: "Estado operativo",
        value: currentStep >= 5 ? "Monitoreo activo" : "Pendiente",
        note: "Seguimiento continuo del caso"
      }
    ];
  }

  return [
    ...base,
    {
      label: "Ruta definida",
      value: currentStep >= 4 ? "Hospitalización" : "Pendiente",
      note: "Referencia a hospital aliado"
    },
    {
      label: "Preautorización",
      value: currentStep >= 4 ? "Autorizada" : "En proceso",
      note: "Validación clínica-financiera activada"
    },
    {
      label: "Hospital receptor",
      value: currentStep >= 5 ? "Santa Elena" : "Pendiente",
      note: "Red hospitalaria conectada"
    },
    {
      label: "Liquidación",
      value: currentStep >= 6 ? "En conciliación" : "Pendiente",
      note: "Trazabilidad financiera iniciada"
    }
  ];
}

function renderMetrics() {
  const metrics = getMetricsByRoute();

  metricsGrid.innerHTML = metrics.map((item) => `
    <div class="metric-card">
      <div class="metric-label">${item.label}</div>
      <div class="metric-value">${item.value}</div>
      <div class="metric-note">${item.note}</div>
    </div>
  `).join("");
}

function getStepStatus(index) {
  if (index < currentStep) return "done";
  if (index === currentStep) return "active";
  return "";
}

function getStepText(index) {
  if (index < currentStep) return "Completado";
  if (index === currentStep) return "En proceso";
  return "Pendiente";
}

function enrichFlowDetail(step, index) {
  if (index === 1) {
    return `${step.detalle} ${caseData.patient.triage ? `Triage ${caseData.patient.triage.toLowerCase()}.` : ""}`;
  }

  if (index === 2) {
    const selected = caseData.selectedStudies.length ? caseData.selectedStudies.join(", ") : "sin estudios cargados";
    return `${step.detalle} Estudios integrados: ${selected}.`;
  }

  if (index === 4) {
    if (caseData.admission === "ambulatorio") {
      return "Se confirma manejo ambulatorio con control local, egreso supervisado y trazabilidad financiera.";
    }
    if (caseData.admission === "observacion") {
      return "Se confirma observación clínica con monitoreo, capacidad de escalamiento y visibilidad financiera.";
    }
    return "Se confirma necesidad de hospitalización, autorización médica y preparación de referencia hospitalaria.";
  }

  if (index === 5) {
    if (caseData.admission === "ambulatorio") {
      return "El paciente continúa en canal local con indicaciones, seguimiento y cierre operacional.";
    }
    if (caseData.admission === "observacion") {
      return "El caso permanece bajo observación con continuidad clínica y control de tiempos.";
    }
    return `El paciente es referido a ${hospitalByRoute[caseData.admission]} con expediente clínico, estudios y trazabilidad del episodio.`;
  }

  return step.detalle;
}

function renderFlow() {
  const steps = getFlowSteps();

  flowBoard.innerHTML = steps.map((step, index) => {
    const status = getStepStatus(index);
    const focusClass = index === 4 ? "decision-focus" : "";

    return `
      <div class="flow-step ${status} ${focusClass}">
        <div class="step-top">
          <div class="step-number">${step.numero}</div>
          <div class="step-status">${getStepText(index)}</div>
        </div>
        <div class="step-title">${step.titulo}</div>
        <div class="step-detail">${enrichFlowDetail(step, index)}</div>
        <div class="step-time">${getStepTime(index)}</div>
      </div>
    `;
  }).join("");
}

function renderOrchestrationStrip() {
  const stageState = [
    currentStep >= 0 ? (currentStep <= 2 ? "active" : "done") : "pending",
    currentStep === 3 ? "active" : currentStep > 3 ? "done" : "pending",
    currentStep === 4 ? "active" : currentStep > 4 ? "done" : "pending",
    currentStep >= 5 && currentStep <= 6 ? "active" : currentStep > 6 ? "done" : "pending"
  ];

  orchestrationStrip.innerHTML = orchestrationTemplate.map((item, index) => {
    const state = stageState[index];
    const statusText = state === "done" ? item.done : state === "active" ? item.active : item.pending;

    return `
      <div class="strip-card ${state}">
        <div class="strip-label">${item.label}</div>
        <div class="strip-title">${item.title}</div>
        <div class="strip-status">${statusText}</div>
      </div>
    `;
  }).join("");
}

function renderActors() {
  const actors = [
    {
      name: "Salud Digna",
      status: currentStep >= 2 ? "done" : currentStep >= 0 ? "active" : "pending",
      text: currentStep >= 2 ? "Evaluación completada" : currentStep >= 0 ? "Recepción y triage" : "Pendiente"
    },
    {
      name: "MoneyFlux",
      status: currentStep >= 4 ? "done" : currentStep >= 3 ? "active" : "pending",
      text: currentStep >= 4 ? "Ruta y validación definidas" : currentStep >= 3 ? "Validando cobertura" : "Pendiente"
    },
    {
      name: "Aseguradora",
      status: currentStep >= 4 ? "done" : currentStep >= 3 ? "active" : "pending",
      text: currentStep >= 4 ? "Cobertura confirmada" : currentStep >= 3 ? "Revisión de elegibilidad" : "Pendiente"
    },
    {
      name: caseData.admission === "hospitalizacion" ? "Hospital aliado" : "Destino operativo",
      status: currentStep >= 5 ? "done" : currentStep >= 5 ? "active" : "pending",
      text: currentStep >= 5 ? hospitalByRoute[caseData.admission] : "Pendiente"
    }
  ];

  actorsGrid.innerHTML = actors.map(actor => `
    <div class="actor-item">
      <div class="actor-name">${actor.name}</div>
      <div class="actor-status ${actor.status}">${actor.text}</div>
    </div>
  `).join("");
}

function getActivityItems() {
  const items = [];

  if (currentStep >= 0) {
    items.push({
      time: getStepTime(0),
      text: `Caso ${caseId} creado para ${caseData.patient.nombre}.`
    });
  }

  if (currentStep >= 1) {
    items.push({
      time: getStepTime(1),
      text: `Triage ${caseData.patient.triage.toLowerCase()} capturado con ${caseData.patient.vitals}.`
    });
  }

  if (currentStep >= 2) {
    items.push({
      time: getStepTime(2),
      text: `Estudios integrados al expediente: ${caseData.selectedStudies.join(", ") || "sin estudios"}.
