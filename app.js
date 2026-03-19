const $ = (id) => document.getElementById(id);

const state = {
  currentStep: 1,
  interval: null,
  autoRunning: false,
  expediente: "MFH-URG-2026-00127",
  caso: {
    nombre: "María Fernanda López",
    edad: 38,
    sexo: "Femenino",
    seguro: "Sí",
    motivo: "Dolor torácico, opresión en pecho y dificultad respiratoria leve de inicio reciente.",
    severidad: "Media",
    estadoActual: "En admisión",
    cobertura: "Con seguro",
    ruta: "Evaluación en clínica",
    triage: "Medio",
    decision: "Traslado sugerido",
    seguimiento: "Activo",
    diagnostico: "Pendiente",
    siguienteAccion: "Capturar información clínica inicial",
    tipoResolucion: "Por definir",
    tipoTraslado: "Coordinado",
    deduciblePct: "20%",
    rutaFinal: "Hospital",
    tiempoClinica: "32 min",
    casosMes: "148"
  }
};

const stepConfig = {
  1: {
    label: "Admisión",
    status: "En admisión",
    ruta: "Evaluación en clínica",
    triage: "Pendiente",
    decision: "En valoración",
    seguimiento: "Activo",
    severity: "Pendiente"
  },
  2: {
    label: "Triage",
    status: "En triage",
    ruta: "Clasificación clínica",
    triage: "Medio",
    decision: "En valoración",
    seguimiento: "Activo",
    severity: "Media"
  },
  3: {
    label: "Estudios",
    status: "En estudios",
    ruta: "Estudios en proceso",
    triage: "Medio",
    decision: "Pendiente de diagnóstico",
    seguimiento: "Activo",
    severity: "Media"
  },
  4: {
    label: "Diagnóstico",
    status: "Diagnóstico emitido",
    ruta: "Definición clínica",
    triage: "Medio",
    decision: "Traslado sugerido",
    seguimiento: "Activo",
    severity: "Media"
  },
  5: {
    label: "Cobertura",
    status: "Cobertura en revisión",
    ruta: "Validación financiera",
    triage: "Medio",
    decision: "Traslado sugerido",
    seguimiento: "Activo",
    severity: "Media"
  },
  6: {
    label: "Traslado / Alta",
    status: "En traslado",
    ruta: "Traslado a hospital",
    triage: "Medio",
    decision: "Traslado confirmado",
    seguimiento: "Activo",
    severity: "Media"
  },
  7: {
    label: "Cierre",
    status: "En seguimiento",
    ruta: "Caso cerrado",
    triage: "Medio",
    decision: "Caso documentado",
    seguimiento: "Cierre en proceso",
    severity: "Media"
  }
};

function init() {
  bindEvents();
  syncInputsToState();
  applyStepState(false);
  renderAll();
  syncInteractiveControls();
}

function bindEvents() {
  $("btnAutoDemo")?.addEventListener("click", startAutoDemo);
  $("btnPauseDemo")?.addEventListener("click", pauseAutoDemo);
  $("btnResetDemo")?.addEventListener("click", resetDemo);

  $("patientName")?.addEventListener("input", handleInputSync);
  $("patientAge")?.addEventListener("input", handleInputSync);
  $("patientSex")?.addEventListener("change", handleInputSync);
  $("patientInsurance")?.addEventListener("change", handleInputSync);
  $("patientReason")?.addEventListener("input", handleInputSync);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabMap = {
        admision: 1,
        triage: 2,
        diagnostico: 4,
        traslado: 6,
        cierre: 7
      };
      const target = tab.dataset.tab;
      if (tabMap[target]) {
        pauseAutoDemo(false);
        state.currentStep = tabMap[target];
        applyStepState(true);
        renderAll();
        syncInteractiveControls();
        addLog(`Navegación manual a la etapa: ${stepConfig[state.currentStep].label}.`);
      }
    });
  });

  document.querySelectorAll(".step").forEach((stepEl) => {
    stepEl.style.cursor = "pointer";
    stepEl.addEventListener("click", () => {
      pauseAutoDemo(false);
      state.currentStep = Number(stepEl.dataset.step);
      applyStepState(true);
      renderAll();
      syncInteractiveControls();
      addLog(`Se movió manualmente el flujo narrativo a: ${stepConfig[state.currentStep].label}.`);
    });
  });

  $("btnApplyInteractive")?.addEventListener("click", applyInteractiveChanges);

  $("interactiveStep")?.addEventListener("change", (e) => {
    pauseAutoDemo(false);
    state.currentStep = Number(e.target.value);
    applyStepState(true);
    renderAll();
    syncInteractiveControls();
    addLog(`El médico cambió manualmente el flujo a: ${stepConfig[state.currentStep].label}.`);
  });

  $("btnViewRX")?.addEventListener("click", () => {
    addLog("Se abre el estudio RX Tórax AP para revisión clínica.");
    alert("RX Tórax AP\n\nEstado: disponible\nVisible para hospital receptor.");
  });

  $("btnViewLab")?.addEventListener("click", () => {
    addLog("Se consultan los resultados preliminares de laboratorio.");
    alert("Laboratorio inicial\n\nTroponina: preliminar\nBH: disponible\nQuímica básica: disponible");
  });

  $("btnViewDx")?.addEventListener("click", () => {
    addLog("Se abre la nota clínica con diagnóstico preliminar.");
    alert("Diagnóstico preliminar:\n\nRiesgo cardiovascular intermedio.\nSe recomienda continuidad diagnóstica hospitalaria.");
  });
}

function handleInputSync() {
  syncInputsToState();
  renderPatientSummary();
  renderFinance();
  renderKpis();
}

function syncInputsToState() {
  if ($("patientName")) state.caso.nombre = $("patientName").value.trim() || "Paciente sin nombre";
  if ($("patientAge")) state.caso.edad = $("patientAge").value.trim() || "—";
  if ($("patientSex")) state.caso.sexo = $("patientSex").value;
  if ($("patientInsurance")) state.caso.seguro = $("patientInsurance").value;
  if ($("patientReason")) state.caso.motivo = $("patientReason").value.trim() || "Sin motivo de atención";

  state.caso.cobertura = state.caso.seguro === "Sí" ? "Con seguro" : "Sin seguro";
}

function syncInteractiveControls() {
  if ($("interactiveTriage")) $("interactiveTriage").value = normalizeTriageValue(state.caso.triage);
  if ($("interactiveDecision")) $("interactiveDecision").value = normalizeDecisionValue(state.caso.decision);
  if ($("interactiveTransport")) $("interactiveTransport").value = state.caso.tipoTraslado || "Coordinado";
  if ($("interactiveResolution")) $("interactiveResolution").value = normalizeResolutionValue(state.caso.tipoResolucion);
  if ($("interactiveStep")) $("interactiveStep").value = String(state.currentStep);
}

function normalizeTriageValue(value) {
  if (value === "Pendiente") return "Medio";
  return value || "Medio";
}

function normalizeDecisionValue(value) {
  if (
    value !== "Ambulatorio" &&
    value !== "Traslado sugerido" &&
    value !== "Hospital inmediato" &&
    value !== "Traslado confirmado"
  ) {
    return "Traslado sugerido";
  }
  return value;
}

function normalizeResolutionValue(value) {
  if (
    value !== "Por definir" &&
    value !== "Ambulatoria" &&
    value !== "Hospitalaria"
  ) {
    return "Por definir";
  }
  return value;
}

function applyInteractiveChanges() {
  pauseAutoDemo(false);
  syncInputsToState();

  const triage = $("interactiveTriage")?.value || "Medio";
  const decision = $("interactiveDecision")?.value || "Traslado sugerido";
  const transport = $("interactiveTransport")?.value || "Coordinado";
  const resolution = $("interactiveResolution")?.value || "Por definir";
  const step = Number($("interactiveStep")?.value || state.currentStep);

  state.currentStep = step;
  state.caso.triage = triage;
  state.caso.severidad = triage;
  state.caso.decision = decision;
  state.caso.tipoTraslado = transport;
  state.caso.tipoResolucion = resolution;

  if (triage === "Bajo") {
    state.caso.estadoActual = "Paciente estable";
    state.caso.ruta = "Resolución ambulatoria";
    state.caso.diagnostico = "Riesgo bajo";
    state.caso.siguienteAccion = "Alta y seguimiento";
    if (resolution === "Por definir") state.caso.tipoResolucion = "Ambulatoria";
  }

  if (triage === "Medio") {
    state.caso.estadoActual = "En valoración clínica";
    state.caso.ruta = step >= 6 ? "Traslado a hospital" : "Evaluación en clínica";
    state.caso.diagnostico = step >= 4 ? "Riesgo cardiovascular intermedio" : "Pendiente";
    state.caso.siguienteAccion = step >= 6 ? "Enviar al hospital indicado" : "Continuar estudios y valoración";
    if (resolution === "Por definir" && step >= 6) state.caso.tipoResolucion = "Hospitalaria";
  }

  if (triage === "Alto") {
    state.caso.estadoActual = "Urgencia alta";
    state.caso.ruta = "Hospital inmediato";
    state.caso.decision = "Hospital inmediato";
    state.caso.diagnostico = "Riesgo alto";
    state.caso.siguienteAccion = "Traslado urgente";
    state.caso.tipoResolucion = "Hospitalaria";
  }

  if (decision === "Ambulatorio") {
    state.caso.ruta = "Resolución ambulatoria";
    state.caso.siguienteAccion = "Alta con seguimiento";
    state.caso.tipoResolucion = "Ambulatoria";
    state.caso.rutaFinal = "Ambulatorio";
  }

  if (decision === "Traslado sugerido" || decision === "Traslado confirmado") {
    state.caso.ruta = step >= 6 ? "Traslado a hospital" : "Evaluación en clínica";
    state.caso.siguienteAccion = step >= 6 ? "Traslado al hospital indicado" : "Validar traslado y hospital receptor";
    state.caso.tipoResolucion = state.caso.tipoResolucion === "Por definir" ? "Hospitalaria" : state.caso.tipoResolucion;
    state.caso.rutaFinal = "Hospital";
  }

  if (state.caso.seguro === "No") {
    state.caso.cobertura = "Sin seguro";
  } else {
    state.caso.cobertura = "Con seguro";
  }

  applyStepState(false);
  renderAll();
  syncInteractiveControls();

  addLog(
    `Se aplican cambios manuales: triage ${triage}, decisión ${decision}, traslado ${transport}, resolución ${state.caso.tipoResolucion}.`
  );
}

function startAutoDemo() {
  if (state.autoRunning) return;

  state.autoRunning = true;
  addLog("Se inicia el flujo automático del demo.");

  state.interval = setInterval(() => {
    if (state.currentStep < 7) {
      state.currentStep += 1;
    } else {
      clearInterval(state.interval);
      state.interval = null;
      state.autoRunning = false;
      addLog("El flujo automático llegó al cierre del caso.");
      return;
    }

    applyStepState(true);
    renderAll();
    syncInteractiveControls();
  }, 2600);
}

function pauseAutoDemo(shouldLog = true) {
  if (state.interval) {
    clearInterval(state.interval);
    state.interval = null;
  }
  state.autoRunning = false;
  if (shouldLog) {
    addLog("El flujo automático fue pausado.");
  }
}

function resetDemo() {
  if (state.interval) {
    clearInterval(state.interval);
    state.interval = null;
  }

  state.autoRunning = false;
  state.currentStep = 1;
  state.expediente = "MFH-URG-2026-00127";

  state.caso = {
    nombre: "María Fernanda López",
    edad: 38,
    sexo: "Femenino",
    seguro: "Sí",
    motivo: "Dolor torácico, opresión en pecho y dificultad respiratoria leve de inicio reciente.",
    severidad: "Media",
    estadoActual: "En admisión",
    cobertura: "Con seguro",
    ruta: "Evaluación en clínica",
    triage: "Medio",
    decision: "Traslado sugerido",
    seguimiento: "Activo",
    diagnostico: "Pendiente",
    siguienteAccion: "Capturar información clínica inicial",
    tipoResolucion: "Por definir",
    tipoTraslado: "Coordinado",
    deduciblePct: "20%",
    rutaFinal: "Hospital",
    tiempoClinica: "32 min",
    casosMes: "148"
  };

  if ($("patientName")) $("patientName").value = state.caso.nombre;
  if ($("patientAge")) $("patientAge").value = state.caso.edad;
  if ($("patientSex")) $("patientSex").value = state.caso.sexo;
  if ($("patientInsurance")) $("patientInsurance").value = state.caso.seguro;
  if ($("patientReason")) $("patientReason").value = state.caso.motivo;

  resetLog();
  applyStepState(false);
  renderAll();
  syncInteractiveControls();
  addLog(`Se reinicia el demo y se restaura el expediente ${state.expediente}.`);
}

function applyStepState(overrideClinicalState = true) {
  const current = stepConfig[state.currentStep];
  state.caso.estadoActual = current.status;
  state.caso.seguimiento = current.seguimiento;

  if (overrideClinicalState) {
    state.caso.ruta = current.ruta;
    state.caso.triage = current.triage;
    state.caso.decision = current.decision;
    state.caso.severidad = current.severity;
    state.caso.tipoResolucion = state.currentStep >= 6 ? "Hospitalaria" : "Por definir";

    if (state.currentStep === 1) {
      state.caso.siguienteAccion = "Capturar información clínica inicial";
      state.caso.diagnostico = "Pendiente";
    }

    if (state.currentStep === 2) {
      state.caso.siguienteAccion = "Definir prioridad clínica";
      state.caso.diagnostico = "Pendiente de estudios";
      addLog("Se realiza triage y el caso se clasifica con severidad media.");
    }

    if (state.currentStep === 3) {
      state.caso.siguienteAccion = "Generar estudios diagnósticos";
      state.caso.diagnostico = "En evaluación";
      addLog("Se solicitan RX y laboratorio para soporte diagnóstico.");
    }

    if (state.currentStep === 4) {
      state.caso.siguienteAccion = "Validar hospital receptor";
      state.caso.diagnostico = "Riesgo cardiovascular intermedio";
      addLog("Salud Digna emite diagnóstico preliminar con sugerencia de traslado.");
    }

    if (state.currentStep === 5) {
      state.caso.siguienteAccion = state.caso.seguro === "Sí"
        ? "Validar deducible y cobertura"
        : "Activar ruta sin seguro";
      addLog(
        state.caso.seguro === "Sí"
          ? "Se valida cobertura y regla de deducible conforme a la póliza."
          : "El caso se marca como paciente sin seguro para ruta alternativa."
      );
    }

    if (state.currentStep === 6) {
      state.caso.siguienteAccion = "Enviar al hospital indicado";
      state.caso.diagnostico = "Riesgo cardiovascular intermedio";
      state.caso.tipoResolucion = "Hospitalaria";
      state.caso.rutaFinal = "Hospital";
      addLog("Se confirma traslado. El paciente puede acudir por traslado coordinado o por sus propios medios.");
    }

    if (state.currentStep === 7) {
      state.caso.siguienteAccion = "Cerrar expediente y seguimiento";
      state.caso.tiempoClinica = "47 min";
      addLog("Se documenta cierre clínico y estado financiero del caso.");
    }
  }

  state.caso.cobertura = state.caso.seguro === "Sí" ? "Con seguro" : "Sin seguro";
}

function renderAll() {
  renderKpis();
  renderPatientSummary();
  renderDecision();
  renderFinance();
  renderTimeline();
  renderTabs();
  renderMainScreen();
  renderDashboard();
}

function renderKpis() {
  if ($("kpiExpediente")) $("kpiExpediente").textContent = state.expediente;
  if ($("kpiCobertura")) $("kpiCobertura").textContent = state.caso.cobertura;
  if ($("kpiRuta")) $("kpiRuta").textContent = state.caso.ruta;
  if ($("kpiTriage")) $("kpiTriage").textContent = state.caso.triage;
  if ($("kpiDecision")) $("kpiDecision").textContent = state.caso.decision;
  if ($("kpiSeguimiento")) $("kpiSeguimiento").textContent = state.caso.seguimiento;
}

function renderPatientSummary() {
  if ($("patientNameHeader")) $("patientNameHeader").textContent = state.caso.nombre;
  if ($("patientExpBadge")) $("patientExpBadge").textContent = `Expediente: ${state.expediente}`;
  if ($("patientAgeHeader")) $("patientAgeHeader").textContent = `${state.caso.edad} años`;
  if ($("patientSexHeader")) $("patientSexHeader").textContent = state.caso.sexo;
  if ($("patientSeverityHeader")) $("patientSeverityHeader").textContent = state.caso.severidad;
  if ($("patientStatusHeader")) $("patientStatusHeader").textContent = state.caso.estadoActual;
  if ($("chiefComplaintTitle")) $("chiefComplaintTitle").textContent = state.caso.motivo;
  if ($("chiefComplaintText")) {
    $("chiefComplaintText").textContent =
      "El paciente entra por Salud Digna, se evalúa clínicamente y el sistema define si puede resolverse de forma ambulatoria o si debe escalarse a hospital con diagnóstico previo.";
  }
}

function renderDecision() {
  if ($("decisionTitle")) {
    if (state.caso.decision === "Ambulatorio") {
      $("decisionTitle").textContent = "Resolución ambulatoria";
    } else if (state.caso.decision === "Hospital inmediato") {
      $("decisionTitle").textContent = "Hospital inmediato";
    } else if (state.caso.decision === "Traslado confirmado") {
      $("decisionTitle").textContent = "Traslado confirmado con expediente clínico";
    } else if (state.currentStep >= 4) {
      $("decisionTitle").textContent = "Traslado a hospital con diagnóstico previo";
    } else {
      $("decisionTitle").textContent = "Caso en evaluación clínica";
    }
  }

  if ($("decisionDescription")) {
    if (state.caso.decision === "Ambulatorio") {
      $("decisionDescription").textContent =
        "El caso puede resolverse fuera del hospital con seguimiento y aplicación de la regla ambulatoria.";
    } else if (state.caso.decision === "Hospital inmediato") {
      $("decisionDescription").textContent =
        "La condición clínica obliga a escalamiento hospitalario inmediato.";
    } else if (state.caso.decision === "Traslado confirmado") {
      $("decisionDescription").textContent =
        "El expediente ya contiene estudios, diagnóstico preliminar y ruta clínica definida para recepción hospitalaria.";
    } else if (state.currentStep >= 4) {
      $("decisionDescription").textContent =
        "La decisión médica ya sugiere escalamiento, pero aún deben validarse cobertura y logística operativa.";
    } else {
      $("decisionDescription").textContent =
        "Todavía se están integrando elementos clínicos para definir si el caso será ambulatorio o hospitalario.";
    }
  }

  if ($("diagnosticoActual")) $("diagnosticoActual").textContent = state.caso.diagnostico;
  if ($("siguienteAccion")) $("siguienteAccion").textContent = state.caso.siguienteAccion;
  if ($("tipoResolucion")) $("tipoResolucion").textContent = state.caso.tipoResolucion;
}

function renderFinance() {
  const hasInsurance = state.caso.seguro === "Sí";

  if ($("financeCoveragePill")) {
    $("financeCoveragePill").textContent = hasInsurance ? "Cobertura confirmada" : "Paciente sin seguro";
    $("financeCoveragePill").className = hasInsurance ? "status-pill success" : "status-pill warning";
  }

  if ($("financeSeguro")) $("financeSeguro").textContent = hasInsurance ? "Paciente con seguro" : "Paciente sin seguro";
  if ($("financeAmbulatorio")) $("financeAmbulatorio").textContent = "Si es ambulatorio";
  if ($("financeHospitalario")) $("financeHospitalario").textContent = "Si se traslada a hospital";
  if ($("financeSinSeguro")) $("financeSinSeguro").textContent = "Si no tiene seguro";
}

function renderTimeline() {
  if ($("currentStepChip")) {
    $("currentStepChip").textContent = `Paso actual: ${stepConfig[state.currentStep].label}`;
  }

  document.querySelectorAll(".step").forEach((stepEl) => {
    const stepNumber = Number(stepEl.dataset.step);
    stepEl.classList.remove("active", "done");

    if (stepNumber < state.currentStep) stepEl.classList.add("done");
    if (stepNumber === state.currentStep) stepEl.classList.add("active");
  });
}

function renderTabs() {
  const stepToTab = {
    1: "admision",
    2: "triage",
    3: "triage",
    4: "diagnostico",
    5: "diagnostico",
    6: "traslado",
    7: "cierre"
  };

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === stepToTab[state.currentStep]);
  });
}

function renderMainScreen() {
  const mainScreen = $("mainScreen");
  if (!mainScreen) return;

  if (state.currentStep === 1) {
    mainScreen.innerHTML = `
      <div class="screen-header">
        <div>
          <h3 class="screen-title">Admisión del paciente</h3>
          <p class="screen-caption">Captura inicial del caso dentro de Salud Digna.</p>
        </div>
        <div class="chip">Ingreso clínico inicial</div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Nombre del paciente</label>
          <input type="text" value="${escapeHtml(state.caso.nombre)}" disabled />
        </div>
        <div class="field">
          <label>Edad</label>
          <input type="text" value="${escapeHtml(String(state.caso.edad))}" disabled />
        </div>
        <div class="field">
          <label>Sexo</label>
          <input type="text" value="${escapeHtml(state.caso.sexo)}" disabled />
        </div>
        <div class="field">
          <label>¿Cuenta con seguro?</label>
          <input type="text" value="${escapeHtml(state.caso.seguro)}" disabled />
        </div>
        <div class="field" style="grid-column:1 / -1;">
          <label>Motivo de atención</label>
          <textarea disabled>${escapeHtml(state.caso.motivo)}</textarea>
        </div>
      </div>
    `;
  }

  if (state.currentStep === 2) {
    mainScreen.innerHTML = `
      <div class="screen-header">
        <div>
          <h3 class="screen-title">Triage y clasificación clínica</h3>
          <p class="screen-caption">Definición de severidad para orientar la ruta operativa.</p>
        </div>
        <div class="chip">Severidad: ${escapeHtml(state.caso.severidad)}</div>
      </div>

      <div class="triage-row">
        <div class="triage-card triage-low">
          <h4>Bajo</h4>
          <p>Resolución ambulatoria con seguimiento y salida controlada.</p>
        </div>
        <div class="triage-card triage-mid">
          <h4>Medio</h4>
          <p>Requiere estudios y soporte diagnóstico antes de decidir traslado.</p>
        </div>
        <div class="triage-card triage-high">
          <h4>Alto</h4>
          <p>Hospital inmediato por riesgo clínico elevado.</p>
        </div>
      </div>
    `;
  }

  if (state.currentStep === 3) {
    mainScreen.innerHTML = `
      <div class="screen-header">
        <div>
          <h3 class="screen-title">Estudios diagnósticos</h3>
          <p class="screen-caption">Los resultados quedan integrados al expediente clínico.</p>
        </div>
        <div class="chip">Expediente con evidencia</div>
      </div>

      <div class="study-list">
        <div class="study-item">
          <div>
            <div class="study-item-title">RX Tórax AP</div>
            <div class="study-item-meta">Estado: disponible · Visible para hospital receptor</div>
          </div>
          <div class="study-view"><button class="btn btn-secondary" disabled>Disponible</button></div>
        </div>

        <div class="study-item">
          <div>
            <div class="study-item-title">Laboratorio inicial</div>
            <div class="study-item-meta">Troponina, BH y química básica · Estado: preliminar</div>
          </div>
          <div class="study-view"><button class="btn btn-secondary" disabled>Preliminar</button></div>
        </div>
      </div>
    `;
  }

  if (state.currentStep === 4) {
    mainScreen.innerHTML = `
      <div class="screen-header">
        <div>
          <h3 class="screen-title">Diagnóstico preliminar</h3>
          <p class="screen-caption">Salud Digna define la decisión médica inicial.</p>
        </div>
        <div class="chip">Diagnóstico previo listo</div>
      </div>

      <div class="chief-complaint">
        <div class="mini-field-label">Diagnóstico clínico</div>
        <div class="mini-field-value">${escapeHtml(state.caso.diagnostico)}</div>
        <p>
          La evaluación clínica y los estudios sugieren escalamiento hospitalario con expediente ya integrado.
        </p>
      </div>
    `;
  }

  if (state.currentStep === 5) {
    mainScreen.innerHTML = `
      <div class="screen-header">
        <div>
          <h3 class="screen-title">Validación de cobertura</h3>
          <p class="screen-caption">La lógica financiera cambia según seguro y tipo de atención.</p>
        </div>
        <div class="chip">${escapeHtml(state.caso.cobertura)}</div>
      </div>

      <div class="finance-rule">
        <div class="finance-row">
          <strong>${state.caso.seguro === "Sí" ? "Cobertura activa" : "Sin cobertura activa"}</strong>
          <span>
            ${
              state.caso.seguro === "Sí"
                ? "La póliza permite seguimiento de deducible y referencia hospitalaria."
                : "Se activa ruta de pago directo o ruta alternativa."
            }
          </span>
        </div>
        <div class="finance-row">
          <strong>Regla ambulatoria</strong>
          <span>Se paga un porcentaje del deducible conforme a la póliza.</span>
        </div>
        <div class="finance-row">
          <strong>Regla hospitalaria</strong>
          <span>El deducible se liquida en hospital si el caso se traslada.</span>
        </div>
      </div>
    `;
  }

  if (state.currentStep === 6) {
    mainScreen.innerHTML = `
      <div class="screen-header">
        <div>
          <h3 class="screen-title">Traslado del paciente</h3>
          <p class="screen-caption">El sistema muestra que el paciente puede trasladarse al hospital indicado incluso por sus propios medios.</p>
        </div>
        <div class="chip">Traslado: ${escapeHtml(state.caso.tipoTraslado)}</div>
      </div>

      <div class="route-box">
        <div class="route-head">Opciones de traslado</div>
        <div class="route-flow">
          <div class="route-node">
            <div>
              <strong>Traslado coordinado</strong>
              <span>Activación con hospital receptor y expediente compartido.</span>
            </div>
            <div>${state.caso.tipoTraslado === "Coordinado" ? "Seleccionado" : "Disponible"}</div>
          </div>
          <div class="route-node">
            <div>
              <strong>Traslado por sus propios medios</strong>
              <span>Paciente acude al hospital indicado con estudios y diagnóstico visibles en la plataforma.</span>
            </div>
            <div>${state.caso.tipoTraslado === "Propios medios" ? "Seleccionado" : "Disponible"}</div>
          </div>
        </div>
      </div>
    `;
  }

  if (state.currentStep === 7) {
    mainScreen.innerHTML = `
      <div class="screen-header">
        <div>
          <h3 class="screen-title">Cierre y seguimiento</h3>
          <p class="screen-caption">El caso queda documentado para trazabilidad y análisis mensual.</p>
        </div>
        <div class="chip">Expediente cerrado</div>
      </div>

      <div class="metrics-grid">
        <div class="mini-kpi">
          <div class="label">Estado clínico</div>
          <div class="value">Documentado</div>
          <div class="desc">Paciente referido con expediente completo.</div>
        </div>
        <div class="mini-kpi">
          <div class="label">Estado financiero</div>
          <div class="value">${state.caso.seguro === "Sí" ? "Deducible aplicable" : "Pago directo"}</div>
          <div class="desc">Ruta financiera final registrada.</div>
        </div>
      </div>
    `;
  }
}

function renderDashboard() {
  if ($("miniDeducible")) {
    $("miniDeducible").textContent = state.caso.seguro === "Sí" ? state.caso.deduciblePct : "N/A";
  }
  if ($("miniRutaFinal")) $("miniRutaFinal").textContent = state.caso.rutaFinal;
  if ($("miniTiempoClinica")) $("miniTiempoClinica").textContent = state.caso.tiempoClinica;
  if ($("miniCasosMes")) $("miniCasosMes").textContent = state.caso.casosMes;
}

function addLog(message) {
  const container = $("caseLog");
  if (!container) return;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `
    <div class="log-time">${hh}:${mm}</div>
    <div class="log-text">${escapeHtml(message)}</div>
  `;

  container.prepend(item);
}

function resetLog() {
  const container = $("caseLog");
  if (!container) return;

  container.innerHTML = `
    <div class="log-item">
      <div class="log-time">08:14</div>
      <div class="log-text">Se crea expediente MFH-URG-2026-00127 al ingreso del paciente en Salud Digna.</div>
    </div>
    <div class="log-item">
      <div class="log-time">08:18</div>
      <div class="log-text">Se inicia triage y el caso se clasifica inicialmente como severidad media.</div>
    </div>
    <div class="log-item">
      <div class="log-time">08:24</div>
      <div class="log-text">Se solicitan RX y laboratorio para soporte diagnóstico previo a decisión clínica.</div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", init);
