const state = {
  autoMode: true,
  timerSeconds: 0,
  timerInterval: null,
  currentDecision: null,
  caseId: generateCaseId(),
  authId: "PENDIENTE"
};

const els = {
  liveClock: document.getElementById("liveClock"),
  caseTimer: document.getElementById("caseTimer"),
  caseIdChip: document.getElementById("caseIdChip"),
  kpiCaseId: document.getElementById("kpiCaseId"),
  kpiAuthId: document.getElementById("kpiAuthId"),
  kpiHospital: document.getElementById("kpiHospital"),
  kpiCost: document.getElementById("kpiCost"),
  kpiCoverage: document.getElementById("kpiCoverage"),
  kpiTransfer: document.getElementById("kpiTransfer"),

  patientName: document.getElementById("patientName"),
  patientAge: document.getElementById("patientAge"),
  patientSex: document.getElementById("patientSex"),
  insurer: document.getElementById("insurer"),
  chiefComplaint: document.getElementById("chiefComplaint"),
  triage: document.getElementById("triage"),
  heartRate: document.getElementById("heartRate"),
  sbp: document.getElementById("sbp"),
  spo2: document.getElementById("spo2"),
  studies: document.getElementById("studies"),
  diagnosis: document.getElementById("diagnosis"),
  route: document.getElementById("route"),

  summaryPatientName: document.getElementById("summaryPatientName"),
  summaryDemographics: document.getElementById("summaryDemographics"),
  summaryInsurer: document.getElementById("summaryInsurer"),
  summaryStudies: document.getElementById("summaryStudies"),
  summaryDiagnosis: document.getElementById("summaryDiagnosis"),
  currentRoutePill: document.getElementById("currentRoutePill"),

  clinicalScore: document.getElementById("clinicalScore"),
  financialScore: document.getElementById("financialScore"),
  decisionResult: document.getElementById("decisionResult"),
  decisionConfidence: document.getElementById("decisionConfidence"),
  clinicalCriteriaList: document.getElementById("clinicalCriteriaList"),
  financialCriteriaList: document.getElementById("financialCriteriaList"),
  clinicalCount: document.getElementById("clinicalCount"),
  financialCount: document.getElementById("financialCount"),
  decisionExplanation: document.getElementById("decisionExplanation"),
  engineState: document.getElementById("engineState"),

  statusCaso: document.getElementById("statusCaso"),
  statusFinanciero: document.getElementById("statusFinanciero"),
  statusDecision: document.getElementById("statusDecision"),
  statusLiquidacion: document.getElementById("statusLiquidacion"),

  caseLog: document.getElementById("caseLog"),
  autoModeBtn: document.getElementById("autoModeBtn"),
  interactiveModeBtn: document.getElementById("interactiveModeBtn"),
  resetBtn: document.getElementById("resetBtn"),
  runDecisionBtn: document.getElementById("runDecisionBtn")
};

function generateCaseId() {
  const num = Math.floor(100 + Math.random() * 900);
  return `MFH-2026-${num}`;
}

function generateAuthId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `AUTH-${num}`;
}

function formatClock(date = new Date()) {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatShortTime(date = new Date()) {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateLiveClock() {
  els.liveClock.textContent = formatClock();
}

function startCaseTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerSeconds = 0;
  els.caseTimer.textContent = "00:00";

  state.timerInterval = setInterval(() => {
    state.timerSeconds += 1;
    const mins = String(Math.floor(state.timerSeconds / 60)).padStart(2, "0");
    const secs = String(state.timerSeconds % 60).padStart(2, "0");
    els.caseTimer.textContent = `${mins}:${secs}`;
  }, 1000);
}

function addLog(message) {
  const div = document.createElement("div");
  div.className = "log-item";
  div.innerHTML = `
    <span class="log-time">${formatShortTime()}</span>
    <p>${message}</p>
  `;
  els.caseLog.prepend(div);
}

function updateSummary() {
  els.summaryPatientName.textContent = els.patientName.value || "Paciente no especificado";
  els.summaryDemographics.textContent = `${els.patientAge.value || "--"} / ${els.patientSex.value || "--"}`;
  els.summaryInsurer.textContent = els.insurer.value;
  els.summaryStudies.textContent = readableStudies(els.studies.value);
  els.summaryDiagnosis.textContent = els.diagnosis.value || "Sin diagnóstico";
}

function readableStudies(value) {
  const map = {
    "ecg-labs-rx": "ECG + Laboratorio + RX",
    "labs-rx": "Laboratorio + RX",
    "labs": "Solo laboratorio",
    "none": "Sin estudios aún"
  };
  return map[value] || value;
}

function setRibbonCard(el, value, mode) {
  el.querySelector(".ribbon-value").textContent = value;
  el.classList.remove("active", "done");
  if (mode === "active") el.classList.add("active");
  if (mode === "done") el.classList.add("done");
}

function setTimelineState(stepNumber, stateName) {
  const step = document.querySelector(`.timeline-step[data-step="${stepNumber}"]`);
  if (!step) return;
  step.classList.remove("pending", "processing", "done");
  step.classList.add(stateName);
  const timeNode = document.getElementById(`time-step-${stepNumber}`);
  if (stateName !== "pending" && timeNode) timeNode.textContent = formatShortTime();
}

function resetTimeline() {
  document.querySelectorAll(".timeline-step").forEach((step) => {
    step.classList.remove("processing", "done");
    step.classList.add("pending");
  });
  for (let i = 1; i <= 5; i++) {
    const timeNode = document.getElementById(`time-step-${i}`);
    if (timeNode) timeNode.textContent = "--:--";
  }
}

function setRoutePill(route) {
  const pill = els.currentRoutePill;
  pill.classList.remove("status-neutral", "status-warning", "status-success", "status-danger");

  if (route === "ambulatorio") {
    pill.textContent = "Ambulatorio recomendado";
    pill.classList.add("status-success");
  } else if (route === "observacion") {
    pill.textContent = "Observación recomendada";
    pill.classList.add("status-warning");
  } else if (route === "hospitalizacion") {
    pill.textContent = "Referencia hospitalaria";
    pill.classList.add("status-danger");
  } else {
    pill.textContent = "Pendiente";
    pill.classList.add("status-neutral");
  }
}

function renderCriteria(listEl, items) {
  listEl.innerHTML = "";
  if (!items.length) {
    listEl.innerHTML = `<li class="criteria-empty">No se activaron criterios.</li>`;
    return;
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  });
}

function computeDecision() {
  const triage = Number(els.triage.value);
  const hr = Number(els.heartRate.value);
  const sbp = Number(els.sbp.value);
  const spo2 = Number(els.spo2.value);
  const insurer = els.insurer.value;
  const complaint = (els.chiefComplaint.value || "").toLowerCase();
  const diagnosis = (els.diagnosis.value || "").toLowerCase();
  const studies = els.studies.value;
  const manualRoute = els.route.value;

  const clinicalCriteria = [];
  const financialCriteria = [];

  let clinicalScore = 0;
  let financialScore = 0;

  if (complaint.includes("dolor torácico")) {
    clinicalCriteria.push("Dolor torácico reportado en motivo de consulta");
    clinicalScore += 22;
  }

  if (complaint.includes("disnea")) {
    clinicalCriteria.push("Disnea asociada al cuadro clínico");
    clinicalScore += 16;
  }

  if (triage <= 2) {
    clinicalCriteria.push("Triage alto: atención prioritaria");
    clinicalScore += 22;
  } else if (triage === 3) {
    clinicalCriteria.push("Triage intermedio: requiere observación y reevaluación");
    clinicalScore += 10;
  }

  if (hr > 110) {
    clinicalCriteria.push("Frecuencia cardiaca elevada");
    clinicalScore += 10;
  }

  if (sbp < 95) {
    clinicalCriteria.push("Tensión arterial sistólica baja");
    clinicalScore += 14;
  }

  if (spo2 < 90) {
    clinicalCriteria.push("Desaturación clínicamente relevante");
    clinicalScore += 18;
  } else if (spo2 < 94) {
    clinicalCriteria.push("Saturación limítrofe");
    clinicalScore += 8;
  }

  if (studies === "ecg-labs-rx") {
    clinicalCriteria.push("ECG y estudios iniciales completos disponibles");
    clinicalScore += 8;
  } else if (studies === "labs-rx") {
    clinicalCriteria.push("Laboratorio e imagen inicial disponibles");
    clinicalScore += 5;
  }

  if (
    diagnosis.includes("coronario") ||
    diagnosis.includes("agudo") ||
    diagnosis.includes("evento")
  ) {
    clinicalCriteria.push("Sospecha de evento agudo en diagnóstico preliminar");
    clinicalScore += 20;
  }

  if (insurer !== "Sin cobertura") {
    financialCriteria.push(`Cobertura identificada con ${insurer}`);
    financialScore += 30;

    financialCriteria.push("Elegibilidad preliminar confirmada");
    financialScore += 18;

    financialCriteria.push("Autorización potencialmente gestionable");
    financialScore += 16;
  } else {
    financialCriteria.push("Caso sin cobertura formal: requiere ruta alterna / contención financiera");
    financialScore += 6;
  }

  if (triage <= 3) {
    financialCriteria.push("Red hospitalaria disponible para escalamiento");
    financialScore += 18;
  }

  if (studies !== "none") {
    financialCriteria.push("Información diagnóstica suficiente para sustentar la decisión");
    financialScore += 10;
  }

  if (triage <= 2 || clinicalScore >= 60) {
    financialCriteria.push("Canal resolutivo de mayor capacidad activable");
    financialScore += 16;
  }

  clinicalScore = Math.min(clinicalScore, 100);
  financialScore = Math.min(financialScore, 100);

  let route = "ambulatorio";
  let resultLabel = "Manejo ambulatorio recomendado";
  let confidence = "Confianza media";
  let explanation = "";

  if (manualRoute !== "auto") {
    route = manualRoute;
  } else {
    if (clinicalScore >= 70 && financialScore >= 55) {
      route = "hospitalizacion";
    } else if (clinicalScore >= 38) {
      route = "observacion";
    } else {
      route = "ambulatorio";
    }
  }

  if (route === "hospitalizacion") {
    resultLabel = "Hospitalización / referencia hospitalaria recomendada";
    confidence = clinicalScore >= 80 ? "Alta confianza" : "Confianza media-alta";
    explanation =
      "MoneyFlux recomienda referencia hospitalaria porque el caso activa criterios de alto riesgo clínico y cuenta con condiciones operativas para escalarlo con trazabilidad, autorización y continuidad financiera.";
  } else if (route === "observacion") {
    resultLabel = "Observación clínica recomendada";
    confidence = "Confianza media";
    explanation =
      "MoneyFlux recomienda observación porque el caso presenta señales intermedias o potencialmente evolutivas que justifican contención clínica, monitoreo corto y reevaluación antes de escalar o egresar.";
  } else {
    resultLabel = "Manejo ambulatorio recomendado";
    confidence = "Confianza media";
    explanation =
      "MoneyFlux recomienda manejo ambulatorio porque la carga de riesgo clínico es controlable y no se activan suficientes criterios para justificar observación prolongada o referencia hospitalaria.";
  }

  return {
    clinicalCriteria,
    financialCriteria,
    clinicalScore,
    financialScore,
    route,
    resultLabel,
    confidence,
    explanation
  };
}

function updateExecutiveDashboard(decision) {
  let hospital = "No requerido";
  let cost = "$1,850 MXN";
  let coverage = decision.financialScore >= 50 ? "82%" : "25%";
  let transfer = "N/A";

  if (decision.route === "observacion") {
    hospital = "Observación Salud Digna / aliado local";
    cost = "$6,500 MXN";
    coverage = decision.financialScore >= 50 ? "78%" : "30%";
    transfer = "15 min";
  }

  if (decision.route === "hospitalizacion") {
    hospital = "Hospital aliado de segundo nivel";
    cost = "$38,000 MXN";
    coverage = decision.financialScore >= 50 ? "85%" : "40%";
    transfer = "22 min";
    state.authId = generateAuthId();
  } else if (decision.route === "observacion") {
    state.authId = "OBS-" + Math.floor(10000 + Math.random() * 90000);
  } else {
    state.authId = "AMB-" + Math.floor(10000 + Math.random() * 90000);
  }

  els.kpiAuthId.textContent = state.authId;
  els.kpiHospital.textContent = hospital;
  els.kpiCost.textContent = cost;
  els.kpiCoverage.textContent = coverage;
  els.kpiTransfer.textContent = transfer;
}

function renderDecision(decision) {
  els.clinicalScore.textContent = decision.clinicalScore;
  els.financialScore.textContent = decision.financialScore;
  els.decisionResult.textContent = decision.resultLabel;
  els.decisionConfidence.textContent = decision.confidence;
  els.decisionExplanation.textContent = decision.explanation;

  renderCriteria(els.clinicalCriteriaList, decision.clinicalCriteria);
  renderCriteria(els.financialCriteriaList, decision.financialCriteria);

  els.clinicalCount.textContent = decision.clinicalCriteria.length;
  els.financialCount.textContent = decision.financialCriteria.length;

  els.engineState.textContent = "Evaluado";
  els.engineState.classList.add("ready");

  setRoutePill(decision.route);
  updateExecutiveDashboard(decision);
}

function runFlow(decision) {
  setRibbonCard(els.statusCaso, "Ingreso completado", "done");
  setRibbonCard(els.statusFinanciero, "En validación", "active");
  setRibbonCard(els.statusDecision, "Pendiente", "");
  setRibbonCard(els.statusLiquidacion, "Pendiente", "");

  resetTimeline();

  setTimelineState(1, "done");
  setTimelineState(2, "processing");

  addLog(`Caso ${state.caseId} capturado en Salud Digna con motivo: ${els.chiefComplaint.value}.`);
  addLog(`Paciente ${els.patientName.value}, ${els.patientAge.value} años, aseguradora: ${els.insurer.value}.`);

  setTimeout(() => {
    setTimelineState(2, "done");
    setTimelineState(3, "processing");
    setRibbonCard(els.statusFinanciero, "Validada", "done");
    setRibbonCard(els.statusDecision, "Motor evaluando", "active");
    addLog("Validación financiera concluida: elegibilidad y canal operativo revisados.");
  }, 800);

  setTimeout(() => {
    setTimelineState(3, "done");
    setTimelineState(4, "processing");
    setRibbonCard(els.statusDecision, decision.resultLabel, "done");
    addLog(`Motor de decisión activado. Resultado: ${decision.resultLabel}.`);
  }, 1600);

  setTimeout(() => {
    setTimelineState(4, "done");
    setTimelineState(5, "processing");

    if (decision.route === "hospitalizacion") {
      addLog(`Referencia hospitalaria activada. Destino: ${els.kpiHospital.textContent}. Autorización: ${state.authId}.`);
    } else if (decision.route === "observacion") {
      addLog("Ruta de observación clínica activada con seguimiento operativo y financiero.");
    } else {
      addLog("Ruta ambulatoria activada con cierre controlado y continuidad del caso.");
    }
  }, 2400);

  setTimeout(() => {
    setTimelineState(5, "done");
    setRibbonCard(els.statusLiquidacion, "Caso consolidado", "done");
    addLog(`Cierre ejecutivo del caso. Costo estimado ${els.kpiCost.textContent}, cobertura ${els.kpiCoverage.textContent}.`);
  }, 3200);
}

function executeDecisionEngine() {
  updateSummary();

  state.currentDecision = computeDecision();
  renderDecision(state.currentDecision);
  runFlow(state.currentDecision);
}

function resetDemo() {
  state.caseId = generateCaseId();
  state.authId = "PENDIENTE";

  els.caseIdChip.textContent = `Caso: ${state.caseId}`;
  els.kpiCaseId.textContent = state.caseId;
  els.kpiAuthId.textContent = "PENDIENTE";
  els.kpiHospital.textContent = "Por definir";
  els.kpiCost.textContent = "$0 MXN";
  els.kpiCoverage.textContent = "0%";
  els.kpiTransfer.textContent = "N/A";

  setRibbonCard(els.statusCaso, "Captura inicial", "");
  setRibbonCard(els.statusFinanciero, "Pendiente", "");
  setRibbonCard(els.statusDecision, "Pendiente", "");
  setRibbonCard(els.statusLiquidacion, "Pendiente", "");

  resetTimeline();

  els.clinicalScore.textContent = "0";
  els.financialScore.textContent = "0";
  els.decisionResult.textContent = "Pendiente";
  els.decisionConfidence.textContent = "Sin decisión";
  els.decisionExplanation.textContent =
    "El motor mostrará aquí por qué MoneyFlux recomienda la ruta del caso y qué condiciones activaron la decisión.";
  els.engineState.textContent = "Sin evaluar";
  els.engineState.classList.remove("ready");

  renderCriteria(els.clinicalCriteriaList, []);
  renderCriteria(els.financialCriteriaList, []);
  els.clinicalCount.textContent = "0";
  els.financialCount.textContent = "0";

  setRoutePill("pending");
  els.caseLog.innerHTML = `
    <div class="log-item">
      <span class="log-time">--:--</span>
      <p>Esperando ejecución del caso.</p>
    </div>
  `;

  updateSummary();
  startCaseTimer();
  addLog("Demo reiniciado. Listo para nueva evaluación del caso.");
}

function bindInputs() {
  [
    els.patientName,
    els.patientAge,
    els.patientSex,
    els.insurer,
    els.chiefComplaint,
    els.triage,
    els.heartRate,
    els.sbp,
    els.spo2,
    els.studies,
    els.diagnosis,
    els.route
  ].forEach((el) => {
    el.addEventListener("input", updateSummary);
    el.addEventListener("change", updateSummary);
  });
}

function setMode(autoMode) {
  state.autoMode = autoMode;
  els.autoModeBtn.classList.toggle("btn-primary", autoMode);
  els.autoModeBtn.classList.toggle("btn-secondary", !autoMode);

  els.interactiveModeBtn.classList.toggle("btn-primary", !autoMode);
  els.interactiveModeBtn.classList.toggle("btn-secondary", autoMode);

  if (autoMode) {
    els.route.value = "auto";
    els.route.disabled = true;
    addLog("Modo automático activo: la ruta se define por el motor.");
  } else {
    els.route.disabled = false;
    addLog("Modo interactivo activo: se permite forzar ruta manual.");
  }
}

function init() {
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  els.caseIdChip.textContent = `Caso: ${state.caseId}`;
  els.kpiCaseId.textContent = state.caseId;

  bindInputs();
  updateSummary();
  startCaseTimer();
  setMode(true);

  els.autoModeBtn.addEventListener("click", () => setMode(true));
  els.interactiveModeBtn.addEventListener("click", () => setMode(false));
  els.runDecisionBtn.addEventListener("click", executeDecisionEngine);
  els.resetBtn.addEventListener("click", resetDemo);

  addLog("Demo inicializado. MoneyFlux listo para evaluar el caso.");
}

init();
