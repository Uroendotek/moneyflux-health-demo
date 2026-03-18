const DEMO = {
  state: {
    caseId: "MFH-2026-001",
    mode: "interactive",
    autoTimer: null,
    autoIndex: 0,
    timelineStage: 1,
    activity: [],
    authorizationId: "PENDIENTE",
    destinationHospital: "Por definir",
    estimatedCost: "$0 MXN",
    estimatedCoverage: "0%",
    estimatedTransfer: "N/A"
  },

  els: {},

  initialForm: {
    patientName: "María Fernanda López",
    patientAge: 54,
    patientSex: "Femenino",
    payer: "Mapfre",
    complaint: "Dolor torácico opresivo",
    triage: "Amarillo",
    heartRate: 112,
    systolicBp: 92,
    spo2: 89,
    studies: "ECG + Laboratorio + RX",
    diagnosis: "Síndrome coronario agudo / evento cardiopulmonar a descartar",
    clinicalRoute: "automatico"
  },

  timelineTemplate: [
    {
      title: "Ingreso y registro",
      description: "Captura del paciente, motivo de consulta, triage y datos de cobertura."
    },
    {
      title: "Validación financiera",
      description: "Evaluación de elegibilidad, autorización preliminar y red hospitalaria."
    },
    {
      title: "Motor de decisión clínica-financiera",
      description: "Activación de criterios clínicos y operativos para definir la ruta."
    },
    {
      title: "Coordinación del siguiente nivel",
      description: "Definición ambulatoria, observación o referencia hospitalaria con trazabilidad."
    },
    {
      title: "Cierre y liquidación",
      description: "Consolidación del caso, costos estimados y estatus final."
    }
  ]
};

function $(id) {
  return document.getElementById(id);
}

function initDemo() {
  DEMO.els = {
    patientName: $("patient-name"),
    patientAge: $("patient-age"),
    patientSex: $("patient-sex"),
    payer: $("payer"),
    complaint: $("complaint"),
    triage: $("triage"),
    heartRate: $("heart-rate"),
    systolicBp: $("systolic-bp"),
    spo2: $("spo2"),
    studies: $("studies"),
    diagnosis: $("diagnosis"),
    clinicalRoute: $("clinical-route"),

    autoBtn: $("auto-mode-btn"),
    interactiveBtn: $("interactive-mode-btn"),

    caseClock: $("case-clock"),
    timeline: $("timeline"),
    clinicalSummary: $("clinical-summary"),

    clinicalScore: $("clinical-score"),
    financialScore: $("financial-score"),
    clinicalCriteria: $("clinical-criteria"),
    financialCriteria: $("financial-criteria"),
    decisionResult: $("decision-result"),
    decisionBadge: $("decision-badge"),

    referralBadge: $("referral-badge"),
    referralReason: $("referral-reason"),
    referralClinicalCriteria: $("referral-clinical-criteria"),
    referralOperationalCriteria: $("referral-operational-criteria"),
    referralSpecialty: $("referral-specialty"),
    referralComplexity: $("referral-complexity"),
    referralHospital: $("referral-hospital"),
    referralAuthorization: $("referral-authorization"),
    referralTransfer: $("referral-transfer"),
    referralFinancials: $("referral-financials"),
    referralRecommendation: $("referral-recommendation"),

    activityLog: $("activity-log"),

    caseIdHeader: $("case-id-header"),
    caseIdKpi: $("case-id-kpi"),
    authorizationId: $("authorization-id"),
    destinationHospital: $("destination-hospital"),
    estimatedCost: $("estimated-cost"),
    estimatedCoverage: $("estimated-coverage"),
    estimatedTransfer: $("estimated-transfer"),

    execCase: $("exec-case"),
    execFinancial: $("exec-financial"),
    execClinical: $("exec-clinical"),
    execLiquidation: $("exec-liquidation"),
    execCaseValue: $("exec-case-value"),
    execFinancialValue: $("exec-financial-value"),
    execClinicalValue: $("exec-clinical-value"),
    execLiquidationValue: $("exec-liquidation-value")
  };

  setFormValues(DEMO.initialForm);
  tickClock();
  setInterval(tickClock, 1000);
  resetDemo();
}

function setFormValues(values) {
  DEMO.els.patientName.value = values.patientName;
  DEMO.els.patientAge.value = values.patientAge;
  DEMO.els.patientSex.value = values.patientSex;
  DEMO.els.payer.value = values.payer;
  DEMO.els.complaint.value = values.complaint;
  DEMO.els.triage.value = values.triage;
  DEMO.els.heartRate.value = values.heartRate;
  DEMO.els.systolicBp.value = values.systolicBp;
  DEMO.els.spo2.value = values.spo2;
  DEMO.els.studies.value = values.studies;
  DEMO.els.diagnosis.value = values.diagnosis;
  DEMO.els.clinicalRoute.value = values.clinicalRoute;
}

function getFormData() {
  return {
    patientName: DEMO.els.patientName.value.trim(),
    patientAge: Number(DEMO.els.patientAge.value || 0),
    patientSex: DEMO.els.patientSex.value,
    payer: DEMO.els.payer.value,
    complaint: DEMO.els.complaint.value.trim(),
    triage: DEMO.els.triage.value,
    heartRate: Number(DEMO.els.heartRate.value || 0),
    systolicBp: Number(DEMO.els.systolicBp.value || 0),
    spo2: Number(DEMO.els.spo2.value || 0),
    studies: DEMO.els.studies.value,
    diagnosis: DEMO.els.diagnosis.value.trim(),
    clinicalRoute: DEMO.els.clinicalRoute.value
  };
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function timeStamp() {
  return new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function tickClock() {
  DEMO.els.caseClock.textContent = timeStamp();
}

function addLog(text) {
  DEMO.state.activity.unshift({ time: timeStamp(), text });
  DEMO.state.activity = DEMO.state.activity.slice(0, 14);
  DEMO.els.activityLog.innerHTML = DEMO.state.activity.map(item => `
    <div class="activity-log__item">
      <span class="activity-log__time">${item.time}</span>
      <div class="activity-log__text">${escapeHtml(item.text)}</div>
    </div>
  `).join("");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

function computeDecision(data) {
  let clinicalScore = 0;
  let financialScore = 0;
  const clinicalCriteria = [];
  const financialCriteria = [];

  if (data.triage === "Rojo") {
    clinicalScore += 45;
    clinicalCriteria.push("Triage crítico");
  } else if (data.triage === "Amarillo") {
    clinicalScore += 30;
    clinicalCriteria.push("Triage de alto riesgo");
  } else {
    clinicalScore += 12;
    clinicalCriteria.push("Triage moderado");
  }

  if (data.heartRate > 110) {
    clinicalScore += 18;
    clinicalCriteria.push("Taquicardia relevante");
  }

  if (data.systolicBp > 0 && data.systolicBp < 95) {
    clinicalScore += 20;
    clinicalCriteria.push("TA sistólica baja");
  }

  if (data.spo2 > 0 && data.spo2 < 90) {
    clinicalScore += 20;
    clinicalCriteria.push("Saturación comprometida");
  } else if (data.spo2 <= 93) {
    clinicalScore += 10;
    clinicalCriteria.push("Saturación limítrofe");
  }

  if (/tor[aá]cico|coronario|cardio|evento/i.test(`${data.complaint} ${data.diagnosis}`)) {
    clinicalScore += 18;
    clinicalCriteria.push("Posible evento cardiopulmonar");
  }

  if (/ECG|Laboratorio|RX/i.test(data.studies)) {
    clinicalScore += 6;
    clinicalCriteria.push("Estudios diagnósticos activados");
  }

  if (data.payer !== "Sin seguro") {
    financialScore += 40;
    financialCriteria.push("Cobertura inicial identificada");
    financialCriteria.push("Canal de pagador disponible");
  } else {
    financialScore += 10;
    financialCriteria.push("Caso sin seguro");
  }

  if (clinicalScore >= 50) {
    financialScore += 18;
    financialCriteria.push("Se justifica activación de red hospitalaria");
  }

  if (data.clinicalRoute === "hospitalizacion") {
    clinicalScore += 10;
    financialScore += 10;
    clinicalCriteria.push("Ruta manual a hospitalización");
    financialCriteria.push("Preparación operativa para referencia");
  } else if (data.clinicalRoute === "observacion") {
    clinicalScore += 5;
    financialScore += 6;
    clinicalCriteria.push("Ruta manual a observación");
  }

  clinicalScore = Math.min(100, clinicalScore);
  financialScore = Math.min(100, financialScore);

  let route = "ambulatorio";

  if (data.clinicalRoute !== "automatico") {
    route = data.clinicalRoute;
  } else if (clinicalScore >= 68 && financialScore >= 55) {
    route = "hospitalizacion";
  } else if (clinicalScore >= 45) {
    route = "observacion";
  }

  let decisionText = "";
  if (route === "hospitalizacion") {
    decisionText = "Se recomienda referencia hospitalaria por severidad clínica, requerimiento de capacidad resolutiva y viabilidad financiera-operativa suficiente.";
  } else if (route === "observacion") {
    decisionText = "Se recomienda observación clínica con escalamiento condicionado a evolución y autorización complementaria.";
  } else {
    decisionText = "Se recomienda manejo ambulatorio controlado y cierre operativo de menor costo.";
  }

  return {
    route,
    clinicalScore,
    financialScore,
    clinicalCriteria,
    financialCriteria,
    decisionText
  };
}

function computeReferral(data, decision) {
  if (decision.route === "ambulatorio") {
    return {
      badgeClass: "status-badge--neutral",
      badgeText: "No requerida",
      reason: "La referencia hospitalaria no es requerida en este momento.",
      clinicalCriteria: [
        "No se documenta necesidad inmediata de internamiento",
        "El caso puede cerrarse fuera del hospital"
      ],
      operationalCriteria: [
        "No se activa traslado",
        "No se consume capacidad hospitalaria"
      ],
      specialty: "N/A",
      complexity: "Baja",
      hospital: "No aplica",
      authorization: "N/A",
      transfer: "N/A",
      financials: "N/A",
      recommendation: "Continuar resolución ambulatoria y documentar cierre del caso."
    };
  }

  const severe = decision.route === "hospitalizacion";
  const totalCost = severe ? 48000 : 26000;
  const covered = data.payer === "Sin seguro" ? 8000 : severe ? 41000 : 21000;
  const coveragePct = Math.round((covered / totalCost) * 100);
  const gap = Math.max(0, totalCost - covered);

  return {
    badgeClass: severe ? "status-badge--warning" : "status-badge--pending",
    badgeText: severe ? "Recomendada" : "Evaluación en curso",
    reason: severe
      ? "El caso se escala por severidad clínica, necesidad de capacidad hospitalaria y viabilidad operativa suficiente."
      : "El caso permanece en observación con potencial de escalamiento si persisten hallazgos de riesgo.",
    clinicalCriteria: decision.clinicalCriteria,
    operationalCriteria: [
      "Hospital aliado con capacidad disponible",
      "Traslado dentro de SLA operativo",
      data.payer !== "Sin seguro" ? "Cobertura preliminar positiva" : "Se requiere fondeo complementario"
    ],
    specialty: severe ? "Medicina interna / cardiología" : "Urgencias / medicina interna",
    complexity: severe ? "Media-alta" : "Media",
    hospital: severe ? "Hospital Ángeles Roma" : "Hospital Star Médica Centro",
    authorization: severe ? "8 min" : "14 min",
    transfer: severe ? "22 min / SLA 30 min" : "18 min / SLA 32 min",
    financials: `${formatCurrency(totalCost)} / ${coveragePct}% cobertura`,
    recommendation: severe
      ? `Proceder con referencia hospitalaria controlada. Brecha estimada: ${formatCurrency(gap)}.`
      : "Mantener observación y preparar referencia si la evolución clínica progresa."
  };
}

function renderSummary(data, decision) {
  const statusText =
    decision.route === "hospitalizacion"
      ? "Referencia hospitalaria recomendada"
      : decision.route === "observacion"
      ? "Observación activa"
      : "Ruta ambulatoria";

  DEMO.els.clinicalSummary.innerHTML = `
    <h3 class="summary-name">${escapeHtml(data.patientName)}</h3>
    <div class="summary-status">${statusText}</div>
    <div class="summary-list">
      <div><strong>Edad / sexo:</strong> ${data.patientAge} / ${escapeHtml(data.patientSex)}</div>
      <div><strong>Aseguradora:</strong> ${escapeHtml(data.payer)}</div>
      <div><strong>Estudios:</strong> ${escapeHtml(data.studies)}</div>
      <div><strong>Diagnóstico:</strong> ${escapeHtml(data.diagnosis)}</div>
    </div>
  `;
}

function renderTimeline() {
  DEMO.els.timeline.innerHTML = DEMO.timelineTemplate.map((step, index) => {
    let statusClass = "is-pending";
    if (index + 1 < DEMO.state.timelineStage) statusClass = "is-complete";
    if (index + 1 === DEMO.state.timelineStage) statusClass = "is-active";

    return `
      <div class="timeline-step ${statusClass}">
        <div class="timeline-step__marker"></div>
        <div class="timeline-step__content">
          <h4>${step.title}</h4>
          <div class="timeline-step__time">${index + 1 <= DEMO.state.timelineStage ? timeStamp() : "--:--:--"}</div>
          <div class="timeline-step__desc">${step.description}</div>
        </div>
      </div>
    `;
  }).join("");
}

function renderDecision(decision) {
  DEMO.els.clinicalScore.textContent = decision.clinicalScore;
  DEMO.els.financialScore.textContent = decision.financialScore;
  DEMO.els.clinicalCriteria.innerHTML = decision.clinicalCriteria.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  DEMO.els.financialCriteria.innerHTML = decision.financialCriteria.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  DEMO.els.decisionResult.textContent = decision.decisionText;

  DEMO.els.decisionBadge.className = "status-badge";
  if (decision.route === "hospitalizacion") {
    DEMO.els.decisionBadge.classList.add("status-badge--warning");
    DEMO.els.decisionBadge.textContent = "Escalamiento hospitalario";
  } else if (decision.route === "observacion") {
    DEMO.els.decisionBadge.classList.add("status-badge--pending");
    DEMO.els.decisionBadge.textContent = "Observación";
  } else {
    DEMO.els.decisionBadge.classList.add("status-badge--success");
    DEMO.els.decisionBadge.textContent = "Ambulatorio";
  }
}

function renderReferral(referral) {
  DEMO.els.referralBadge.className = `status-badge ${referral.badgeClass}`;
  DEMO.els.referralBadge.textContent = referral.badgeText;
  DEMO.els.referralReason.textContent = referral.reason;
  DEMO.els.referralClinicalCriteria.innerHTML = referral.clinicalCriteria.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  DEMO.els.referralOperationalCriteria.innerHTML = referral.operationalCriteria.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  DEMO.els.referralSpecialty.textContent = referral.specialty;
  DEMO.els.referralComplexity.textContent = referral.complexity;
  DEMO.els.referralHospital.textContent = referral.hospital;
  DEMO.els.referralAuthorization.textContent = referral.authorization;
  DEMO.els.referralTransfer.textContent = referral.transfer;
  DEMO.els.referralFinancials.textContent = referral.financials;
  DEMO.els.referralRecommendation.textContent = referral.recommendation;
}

function setRibbonClass(element, type) {
  element.classList.remove("is-success", "is-warning", "is-neutral");
  element.classList.add(type);
}

function renderDashboard(data, decision, referral) {
  const baseCost =
    decision.route === "hospitalizacion"
      ? 48000
      : decision.route === "observacion"
      ? 26000
      : 3800;

  const covered =
    data.payer === "Sin seguro"
      ? decision.route === "ambulatorio" ? 0 : 8000
      : decision.route === "hospitalizacion"
      ? 41000
      : decision.route === "observacion"
      ? 21000
      : 2800;

  const coveragePct = baseCost > 0 ? Math.round((covered / baseCost) * 100) : 0;

  DEMO.state.authorizationId =
    decision.route === "hospitalizacion"
      ? "AUTH-874221"
      : decision.route === "observacion"
      ? "PRE-AUTH-22918"
      : "NO REQUIERE";

  DEMO.state.destinationHospital =
    decision.route === "hospitalizacion"
      ? referral.hospital
      : decision.route === "observacion"
      ? "Red en evaluación"
      : "No aplica";

  DEMO.state.estimatedCost = formatCurrency(baseCost);
  DEMO.state.estimatedCoverage = `${coveragePct}%`;
  DEMO.state.estimatedTransfer =
    decision.route === "hospitalizacion"
      ? "22 min"
      : decision.route === "observacion"
      ? "18 min potencial"
      : "N/A";

  DEMO.els.caseIdHeader.textContent = DEMO.state.caseId;
  DEMO.els.caseIdKpi.textContent = DEMO.state.caseId;
  DEMO.els.authorizationId.textContent = DEMO.state.authorizationId;
  DEMO.els.destinationHospital.textContent = DEMO.state.destinationHospital;
  DEMO.els.estimatedCost.textContent = DEMO.state.estimatedCost;
  DEMO.els.estimatedCoverage.textContent = DEMO.state.estimatedCoverage;
  DEMO.els.estimatedTransfer.textContent = DEMO.state.estimatedTransfer;

  DEMO.els.execCaseValue.textContent =
    decision.route === "hospitalizacion"
      ? "Caso escalado"
      : decision.route === "observacion"
      ? "Evaluación activa"
      : "Resolución ambulatoria";

  DEMO.els.execFinancialValue.textContent =
    decision.route === "hospitalizacion"
      ? "Validada"
      : decision.route === "observacion"
      ? "En revisión"
      : "Básica";

  DEMO.els.execClinicalValue.textContent =
    decision.route === "hospitalizacion"
      ? "Escalar a hospital"
      : decision.route === "observacion"
      ? "Observación"
      : "Ambulatorio";

  DEMO.els.execLiquidationValue.textContent =
    decision.route === "ambulatorio"
      ? "Lista"
      : decision.route === "hospitalizacion"
      ? "Pre-cierre"
      : "Pendiente";

  setRibbonClass(DEMO.els.execCase, "is-success");
  setRibbonClass(
    DEMO.els.execFinancial,
    decision.route === "hospitalizacion" ? "is-success" : decision.route === "observacion" ? "is-warning" : "is-neutral"
  );
  setRibbonClass(
    DEMO.els.execClinical,
    decision.route === "ambulatorio" ? "is-success" : "is-warning"
  );
  setRibbonClass(
    DEMO.els.execLiquidation,
    decision.route === "ambulatorio" ? "is-success" : "is-neutral"
  );
}

function renderAll(logText) {
  const data = getFormData();
  const decision = computeDecision(data);
  const referral = computeReferral(data, decision);

  DEMO.state.timelineStage =
    decision.route === "hospitalizacion"
      ? 4
      : decision.route === "observacion"
      ? 3
      : 5;

  renderSummary(data, decision);
  renderTimeline();
  renderDecision(decision);
  renderReferral(referral);
  renderDashboard(data, decision, referral);

  if (logText) addLog(logText);
}

function stopAutoMode() {
  if (DEMO.state.autoTimer) {
    clearInterval(DEMO.state.autoTimer);
    DEMO.state.autoTimer = null;
  }
}

function paintModeButtons() {
  if (DEMO.state.mode === "auto") {
    DEMO.els.autoBtn.className = "btn btn-primary";
    DEMO.els.interactiveBtn.className = "btn btn-secondary";
  } else {
    DEMO.els.autoBtn.className = "btn btn-secondary";
    DEMO.els.interactiveBtn.className = "btn btn-primary";
  }
}

function setInteractiveMode() {
  stopAutoMode();
  DEMO.state.mode = "interactive";
  paintModeButtons();
  renderAll("Modo interactivo activado.");
}

function updateDecision() {
  stopAutoMode();
  DEMO.state.mode = "interactive";
  paintModeButtons();
  renderAll("Motor de decisión actualizado.");
}

function resetDemo() {
  stopAutoMode();
  DEMO.state.mode = "interactive";
  DEMO.state.autoIndex = 0;
  DEMO.state.timelineStage = 1;
  DEMO.state.activity = [];
  DEMO.state.authorizationId = "PENDIENTE";
  DEMO.state.destinationHospital = "Por definir";
  DEMO.state.estimatedCost = "$0 MXN";
  DEMO.state.estimatedCoverage = "0%";
  DEMO.state.estimatedTransfer = "N/A";

  setFormValues(DEMO.initialForm);
  paintModeButtons();
  renderAll();
  addLog("Demo reiniciado.");
}

function startAutoMode() {
  stopAutoMode();
  DEMO.state.mode = "auto";
  DEMO.state.autoIndex = 0;
  paintModeButtons();

  const scenes = [
    () => {
      setFormValues({
        patientName: "María Fernanda López",
        patientAge: 54,
        patientSex: "Femenino",
        payer: "Mapfre",
        complaint: "Dolor torácico opresivo",
        triage: "Amarillo",
        heartRate: 112,
        systolicBp: 92,
        spo2: 89,
        studies: "ECG + Laboratorio + RX",
        diagnosis: "Síndrome coronario agudo / evento cardiopulmonar a descartar",
        clinicalRoute: "automatico"
      });
      renderAll("Modo automático: caso cargado.");
    },
    () => {
      DEMO.els.clinicalRoute.value = "observacion";
      renderAll("Modo automático: el caso pasa a observación.");
    },
    () => {
      DEMO.els.clinicalRoute.value = "hospitalizacion";
      renderAll("Modo automático: se recomienda referencia hospitalaria.");
    },
    () => {
      DEMO.state.timelineStage = 5;
      renderTimeline();
      addLog("Modo automático: caso preparado para cierre y liquidación.");
    }
  ];

  scenes[0]();

  DEMO.state.autoTimer = setInterval(() => {
    DEMO.state.autoIndex += 1;

    if (DEMO.state.autoIndex >= scenes.length) {
      stopAutoMode();
      addLog("Modo automático finalizado.");
      DEMO.state.mode = "interactive";
      paintModeButtons();
      return;
    }

    scenes[DEMO.state.autoIndex]();
  }, 2200);
}

window.setInteractiveMode = setInteractiveMode;
window.updateDecision = updateDecision;
window.resetDemo = resetDemo;
window.startAutoMode = startAutoMode;

document.addEventListener("DOMContentLoaded", initDemo);
