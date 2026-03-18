const patientData = {
  patient: {
    nombre: "María López García",
    edad: "47 años",
    sexo: "Femenino",
    aseguradora: "Aseguradora Demo / Póliza validada",
    motivo: "Dolor torácico y dificultad respiratoria",
    diagnostico: "Sospecha de síndrome coronario agudo"
  },
  studies: [
    {
      titulo: "Triage",
      resultado: "TA 150/95, FC 104, SatO2 93%, prioridad alta"
    },
    {
      titulo: "ECG",
      resultado: "Cambios compatibles con isquemia; requiere valoración hospitalaria"
    },
    {
      titulo: "Laboratorio",
      resultado: "Marcadores cardiacos solicitados; evento clínico registrado"
    },
    {
      titulo: "Radiografía",
      resultado: "Sin hallazgos pulmonares agudos; se mantiene sospecha cardiaca"
    }
  ],
  decision: {
    tipo: "route-hospital",
    titulo: "Decisión médica: Hospitalización",
    texto: "Paciente con hallazgos compatibles con síndrome coronario agudo. Se autoriza referencia a hospital aliado para manejo intrahospitalario y continuidad clínica."
  },
  metricsInitial: [
    {
      label: "Tiempo de triage",
      value: "6 min",
      note: "Desde admisión hasta clasificación"
    },
    {
      label: "Tiempo de autorización",
      value: "12 min",
      note: "Promedio entre validación y aprobación"
    },
    {
      label: "Casos con referencia",
      value: "18",
      note: "Eventos enviados a hospital aliado"
    },
    {
      label: "Cobertura validada",
      value: "94%",
      note: "Casos con elegibilidad confirmada"
    },
    {
      label: "Tiempo de liquidación",
      value: "36 h",
      note: "Promedio para conciliación financiera"
    },
    {
      label: "Hospitales activos",
      value: "5",
      note: "Red hospitalaria conectada al modelo"
    }
  ],
  metricsLive: [
    {
      label: "Tiempo de triage",
      value: "4 min",
      note: "Clasificación completada en tiempo objetivo"
    },
    {
      label: "Tiempo de autorización",
      value: "8 min",
      note: "Validación y aprobación ejecutadas"
    },
    {
      label: "Cobertura confirmada",
      value: "100%",
      note: "Póliza elegible y activa"
    },
    {
      label: "Referencia hospitalaria",
      value: "Autorizada",
      note: "Hospital aliado asignado"
    },
    {
      label: "Tiempo estimado de traslado",
      value: "22 min",
      note: "Desde autorización hasta recepción"
    },
    {
      label: "Estado financiero",
      value: "En conciliación",
      note: "Liquidación iniciada"
    }
  ],
  flow: [
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
      titulo: "Diagnóstico",
      detalle: "Se realizan ECG, laboratorio y radiografía para definir conducta médica."
    },
    {
      numero: "Paso 4",
      titulo: "Validación de cobertura",
      detalle: "MoneyFlux confirma elegibilidad, póliza y condiciones de aseguramiento."
    },
    {
      numero: "Paso 5",
      titulo: "Autorización médica",
      detalle: "Se documenta la necesidad de hospitalización y se obtiene autorización."
    },
    {
      numero: "Paso 6",
      titulo: "Hospital aliado",
      detalle: "El paciente es referido con resumen clínico, resultados y trazabilidad."
    },
    {
      numero: "Paso 7",
      titulo: "Liquidación",
      detalle: "Se consolida el expediente y se inicia conciliación financiera del caso."
    }
  ]
};

const patientCard = document.getElementById("patientCard");
const studiesList = document.getElementById("studiesList");
const decisionCard = document.getElementById("decisionCard");
const flowBoard = document.getElementById("flowBoard");
const metricsGrid = document.getElementById("metricsGrid");
const startBtn = document.getElementById("startBtn");

let currentStep = -1;
let demoRunning = false;
let timer = null;

function renderPatient() {
  patientCard.innerHTML = `
    <div class="patient-grid">
      <div class="data-box">
        <div class="label">Paciente</div>
        <div class="value">${patientData.patient.nombre}</div>
      </div>
      <div class="data-box">
        <div class="label">Edad</div>
        <div class="value">${patientData.patient.edad}</div>
      </div>
      <div class="data-box">
        <div class="label">Sexo</div>
        <div class="value">${patientData.patient.sexo}</div>
      </div>
      <div class="data-box">
        <div class="label">Aseguradora</div>
        <div class="value small">${patientData.patient.aseguradora}</div>
      </div>
      <div class="data-box">
        <div class="label">Motivo</div>
        <div class="value small">${patientData.patient.motivo}</div>
      </div>
      <div class="data-box">
        <div class="label">Diagnóstico</div>
        <div class="value small">${patientData.patient.diagnostico}</div>
      </div>
    </div>
  `;
}

function renderStudies() {
  studiesList.innerHTML = patientData.studies.map(item => `
    <div class="study-item">
      <div class="study-title">${item.titulo}</div>
      <div class="study-result">${item.resultado}</div>
    </div>
  `).join("");
}

function renderDecision(initial = true) {
  if (initial) {
    decisionCard.className = "decision-card";
    decisionCard.innerHTML = `
      <div class="decision-title">Decisión médica</div>
      <div class="decision-text">En espera de integración diagnóstica y validación de cobertura.</div>
    `;
    return;
  }

  decisionCard.className = `decision-card ${patientData.decision.tipo}`;
  decisionCard.innerHTML = `
    <div class="decision-title">${patientData.decision.titulo}</div>
    <div class="decision-text">${patientData.decision.texto}</div>
  `;
}

function renderMetrics(live = false) {
  const metrics = live ? patientData.metricsLive : patientData.metricsInitial;

  metricsGrid.innerHTML = metrics.map(item => `
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

function renderFlow() {
  flowBoard.innerHTML = patientData.flow.map((step, index) => `
    <div class="flow-step ${getStepStatus(index)}">
      <div class="step-top">
        <div class="step-number">${step.numero}</div>
        <div class="step-status">${getStepText(index)}</div>
      </div>
      <div class="step-title">${step.titulo}</div>
      <div class="step-detail">${step.detalle}</div>
    </div>
  `).join("");
}

function updateScenario() {
  renderFlow();

  if (currentStep >= 4) {
    renderDecision(false);
  } else {
    renderDecision(true);
  }

  if (currentStep >= 1) {
    renderMetrics(true);
  } else {
    renderMetrics(false);
  }

  if (currentStep >= patientData.flow.length) {
    finishDemo();
  }
}

function runDemoStep() {
  currentStep += 1;

  if (currentStep < patientData.flow.length) {
    updateScenario();
    timer = setTimeout(runDemoStep, 1400);
  } else {
    finishDemo();
  }
}

function finishDemo() {
  demoRunning = false;
  clearTimeout(timer);
  startBtn.disabled = false;
  startBtn.textContent = "Reiniciar demo";
}

function startDemo() {
  clearTimeout(timer);
  currentStep = -1;
  demoRunning = true;
  startBtn.disabled = true;
  startBtn.textContent = "Ejecutando...";
  renderDecision(true);
  renderMetrics(false);
  renderFlow();

  setTimeout(() => {
    runDemoStep();
  }, 500);
}

startBtn.addEventListener("click", startDemo);

renderPatient();
renderStudies();
renderDecision(true);
renderMetrics(false);
renderFlow();
