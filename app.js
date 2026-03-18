document.addEventListener("DOMContentLoaded", () => {
  const els = {
    patientName: document.getElementById("patient-name"),
    patientAge: document.getElementById("patient-age"),
    patientSex: document.getElementById("patient-sex"),
    payer: document.getElementById("payer"),
    complaint: document.getElementById("complaint"),
    triage: document.getElementById("triage"),
    heartRate: document.getElementById("heart-rate"),
    systolicBp: document.getElementById("systolic-bp"),
    spo2: document.getElementById("spo2"),
    studies: document.getElementById("studies"),
    diagnosis: document.getElementById("diagnosis"),
    clinicalRoute: document.getElementById("clinical-route"),

    autoBtn: document.getElementById("auto-mode-btn"),
    interactiveBtn: document.getElementById("interactive-mode-btn"),
    resetBtn: document.getElementById("reset-demo-btn"),
    updateBtn: document.getElementById("update-engine-btn"),

    caseClock: document.getElementById("case-clock"),
    timeline: document.getElementById("timeline"),
    clinicalSummary: document.getElementById("clinical-summary"),

    clinicalScore: document.getElementById("clinical-score"),
    financialScore: document.getElementById("financial-score"),
    clinicalCriteria: document.getElementById("clinical-criteria"),
    financialCriteria: document.getElementById("financial-criteria"),
    decisionResult: document.getElementById("decision-result"),
    decisionBadge: document.getElementById("decision-badge"),

    referralBadge: document.getElementById("referral-badge"),
    referralReason: document.getElementById("referral-reason"),
    referralClinicalCriteria: document.getElementById("referral-clinical-criteria"),
    referralOperationalCriteria: document.getElementById("referral-operational-criteria"),
    referralSpecialty: document.getElementById("referral-specialty"),
    referralComplexity: document.getElementById("referral-complexity"),
    referralHospital: document.getElementById("referral-hospital"),
    referralAuthorization: document.getElementById("referral-authorization"),
    referralTransfer: document.getElementById("referral-transfer"),
    referralFinancials: document.getElementById("referral-financials"),
    referralRecommendation: document.getElementById("referral-recommendation"),

    activityLog: document.getElementById("activity-log"),

    caseIdHeader: document.getElementById("case-id-header"),
    caseIdKpi: document.getElementById("case-id-kpi"),
    authorizationId: document.getElementById("authorization-id"),
    destinationHospital: document.getElementById("destination-hospital"),
    estimatedCost: document.getElementById("estimated-cost"),
    estimatedCoverage: document.getElementById("estimated-coverage"),
    estimatedTransfer: document.getElementById("estimated-transfer"),

    execCase: document.getElementById("exec-case"),
    execFinancial: document.getElementById("exec-financial"),
    execClinical: document.getElementById("exec-clinical"),
    execLiquidation: document.getElementById("exec-liquidation"),
    execCaseValue: document.getElementById("exec-case-value"),
    execFinancialValue: document.getElementById("exec-financial-value"),
    execClinicalValue: document.getElementById("exec-clinical-value"),
    execLiquidationValue: document.getElementById("exec-liquidation-value")
  };

  const timelineTemplate = [
    {
      key: "ingreso",
      title: "Ingreso y registro",
      description: "Captura del paciente, motivo de consulta, triage y datos de cobertura."
    },
    {
      key: "financiera",
      title: "Validación financiera",
      description: "Evaluación de elegibilidad, autorización preliminar y red hospitalaria."
    },
    {
      key: "motor",
      title: "Motor de decisión clínica-financiera",
      description: "Activación de criterios clínicos y operativos para definir la ruta."
    },
    {
      key: "coordinacion",
      title: "Coordinación del siguiente nivel",
      description: "Definición ambulatoria, observación o referencia hospitalaria con trazabilidad."
    },
    {
      key: "liquidacion",
      title: "Cierre y liquidación",
      description: "Consolidación del caso, costos estimados y estatus final."
    }
  ];

  const initialForm = {
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
  };

  const state = {
    caseId: "MFH-2026-001",
    mode: "interactive",
    autoTimer: null,
    autoStep: 0,
    startedAt: new Date(),
    timelineStage: 1,
    authorizationId: "PENDIENTE",
    destinationHospital: "Por definir",
    estimatedCost: "$0 MXN",
    estimatedCoverage: "0%",
    estimatedTransfer: "N/A",
    financialStatus: "Pendiente",
    clinicalStatus: "Pendiente",
    liquidationStatus: "Pendiente",
    caseStatus: "Captura inicial",
    activity: []
  };

  function setFormValues(values) {
    els.patientName.value = values.patientName;
    els.patientAge.value = values.patientAge;
    els.patientSex.value = values.patientSex;
    els.payer.value = values.payer;
    els.complaint.value = values.complaint;
    els.triage.value = values.triage;
    els.heartRate.value = values.heartRate;
    els.systolicBp.value = values.systolicBp;
    els.spo2.value = values.spo2;
    els.studies.value = values.studies;
    els.diagnosis.value = values.diagnosis;
    els.clinicalRoute.value = values.clinicalRoute;
  }

  function getFormData() {
    return {
      patientName: els.patientName.value.trim(),
      patientAge: Number(els.patientAge.value || 0),
      patientSex: els.patientSex.value,
      payer: els.payer.value,
      complaint: els.complaint.value.trim(),
      triage: els.triage.value,
      heartRate: Number(els.heartRate.value || 0),
      systolicBp: Number(els.systolicBp.value || 0),
      spo2: Number(els.spo2.value || 0),
      studies: els.studies.value,
      diagnosis: els.diagnosis.value.trim(),
      clinicalRoute: els.clinicalRoute.value
    };
  }

  function timeStamp() {
    const now = new Date();
    return now.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  function addLog(message) {
    state.activity.unshift({
      time: timeStamp(),
      text: message
    });

    state.activity = state.activity.slice(0, 14);
    renderActivityLog();
  }

  function renderActivityLog() {
    els.activityLog.innerHTML = state.activity
      .map(
        (item) => `
          <div class="activity-log__item">
            <span class="activity-log__time">${item.time}</span>
            <div class="activity-log__text">${item.text}</div>
          </div>
        `
      )
      .join("");
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(value);
  }

  function computeDecision(data) {
    const clinicalCriteria = [];
    const financialCriteria = [];
    let clinicalScore = 0;
    let financialScore = 0;

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
      clinicalCriteria.push("Saturación de oxígeno comprometida");
    } else if (data.spo2 >= 90 && data.spo2 <= 93) {
      clinicalScore += 10;
      clinicalCriteria.push("Saturación limítrofe");
    }

    if (/tor[aá]cico|coronario|cardio|evento/i.test(data.complaint + " " + data.diagnosis)) {
      clinicalScore += 18;
      clinicalCriteria.push("Posible evento cardiopulmonar / coronario");
    }

    if (/ECG|Laboratorio|RX/i.test(data.studies)) {
      clinicalScore += 6;
      clinicalCriteria.push("Estudios diagnósticos ya activados");
    }

    if (data.payer !== "Sin seguro") {
      financialScore += 40;
      financialCriteria.push("Cobertura inicial identificada");
    } else {
      financialScore += 10;
      financialCriteria.push("Caso con presión financiera alta");
    }

    if (clinicalScore >= 50) {
      financialScore += 18;
      financialCriteria.push("Se justifica activación de red hospitalaria");
    }

    if (data.payer === "Mapfre" || data.payer === "AXA" || data.payer === "GNP") {
      financialScore += 22;
      financialCriteria.push("Aseguradora con canal resolutivo activo");
    }

    if (data.clinicalRoute === "hospitalizacion") {
      clinicalScore += 10;
      financialScore += 8;
      clinicalCriteria.push("Ruta manual forzada a hospitalización");
      financialCriteria.push("Preparación operativa para referencia");
    } else if (data.clinicalRoute === "observacion") {
      clinicalScore += 5;
      financialScore += 6;
      clinicalCriteria.push("Ruta manual forzada a observación");
      financialCriteria.push("Viabilidad operativa para observación");
    } else if (data.clinicalRoute === "ambulatorio") {
      financialCriteria.push("Resolución de menor costo potencial");
    }

    clinicalScore = Math.min(100, clinicalScore);
    financialScore = Math.min(100, financialScore);

    let route;
    if (data.clinicalRoute !== "automatico") {
      route = data.clinicalRoute;
    } else if (clinicalScore >= 68 && financialScore >= 55) {
      route = "hospitalizacion";
    } else if (clinicalScore >= 45) {
      route = "observacion";
    } else {
      route = "ambulatorio";
    }

    let decisionText = "";
    if (route === "hospitalizacion") {
      decisionText = "Se recomienda referencia hospitalaria por severidad clínica relevante, necesidad de monitoreo/capacidad resolutiva y viabilidad financiera-operativa suficiente.";
    } else if (route === "observacion") {
      decisionText = "Se recomienda observación clínica con escalamiento hospitalario condicionado a evolución, estudios y autorización complementaria.";
    } else {
      decisionText = "Se recomienda manejo ambulatorio controlado, con seguimiento y cierre operativo de bajo costo.";
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
        status: "neutral",
        badgeText: "No requerida",
        reason: "La referencia hospitalaria no es requerida en este momento. El caso puede resolverse fuera del hospital con seguimiento clínico y cierre operativo.",
        clinicalCriteria: [
          "No se documenta necesidad inmediata de internamiento",
          "La ruta de resolución se mantiene ambulatoria"
        ],
        operationalCriteria: [
          "Se evita costo hospitalario innecesario",
          "No se activa traslado ni cama hospitalaria"
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
    const hospital = severe ? "Hospital Ángeles Roma" : "Hospital Star Médica Centro";
    const authorizationMins = severe ? 8 : 14;
    const transferMins = severe ? 22 : 18;
    const totalCost = severe ? 48000 : 26000;
    const coveredAmount = data.payer === "Sin seguro" ? 8000 : severe ? 41000 : 21000;
    const gap = Math.max(0, totalCost - coveredAmount);
    const coveragePct = Math.round((coveredAmount / totalCost) * 100);

    const clinicalCriteria = [...decision.clinicalCriteria];
    const operationalCriteria = [
      "Hospital aliado con capacidad disponible",
      "Traslado dentro de SLA operativo",
      "Canal de autorización y referencia activo"
    ];

    if (data.payer !== "Sin seguro") {
      operationalCriteria.push("Cobertura preliminar positiva");
    } else {
      operationalCriteria.push("Se requiere fondeo o acuerdo complementario");
    }

    return {
      status: severe ? "warning" : "neutral",
      badgeText: severe ? "Recomendada" : "Evaluación en curso",
      reason: severe
        ? "El caso se escala por severidad clínica, necesidad de capacidad hospitalaria y viabilidad operativa suficiente para referencia controlada."
        : "El caso permanece en observación con posibilidad de referencia si persisten hallazgos de riesgo o si la evolución clínica se deteriora.",
      clinicalCriteria,
      operationalCriteria,
      specialty: severe ? "Medicina interna / cardiología" : "Urgencias / medicina interna",
      complexity: severe ? "Media-alta" : "Media",
      hospital,
      authorization: `${authorizationMins} min`,
      transfer: `${transferMins} min / SLA total ${authorizationMins + transferMins} min`,
      financials: `${formatCurrency(totalCost)} / ${coveragePct}% cobertura`,
      recommendation: severe
        ? `Proceder con referencia hospitalaria controlada. Brecha estimada: ${formatCurrency(gap)}.`
        : "Mantener observación, repetir valoración clínica y preparar red de referencia si el caso progresa."
    };
  }

  function updateExecutiveRibbon(route) {
    state.caseStatus = route === "hospitalizacion"
      ? "Caso escalado"
      : route === "observacion"
      ? "Evaluación activa"
      : "Resolución ambulatoria";

    state.financialStatus = route === "hospitalizacion"
      ? "Validada"
      : route === "observacion"
      ? "En revisión"
      : "Básica";

    state.clinicalStatus = route === "hospitalizacion"
      ? "Escalar a hospital"
      : route === "observacion"
      ? "Observación"
      : "Ambulatorio";

    state.liquidationStatus = route === "hospitalizacion"
      ? "Pre-cierre"
      : route === "observacion"
      ? "Pendiente"
      : "Lista";

    els.execCaseValue.textContent = state.caseStatus;
    els.execFinancialValue.textContent = state.financialStatus;
    els.execClinicalValue.textContent = state.clinicalStatus;
    els.execLiquidationValue.textContent = state.liquidationStatus;

    setRibbonClass(els.execCase, "success");
    setRibbonClass(els.execFinancial, route === "hospitalizacion" ? "success" : route === "observacion" ? "warning" : "neutral");
    setRibbonClass(els.execClinical, route === "hospitalizacion" ? "warning" : route === "observacion" ? "warning" : "success");
    setRibbonClass(els.execLiquidation, route === "ambulatorio" ? "success" : "neutral");
  }

  function setRibbonClass(element, type) {
    element.classList.remove("is-success", "is-warning", "is-neutral");
    if (type === "success") element.classList.add("is-success");
    if (type === "warning") element.classList.add("is-warning");
    if (type === "neutral") element.classList.add("is-neutral");
  }

  function renderSummary(data, decision) {
    const statusText =
      decision.route === "hospitalizacion"
        ? "Referencia hospitalaria recomendada"
        : decision.route === "observacion"
        ? "Observación activa"
        : "Ruta ambulatoria";

    els.clinicalSummary.innerHTML = `
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
    els.timeline.innerHTML = timelineTemplate
      .map((step, index) => {
        let statusClass = "is-pending";
        if (index + 1 < state.timelineStage) statusClass = "is-complete";
        if (index + 1 === state.timelineStage) statusClass = "is-active";

        return `
          <div class="timeline-step ${statusClass}">
            <div class="timeline-step__marker"></div>
            <div class="timeline-step__content">
              <h4>${step.title}</h4>
              <div class="timeline-step__time">${index + 1 < state.timelineStage ? timeStamp() : "--:--:--"}</div>
              <div class="timeline-step__desc">${step.description}</div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderDecision(decision) {
    els.clinicalScore.textContent = decision.clinicalScore;
    els.financialScore.textContent = decision.financialScore;
    els.clinicalCriteria.innerHTML = decision.clinicalCriteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    els.financialCriteria.innerHTML = decision.financialCriteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    els.decisionResult.textContent = decision.decisionText;

    els.decisionBadge.className = "status-badge";
    if (decision.route === "hospitalizacion") {
      els.decisionBadge.classList.add("status-badge--warning");
      els.decisionBadge.textContent = "Escalamiento hospitalario";
    } else if (decision.route === "observacion") {
      els.decisionBadge.classList.add("status-badge--pending");
      els.decisionBadge.textContent = "Observación";
    } else {
      els.decisionBadge.classList.add("status-badge--success");
      els.decisionBadge.textContent = "Ambulatorio";
    }
  }

  function renderReferral(referral) {
    els.referralBadge.className = "status-badge";
    if (referral.status === "warning") {
      els.referralBadge.classList.add("status-badge--warning");
    } else if (referral.status === "success") {
      els.referralBadge.classList.add("status-badge--success");
    } else {
      els.referralBadge.classList.add("status-badge--neutral");
    }

    els.referralBadge.textContent = referral.badgeText;
    els.referralReason.textContent = referral.reason;
    els.referralClinicalCriteria.innerHTML = referral.clinicalCriteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    els.referralOperationalCriteria.innerHTML = referral.operationalCriteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    els.referralSpecialty.textContent = referral.specialty;
    els.referralComplexity.textContent = referral.complexity;
    els.referralHospital.textContent = referral.hospital;
    els.referralAuthorization.textContent = referral.authorization;
    els.referralTransfer.textContent = referral.transfer;
    els.referralFinancials.textContent = referral.financials;
    els.referralRecommendation.textContent = referral.recommendation;
  }

  function renderDashboard(decision, referral, data) {
    const baseCost =
      decision.route === "hospitalizacion"
        ? 48000
        : decision.route === "observacion"
        ? 26000
        : 3800;

    const coveredAmount =
      data.payer === "Sin seguro"
        ? decision.route === "ambulatorio"
          ? 0
          : 8000
        : decision.route === "hospitalizacion"
        ? 41000
        : decision.route === "observacion"
        ? 21000
        : 2800;

    const coveragePct = baseCost > 0 ? Math.round((coveredAmount / baseCost) * 100) : 0;

    state.authorizationId =
      decision.route === "hospitalizacion"
        ? "AUTH-874221"
        : decision.route === "observacion"
        ? "PRE-AUTH-22918"
        : "NO REQUIERE";

    state.destinationHospital =
      decision.route === "hospitalizacion"
        ? referral.hospital
        : decision.route === "observacion"
        ? "Red en evaluación"
        : "No aplica";

    state.estimatedCost = formatCurrency(baseCost);
    state.estimatedCoverage = `${coveragePct}%`;
    state.estimatedTransfer =
      decision.route === "hospitalizacion"
        ? "22 min"
        : decision.route === "observacion"
        ? "18 min potencial"
        : "N/A";

    els.caseIdHeader.textContent = state.caseId;
    els.caseIdKpi.textContent = state.caseId;
    els.authorizationId.textContent = state.authorizationId;
    els.destinationHospital.textContent = state.destinationHospital;
    els.estimatedCost.textContent = state.estimatedCost;
    els.estimatedCoverage.textContent = state.estimatedCoverage;
    els.estimatedTransfer.textContent = state.estimatedTransfer;
  }

  function updateTimelineStage(decision) {
    state.timelineStage =
      decision.route === "hospitalizacion"
        ? 4
        : decision.route === "observacion"
        ? 3
        : 5;
  }

  function renderAll(options = {}) {
    const data = getFormData();
    const decision = computeDecision(data);
    const referral = computeReferral(data, decision);

    updateTimelineStage(decision);
    renderSummary(data, decision);
    renderTimeline();
    renderDecision(decision);
    renderReferral(referral);
    renderDashboard(decision, referral, data);
    updateExecutiveRibbon(decision.route);

    if (!options.silentLog) {
      addLog(`Motor actualizado: ruta ${decision.route}, score clínico ${decision.clinicalScore}, score financiero-operativo ${decision.financialScore}.`);
    }
  }

  function setMode(mode) {
    state.mode = mode;
    els.autoBtn.classList.toggle("btn-primary", mode === "auto");
    els.autoBtn.classList.toggle("btn-secondary", mode !== "auto");
    els.interactiveBtn.classList.toggle("btn-primary", mode === "interactive");
    els.interactiveBtn.classList.toggle("btn-secondary", mode !== "interactive");
  }

  function stopAutoMode() {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
  }

  function startAutoMode() {
    stopAutoMode();
    setMode("auto");
    state.autoStep = 0;
    addLog("Modo automático activado.");

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
        renderAll({ silentLog: true });
        addLog("Caso cargado en modo automático.");
      },
      () => {
        els.clinicalRoute.value = "observacion";
        renderAll({ silentLog: true });
        addLog("El motor mueve el caso a observación y evaluación ampliada.");
      },
      () => {
        els.clinicalRoute.value = "hospitalizacion";
        renderAll({ silentLog: true });
        addLog("Se recomienda referencia hospitalaria y se prepara autorización.");
      },
      () => {
        state.timelineStage = 5;
        state.liquidationStatus = "En preparación";
        renderTimeline();
        addLog("Caso listo para cierre operativo y consolidación financiera.");
      }
    ];

    scenes[0]();
    state.autoTimer = setInterval(() => {
      state.autoStep += 1;
      if (state.autoStep >= scenes.length) {
        stopAutoMode();
        addLog("Modo automático finalizado.");
        return;
      }
      scenes[state.autoStep]();
    }, 2500);
  }

  function resetDemo() {
    stopAutoMode();
    setMode("interactive");
    state.caseId = "MFH-2026-001";
    state.authorizationId = "PENDIENTE";
    state.destinationHospital = "Por definir";
    state.estimatedCost = "$0 MXN";
    state.estimatedCoverage = "0%";
    state.estimatedTransfer = "N/A";
    state.financialStatus = "Pendiente";
    state.clinicalStatus = "Pendiente";
    state.liquidationStatus = "Pendiente";
    state.caseStatus = "Captura inicial";
    state.timelineStage = 1;
    state.activity = [];
    setFormValues(initialForm);
    renderAll({ silentLog: true });
    addLog("Demo reiniciado.");
  }

  function tickClock() {
    els.caseClock.textContent = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  els.updateBtn.addEventListener("click", () => {
    stopAutoMode();
    setMode("interactive");
    renderAll();
  });

  els.interactiveBtn.addEventListener("click", () => {
    stopAutoMode();
    setMode("interactive");
    addLog("Modo interactivo activado.");
    renderAll({ silentLog: true });
  });

  els.autoBtn.addEventListener("click", () => {
    startAutoMode();
  });

  els.resetBtn.addEventListener("click", () => {
    resetDemo();
  });

  tickClock();
  setInterval(tickClock, 1000);
  resetDemo();
});
