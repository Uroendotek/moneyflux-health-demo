var state = {
  caseId: "MFH-2026-001",
  mode: "interactive",
  autoTimer: null,
  autoStep: 0,
  timelineStage: 1,
  logs: []
};

function el(id) {
  return document.getElementById(id);
}

function nowTime() {
  var d = new Date();
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function logMessage(text) {
  state.logs.unshift({
    time: nowTime(),
    text: text
  });

  if (state.logs.length > 12) {
    state.logs = state.logs.slice(0, 12);
  }

  renderLog();
}

function renderLog() {
  var container = el("activity-log");
  if (!container) return;

  var html = "";
  for (var i = 0; i < state.logs.length; i++) {
    html +=
      '<div class="activity-log__item">' +
      '<span class="activity-log__time">' + state.logs[i].time + "</span>" +
      '<div class="activity-log__text">' + state.logs[i].text + "</div>" +
      "</div>";
  }
  container.innerHTML = html;
}

function setModeButtons() {
  var autoBtn = el("auto-mode-btn");
  var interactiveBtn = el("interactive-mode-btn");

  if (!autoBtn || !interactiveBtn) return;

  if (state.mode === "auto") {
    autoBtn.className = "btn btn-primary";
    interactiveBtn.className = "btn btn-secondary";
  } else {
    autoBtn.className = "btn btn-secondary";
    interactiveBtn.className = "btn btn-primary";
  }
}

function getFormData() {
  return {
    patientName: el("patient-name") ? el("patient-name").value : "María Fernanda López",
    patientAge: el("patient-age") ? Number(el("patient-age").value || 0) : 54,
    patientSex: el("patient-sex") ? el("patient-sex").value : "Femenino",
    payer: el("payer") ? el("payer").value : "Mapfre",
    complaint: el("complaint") ? el("complaint").value : "Dolor torácico opresivo",
    triage: el("triage") ? el("triage").value : "Amarillo",
    heartRate: el("heart-rate") ? Number(el("heart-rate").value || 0) : 112,
    systolicBp: el("systolic-bp") ? Number(el("systolic-bp").value || 0) : 92,
    spo2: el("spo2") ? Number(el("spo2").value || 0) : 89,
    studies: el("studies") ? el("studies").value : "ECG + Laboratorio + RX",
    diagnosis: el("diagnosis") ? el("diagnosis").value : "Síndrome coronario agudo / evento cardiopulmonar a descartar",
    clinicalRoute: el("clinical-route") ? el("clinical-route").value : "automatico"
  };
}

function computeDecision(data) {
  var clinicalScore = 0;
  var financialScore = 0;
  var route = "ambulatorio";
  var clinicalCriteria = [];
  var financialCriteria = [];

  if (data.triage === "Rojo") {
    clinicalScore += 45;
    clinicalCriteria.push("Triage crítico");
  } else if (data.triage === "Amarillo") {
    clinicalScore += 30;
    clinicalCriteria.push("Triage alto riesgo");
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
    clinicalCriteria.push("Hipotensión relativa");
  }

  if (data.spo2 > 0 && data.spo2 < 90) {
    clinicalScore += 20;
    clinicalCriteria.push("Desaturación");
  }

  if (
    data.complaint.toLowerCase().indexOf("tor") !== -1 ||
    data.diagnosis.toLowerCase().indexOf("coron") !== -1 ||
    data.diagnosis.toLowerCase().indexOf("cardio") !== -1
  ) {
    clinicalScore += 18;
    clinicalCriteria.push("Posible evento cardiopulmonar");
  }

  if (data.payer !== "Sin seguro") {
    financialScore += 55;
    financialCriteria.push("Cobertura preliminar identificada");
    financialCriteria.push("Canal de pagador activo");
  } else {
    financialScore += 12;
    financialCriteria.push("Caso sin seguro");
  }

  if (clinicalScore >= 50) {
    financialScore += 15;
    financialCriteria.push("Red hospitalaria justificable");
  }

  if (data.clinicalRoute === "hospitalizacion") {
    route = "hospitalizacion";
    clinicalCriteria.push("Ruta manual a hospitalización");
    financialCriteria.push("Preparación operativa para referencia");
  } else if (data.clinicalRoute === "observacion") {
    route = "observacion";
    clinicalCriteria.push("Ruta manual a observación");
  } else if (data.clinicalRoute === "ambulatorio") {
    route = "ambulatorio";
  } else {
    if (clinicalScore >= 68 && financialScore >= 55) {
      route = "hospitalizacion";
    } else if (clinicalScore >= 45) {
      route = "observacion";
    } else {
      route = "ambulatorio";
    }
  }

  if (clinicalScore > 100) clinicalScore = 100;
  if (financialScore > 100) financialScore = 100;

  var decisionText = "";
  if (route === "hospitalizacion") {
    decisionText = "Se recomienda referencia hospitalaria por severidad clínica y viabilidad operativa.";
  } else if (route === "observacion") {
    decisionText = "Se recomienda observación clínica con posible escalamiento.";
  } else {
    decisionText = "Se recomienda resolución ambulatoria controlada.";
  }

  return {
    route: route,
    clinicalScore: clinicalScore,
    financialScore: financialScore,
    clinicalCriteria: clinicalCriteria,
    financialCriteria: financialCriteria,
    decisionText: decisionText
  };
}

function renderSummary(data, decision) {
  var target = el("clinical-summary");
  if (!target) return;

  var status = "Ruta ambulatoria";
  if (decision.route === "hospitalizacion") status = "Referencia hospitalaria recomendada";
  if (decision.route === "observacion") status = "Observación activa";

  target.innerHTML =
    '<h3 class="summary-name">' + data.patientName + "</h3>" +
    '<div class="summary-status">' + status + "</div>" +
    '<div class="summary-list">' +
    "<div><strong>Edad / sexo:</strong> " + data.patientAge + " / " + data.patientSex + "</div>" +
    "<div><strong>Aseguradora:</strong> " + data.payer + "</div>" +
    "<div><strong>Estudios:</strong> " + data.studies + "</div>" +
    "<div><strong>Diagnóstico:</strong> " + data.diagnosis + "</div>" +
    "</div>";
}

function renderTimeline() {
  var target = el("timeline");
  if (!target) return;

  var steps = [
    {
      title: "Ingreso y registro",
      desc: "Captura del paciente, motivo de consulta, triage y cobertura."
    },
    {
      title: "Validación financiera",
      desc: "Elegibilidad, autorización preliminar y red hospitalaria."
    },
    {
      title: "Motor de decisión clínica-financiera",
      desc: "Activación de criterios clínicos y operativos."
    },
    {
      title: "Coordinación del siguiente nivel",
      desc: "Ambulatorio, observación o referencia hospitalaria."
    },
    {
      title: "Cierre y liquidación",
      desc: "Consolidación del caso y estatus final."
    }
  ];

  var html = "";
  for (var i = 0; i < steps.length; i++) {
    var cls = "is-pending";
    if (i + 1 < state.timelineStage) cls = "is-complete";
    if (i + 1 === state.timelineStage) cls = "is-active";

    html +=
      '<div class="timeline-step ' + cls + '">' +
      '<div class="timeline-step__marker"></div>' +
      '<div class="timeline-step__content">' +
      "<h4>" + steps[i].title + "</h4>" +
      '<div class="timeline-step__time">' + (i + 1 <= state.timelineStage ? nowTime() : "--:--:--") + "</div>" +
      '<div class="timeline-step__desc">' + steps[i].desc + "</div>" +
      "</div>" +
      "</div>";
  }

  target.innerHTML = html;
}

function renderDecision(decision) {
  if (el("clinical-score")) el("clinical-score").textContent = decision.clinicalScore;
  if (el("financial-score")) el("financial-score").textContent = decision.financialScore;

  if (el("clinical-criteria")) {
    var cHtml = "";
    for (var i = 0; i < decision.clinicalCriteria.length; i++) {
      cHtml += "<li>" + decision.clinicalCriteria[i] + "</li>";
    }
    el("clinical-criteria").innerHTML = cHtml;
  }

  if (el("financial-criteria")) {
    var fHtml = "";
    for (var j = 0; j < decision.financialCriteria.length; j++) {
      fHtml += "<li>" + decision.financialCriteria[j] + "</li>";
    }
    el("financial-criteria").innerHTML = fHtml;
  }

  if (el("decision-result")) {
    el("decision-result").textContent = decision.decisionText;
  }

  if (el("decision-badge")) {
    var badge = el("decision-badge");
    badge.className = "status-badge";

    if (decision.route === "hospitalizacion") {
      badge.className += " status-badge--warning";
      badge.textContent = "Escalamiento hospitalario";
    } else if (decision.route === "observacion") {
      badge.className += " status-badge--pending";
      badge.textContent = "Observación";
    } else {
      badge.className += " status-badge--success";
      badge.textContent = "Ambulatorio";
    }
  }
}

function renderReferral(decision, data) {
  var badgeText = "No requerida";
  var badgeClass = "status-badge status-badge--neutral";
  var reason = "La referencia hospitalaria no es requerida en este momento.";
  var clinical = "<li>No se documenta necesidad inmediata de internamiento</li>";
  var operational = "<li>No se activa traslado hospitalario</li>";
  var specialty = "N/A";
  var complexity = "Baja";
  var hospital = "No aplica";
  var authorization = "N/A";
  var transfer = "N/A";
  var financials = "N/A";
  var recommendation = "Continuar resolución ambulatoria y documentar cierre.";

  if (decision.route === "observacion") {
    badgeText = "Evaluación en curso";
    badgeClass = "status-badge status-badge--pending";
    reason = "El caso permanece en observación con potencial de escalamiento.";
    clinical = "<li>Persisten criterios de vigilancia clínica</li><li>Se recomienda reevaluación seriada</li>";
    operational = "<li>Red hospitalaria en evaluación</li><li>Autorización preliminar posible</li>";
    specialty = "Urgencias / medicina interna";
    complexity = "Media";
    hospital = "Red en evaluación";
    authorization = "14 min";
    transfer = "18 min potencial";
    financials = "$26,000 MXN / cobertura preliminar";
    recommendation = "Mantener observación y preparar referencia si progresa.";
  }

  if (decision.route === "hospitalizacion") {
    badgeText = "Recomendada";
    badgeClass = "status-badge status-badge--warning";
    reason = "El caso se escala por severidad clínica y viabilidad operativa suficiente.";
    clinical = "<li>Triage de alto riesgo o crítico</li><li>Signos vitales comprometidos</li><li>Necesidad de capacidad resolutiva hospitalaria</li>";
    operational = "<li>Hospital aliado disponible</li><li>Autorización viable</li><li>Traslado dentro de SLA</li>";
    specialty = "Medicina interna / cardiología";
    complexity = "Media-alta";
    hospital = "Hospital Ángeles Roma";
    authorization = "8 min";
    transfer = "22 min / SLA 30 min";
    financials = data.payer === "Sin seguro" ? "$48,000 MXN / fondeo parcial" : "$48,000 MXN / 85% cobertura";
    recommendation = "Proceder con referencia hospitalaria controlada.";
  }

  if (el("referral-badge")) {
    el("referral-badge").className = badgeClass;
    el("referral-badge").textContent = badgeText;
  }
  if (el("referral-reason")) el("referral-reason").textContent = reason;
  if (el("referral-clinical-criteria")) el("referral-clinical-criteria").innerHTML = clinical;
  if (el("referral-operational-criteria")) el("referral-operational-criteria").innerHTML = operational;
  if (el("referral-specialty")) el("referral-specialty").textContent = specialty;
  if (el("referral-complexity")) el("referral-complexity").textContent = complexity;
  if (el("referral-hospital")) el("referral-hospital").textContent = hospital;
  if (el("referral-authorization")) el("referral-authorization").textContent = authorization;
  if (el("referral-transfer")) el("referral-transfer").textContent = transfer;
  if (el("referral-financials")) el("referral-financials").textContent = financials;
  if (el("referral-recommendation")) el("referral-recommendation").textContent = recommendation;
}

function setRibbonStatus(route) {
  var caseValue = "Captura inicial";
  var financialValue = "Pendiente";
  var clinicalValue = "Pendiente";
  var liquidationValue = "Pendiente";

  if (route === "ambulatorio") {
    caseValue = "Resolución ambulatoria";
    financialValue = "Básica";
    clinicalValue = "Ambulatorio";
    liquidationValue = "Lista";
  } else if (route === "observacion") {
    caseValue = "Evaluación activa";
    financialValue = "En revisión";
    clinicalValue = "Observación";
    liquidationValue = "Pendiente";
  } else if (route === "hospitalizacion") {
    caseValue = "Caso escalado";
    financialValue = "Validada";
    clinicalValue = "Escalar a hospital";
    liquidationValue = "Pre-cierre";
  }

  if (el("exec-case-value")) el("exec-case-value").textContent = caseValue;
  if (el("exec-financial-value")) el("exec-financial-value").textContent = financialValue;
  if (el("exec-clinical-value")) el("exec-clinical-value").textContent = clinicalValue;
  if (el("exec-liquidation-value")) el("exec-liquidation-value").textContent = liquidationValue;
}

function renderDashboard(decision, data) {
  var auth = "NO REQUIERE";
  var hospital = "No aplica";
  var cost = "$3,800 MXN";
  var coverage = data.payer === "Sin seguro" ? "0%" : "74%";
  var transfer = "N/A";

  if (decision.route === "observacion") {
    auth = "PRE-AUTH-22918";
    hospital = "Red en evaluación";
    cost = "$26,000 MXN";
    coverage = data.payer === "Sin seguro" ? "31%" : "81%";
    transfer = "18 min potencial";
  }

  if (decision.route === "hospitalizacion") {
    auth = "AUTH-874221";
    hospital = "Hospital Ángeles Roma";
    cost = "$48,000 MXN";
    coverage = data.payer === "Sin seguro" ? "17%" : "85%";
    transfer = "22 min";
  }

  if (el("case-id-header")) el("case-id-header").textContent = state.caseId;
  if (el("case-id-kpi")) el("case-id-kpi").textContent = state.caseId;
  if (el("authorization-id")) el("authorization-id").textContent = auth;
  if (el("destination-hospital")) el("destination-hospital").textContent = hospital;
  if (el("estimated-cost")) el("estimated-cost").textContent = cost;
  if (el("estimated-coverage")) el("estimated-coverage").textContent = coverage;
  if (el("estimated-transfer")) el("estimated-transfer").textContent = transfer;
}

function renderAll(logText) {
  var data = getFormData();
  var decision = computeDecision(data);

  if (decision.route === "hospitalizacion") {
    state.timelineStage = 4;
  } else if (decision.route === "observacion") {
    state.timelineStage = 3;
  } else {
    state.timelineStage = 5;
  }

  renderSummary(data, decision);
  renderTimeline();
  renderDecision(decision);
  renderReferral(decision, data);
  renderDashboard(decision, data);
  setRibbonStatus(decision.route);

  if (logText) {
    logMessage(logText);
  }
}

function updateDecision() {
  stopAutoMode();
  state.mode = "interactive";
  setModeButtons();
  renderAll("Motor de decisión actualizado.");
}

function setInteractiveMode() {
  stopAutoMode();
  state.mode = "interactive";
  setModeButtons();
  renderAll("Modo interactivo activado.");
}

function stopAutoMode() {
  if (state.autoTimer) {
    clearInterval(state.autoTimer);
    state.autoTimer = null;
  }
}

function startAutoMode() {
  stopAutoMode();
  state.mode = "auto";
  state.autoStep = 0;
  setModeButtons();

  renderAll("Modo automático: caso cargado.");

  state.autoTimer = setInterval(function () {
    state.autoStep++;

    if (state.autoStep === 1) {
      if (el("clinical-route")) el("clinical-route").value = "observacion";
      renderAll("Modo automático: el caso pasa a observación.");
      return;
    }

    if (state.autoStep === 2) {
      if (el("clinical-route")) el("clinical-route").value = "hospitalizacion";
      renderAll("Modo automático: se recomienda referencia hospitalaria.");
      return;
    }

    if (state.autoStep === 3) {
      state.timelineStage = 5;
      renderTimeline();
      logMessage("Modo automático: caso preparado para cierre y liquidación.");
      return;
    }

    stopAutoMode();
    state.mode = "interactive";
    setModeButtons();
    logMessage("Modo automático finalizado.");
  }, 2200);
}

function resetDemo() {
  stopAutoMode();
  state.mode = "interactive";
  state.autoStep = 0;
  state.timelineStage = 1;
  state.logs = [];

  if (el("patient-name")) el("patient-name").value = "María Fernanda López";
  if (el("patient-age")) el("patient-age").value = "54";
  if (el("patient-sex")) el("patient-sex").value = "Femenino";
  if (el("payer")) el("payer").value = "Mapfre";
  if (el("complaint")) el("complaint").value = "Dolor torácico opresivo";
  if (el("triage")) el("triage").value = "Amarillo";
  if (el("heart-rate")) el("heart-rate").value = "112";
  if (el("systolic-bp")) el("systolic-bp").value = "92";
  if (el("spo2")) el("spo2").value = "89";
  if (el("studies")) el("studies").value = "ECG + Laboratorio + RX";
  if (el("diagnosis")) el("diagnosis").value = "Síndrome coronario agudo / evento cardiopulmonar a descartar";
  if (el("clinical-route")) el("clinical-route").value = "automatico";

  setModeButtons();
  renderAll();
  logMessage("Demo reiniciado.");
}

window.updateDecision = updateDecision;
window.setInteractiveMode = setInteractiveMode;
window.startAutoMode = startAutoMode;
window.resetDemo = resetDemo;

document.addEventListener("DOMContentLoaded", function () {
  if (el("case-clock")) {
    el("case-clock").textContent = nowTime();
    setInterval(function () {
      if (el("case-clock")) {
        el("case-clock").textContent = nowTime();
      }
    }, 1000);
  }

  setModeButtons();
  resetDemo();
  logMessage("JS cargado correctamente.");
});
