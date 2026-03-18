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

const flowTemplates = {
  ambulatorio: [
    {
      numero: "Paso 1",
      titulo: "Admisión",
      detalle: "Se registra al paciente en sede Salud Digna y se activa el caso clínico."
    },
    {
      numero: "Paso 2",
      titulo: "Triage",
      detalle: "Se clasifican signos vitales, urgencia y motivo de consulta."
    },
    {
      numero: "Paso 3",
      titulo: "Integración diagnóstica",
      detalle: "Se concentran estudios y hallazgos para definir conducta médica."
    },
    {
      numero: "Paso 4",
      titulo: "Validación financiera",
      detalle: "MoneyFlux confirma elegibilidad, cobertura y viabilidad del caso."
    },
    {
      numero: "Paso 5",
      titulo: "Decisión clínica",
      detalle: "Se define manejo ambulatorio supervisado con trazabilidad completa."
    },
    {
      numero: "Paso 6",
      titulo: "Resolución local",
      detalle: "El paciente se egresa con indicaciones, receta y seguimiento."
    },
    {
      numero: "Paso 7",
      titulo: "Liquidación",
      detalle: "Se cierra el expediente y se inicia conciliación simplificada."
    }
  ],
  observacion: [
    {
      numero: "Paso 1",
      titulo: "Admisión",
      detalle: "Se registra al paciente y se abre el evento clínico."
    },
    {
      numero: "Paso 2",
      titulo: "Triage",
      detalle: "Se clasifican signos vitales y severidad inicial."
    },
    {
      numero: "Paso 3",
      titulo: "Integración diagnóstica",
      detalle: "Se realizan estudios para reducir incertidumbre clínica."
    },
    {
      numero: "Paso 4",
      titulo: "Validación financiera",
      detalle: "MoneyFlux confirma cobertura preliminar y condiciones operativas."
    },
    {
      numero: "Paso 5",
      titulo: "Decisión clínica",
      detalle: "Se define observación con monitoreo y posible escalamiento."
    },
    {
      numero: "Paso 6",
      titulo: "Seguimiento dinámico",
      detalle: "Se mantiene vigilancia clínica con trazabilidad del caso."
    },
    {
      numero: "Paso 7",
      titulo: "Cierre / escalamiento",
      detalle: "Se determina egreso o referencia posterior con conciliación del evento."
    }
  ],
  hospitalizacion: [
    {
      numero: "Paso 1",
      titulo: "Admisión",
      detalle: "Se registra al paciente en sede Salud Digna y se abre el evento clínico."
    },
    {
      numero: "Paso 2",
      titulo: "Triage",
      detalle: "Se clasifican signos vitales, nivel de urgencia y motivo de consulta."
    },
    {
      numero: "Paso 3",
      titulo: "Integración diagnóstica",
      detalle: "Se realizan estudios y se consolidan hallazgos clínicos."
    },
    {
      numero: "Paso 4",
      titulo: "Validación financiera",
      detalle: "MoneyFlux confirma elegibilidad, póliza y condiciones de aseguramiento."
    },
    {
      numero: "Paso 5",
      titulo: "Decisión clínica",
      detalle: "Se documenta la necesidad de hospitalización y se activa autorización."
    },
    {
      numero: "Paso 6",
      titulo: "Referencia hospitalaria",
      detalle: "El paciente es referido con resumen clínico, resultados y trazabilidad."
    },
    {
      numero: "Paso 7",
      titulo: "Liquidación",
      detalle: "Se consolida el expediente y se inicia conciliación financiera del caso."
    }
  ]
};

const orchestrationTemplate = [
  {
    key: "case",
    label: "Caso activo",
    title: "Caso",
    pending: "Paciente pendiente de activación",
    active: "Caso clínico en proceso",
    done: "Caso consolidado"
  },
  {
    key: "financial",
    label: "Validación financiera",
    title: "Validación",
    pending: "Cobertura pendiente",
    active: "Elegibilidad y respaldo en revisión",
    done: "Viabilidad confirmada"
  },
  {
    key: "clinical",
    label: "Decisión clínica",
    title: "Decisión",
    pending: "Conducta pendiente",
    active: "Ruta médica en definición",
    done: "Ruta clínica definida"
  },
  {
    key: "settlement",
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

function getMetricsByRoute() {
  const base = [
    {
      label: "Tiempo de triage",
      value: currentStep >= 1 ? "4 min" : "6 min",
      note: currentStep >= 1 ? "Clasificación completada en tiempo objetivo" : "Desde admisión hasta clasificación"
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
      label: "Traslado estimado",
      value: currentStep >= 5 ? "22 min" : "—",
      note: "Desde autorización hasta recepción"
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

function getFlowSteps() {
  return flowTemplates[caseData.admission];
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
    return "El paciente es referido con expediente clínico, estudios y trazabilidad del episodio.";
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

function updateScenario() {
  renderPatient();
  renderStudies();
  renderFlow();
  renderOrchestrationStrip();

  if (currentStep >= 4) {
    renderDecision(false);
  } else {
    renderDecision(true);
  }

  renderMetrics();
}

function finishDemo() {
  demoRunning = false;
  clearTimeout(timer);
  timer = null;
  startBtn.disabled = false;
  startBtn.textContent = "Reiniciar demo";
}

function runDemoStep() {
  currentStep += 1;

  if (currentStep >= getFlowSteps().length) {
    finishDemo();
    return;
  }

  updateScenario();

  if (currentStep === getFlowSteps().length - 1) {
    timer = setTimeout(() => {
      currentStep = getFlowSteps().length;
      updateScenario();
      finishDemo();
    }, 1400);
    return;
  }

  timer = setTimeout(runDemoStep, 1400);
}

function startDemo() {
  if (isInteractiveMode) {
    return;
  }

  clearTimeout(timer);
  timer = null;
  readFormToCase();
  currentStep = -1;
  demoRunning = true;
  startBtn.disabled = true;
  startBtn.textContent = "Ejecutando...";
  updateScenario();

  timer = setTimeout(runDemoStep, 500);
}

function advanceInteractiveStep() {
  if (!isInteractiveMode) {
    return;
  }

  readFormToCase();

  if (currentStep < getFlowSteps().length) {
    currentStep += 1;
  }

  updateScenario();

  if (currentStep >= getFlowSteps().length) {
    finishDemo();
    startBtn.textContent = "Iniciar demo";
  }
}

function setInteractiveMode(enabled) {
  isInteractiveMode = enabled;
  clearTimeout(timer);
  timer = null;
  demoRunning = false;
  startBtn.disabled = enabled;

  if (enabled) {
    modeBadge.textContent = "Modo interactivo";
    modeBtn.textContent = "Demo automática";
    startBtn.textContent = "Iniciar demo";
  } else {
    modeBadge.textContent = "Demo automática";
    modeBtn.textContent = "Modo interactivo";
    startBtn.textContent = "Iniciar demo";
  }
}

function resetCase() {
  clearTimeout(timer);
  timer = null;
  demoRunning = false;
  currentStep = -1;
  caseData = structuredClone(defaultCase);
  populateForm();
  setInteractiveMode(false);
  startBtn.disabled = false;
  startBtn.textContent = "Iniciar demo";
  updateScenario();
}

admissionSelector.addEventListener("click", (event) => {
  const button = event.target.closest(".admission-btn");
  if (!button) return;

  caseData.admission = button.dataset.route;
  updateAdmissionButtons();
  readFormToCase();
  updateScenario();
});

modeBtn.addEventListener("click", () => {
  setInteractiveMode(!isInteractiveMode);
  updateScenario();
});

startBtn.addEventListener("click", startDemo);

applyBtn.addEventListener("click", () => {
  readFormToCase();
  updateScenario();
});

advanceBtn.addEventListener("click", advanceInteractiveStep);

resetBtn.addEventListener("click", resetCase);

studyCheckboxes.forEach(input => {
  input.addEventListener("change", () => {
    readFormToCase();
    updateScenario();
  });
});

[
  patientName,
  patientAge,
  patientSex,
  patientInsurance,
  patientComplaint,
  triageLevel,
  vitalsInput,
  diagnosisInput
].forEach(field => {
  field.addEventListener("input", () => {
    if (isInteractiveMode) {
      readFormToCase();
      updateScenario();
    }
  });
  field.addEventListener("change", () => {
    if (isInteractiveMode) {
      readFormToCase();
      updateScenario();
    }
  });
});

populateForm();
updateScenario();
