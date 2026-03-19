const currentCase = {
  expediente: "",
  nombre: "",
  edad: "",
  sexo: "",
  sintomas: "",
  seguro: "",
  poliza: "",
  triage: "",
  triageSugerido: "",
  estudios: [],
  uploadedFiles: [],
  notasEstudios: "",
  diagnostico: "",
  comentariosMedicos: "",
  destino: "",
  decisionFinal: "",
  traslado: "",
  tipoAtencion: "",
  deduciblePct: 0,
  cobro: ""
};

const stats = {
  casos: 0,
  ambulatorios: 0,
  hospitalarios: 0,
  deducible: 0
};

document.addEventListener("DOMContentLoaded", () => {
  bindRealtimeInputs();
  bindNavigation();
  bindTriage();
  bindEstudios();
  resetCase(false);
  goToScreen("screen-registro", 1);
});

function bindRealtimeInputs() {
  const mappings = [
    { id: "expediente", key: "expediente" },
    { id: "nombre", key: "nombre" },
    { id: "edad", key: "edad" },
    { id: "sexo", key: "sexo" },
    { id: "sintomas", key: "sintomas" },
    { id: "seguro", key: "seguro" },
    { id: "poliza", key: "poliza" },
    { id: "notas-estudios", key: "notasEstudios" },
    { id: "diagnostico-clinico", key: "diagnostico" },
    { id: "comentarios-medicos", key: "comentariosMedicos" }
  ];

  mappings.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;

    const eventType = el.tagName === "SELECT" ? "change" : "input";

    el.addEventListener(eventType, () => {
      currentCase[key] = el.value.trim();
      updateSummary();
      updateTriageSuggestion();
    });

    if (eventType !== "change") {
      el.addEventListener("change", () => {
        currentCase[key] = el.value.trim();
        updateSummary();
        updateTriageSuggestion();
      });
    }
  });
}

function bindNavigation() {
  byId("go-to-triage-btn")?.addEventListener("click", () => {
    syncRegistroToCase();

    if (!currentCase.nombre || !currentCase.edad || !currentCase.sexo) {
      alert("Captura nombre, edad y sexo antes de continuar.");
      return;
    }

    updateTriageSuggestion();
    goToScreen("screen-triage", 2);
  });

  byId("back-to-registro-btn")?.addEventListener("click", () => {
    goToScreen("screen-registro", 1);
  });

  byId("back-to-triage-btn")?.addEventListener("click", () => {
    goToScreen("screen-triage", 2);
  });

  byId("go-to-diagnostico-btn")?.addEventListener("click", () => {
    syncEstudiosToCase();
    goToScreen("screen-diagnostico", 4);
  });

  byId("back-to-estudios-btn")?.addEventListener("click", () => {
    goToScreen("screen-estudios", 3);
  });

  byId("go-to-decision-btn")?.addEventListener("click", () => {
    syncDiagnosticoToCase();

    if (!currentCase.diagnostico) {
      alert("Escribe el diagnóstico clínico antes de continuar.");
      return;
    }

    applyDecisionFlow();
    goToScreen("screen-decision", 5);
  });

  byId("back-to-diagnostico-btn")?.addEventListener("click", () => {
    goToScreen("screen-diagnostico", 4);
  });

  byId("go-to-liquidacion-btn")?.addEventListener("click", () => {
    buildFinancialView();
    goToScreen("screen-liquidacion", 6);
  });

  byId("back-to-decision-btn")?.addEventListener("click", () => {
    goToScreen("screen-decision", 5);
  });

  byId("finish-case-btn")?.addEventListener("click", () => {
    finalizeCase();
    alert("Caso finalizado.");
  });

  byId("reset-demo-btn")?.addEventListener("click", () => {
    resetCase(true);
  });

  byId("restart-case-btn")?.addEventListener("click", () => {
    resetCase(true);
  });
}

function bindTriage() {
  const triageButtons = document.querySelectorAll(".triage-btn");

  triageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.triage;
      currentCase.triage = selected;

      triageButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      setText("selected-triage-label", capitalize(selected));
      updateSummary();
    });
  });

  byId("confirm-triage-btn")?.addEventListener("click", () => {
    if (!currentCase.triage) {
      alert("Selecciona manualmente el triage antes de continuar.");
      return;
    }

    goToScreen("screen-estudios", 3);
  });
}

function bindEstudios() {
  byId("upload-estudios")?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    currentCase.uploadedFiles = files.map((f) => f.name);
    renderUploadedFiles();
  });

  ["estudio-rx", "estudio-lab", "estudio-usg", "estudio-otro"].forEach((id) => {
    byId(id)?.addEventListener("change", syncEstudiosToCase);
  });
}

function syncRegistroToCase() {
  currentCase.expediente = getValue("expediente");
  currentCase.nombre = getValue("nombre");
  currentCase.edad = getValue("edad");
  currentCase.sexo = getValue("sexo");
  currentCase.sintomas = getValue("sintomas");
  currentCase.seguro = getValue("seguro");
  currentCase.poliza = getValue("poliza");
  updateSummary();
}

function syncEstudiosToCase() {
  const estudios = [];
  if (isChecked("estudio-rx")) estudios.push("Rayos X");
  if (isChecked("estudio-lab")) estudios.push("Laboratorio");
  if (isChecked("estudio-usg")) estudios.push("Ultrasonido");
  if (isChecked("estudio-otro")) estudios.push("Otro estudio");

  currentCase.estudios = estudios;
  currentCase.notasEstudios = getValue("notas-estudios");
  updateSummary();
  renderUploadedFiles();
}

function syncDiagnosticoToCase() {
  currentCase.diagnostico = getValue("diagnostico-clinico");
  currentCase.comentariosMedicos = getValue("comentarios-medicos");
  updateSummary();
}

function updateTriageSuggestion() {
  const sintomas = (currentCase.sintomas || "").toLowerCase();
  let sugerido = "Bajo";

  const highKeywords = [
    "dolor toracico",
    "dolor en pecho",
    "hemorragia",
    "inconsciente",
    "fractura expuesta",
    "convulsiones",
    "disnea severa"
  ];

  const mediumKeywords = [
    "fiebre",
    "dolor abdominal",
    "mareo",
    "vomito",
    "fractura",
    "lesion",
    "disnea"
  ];

  if (highKeywords.some((k) => sintomas.includes(k))) {
    sugerido = "Alto";
  } else if (mediumKeywords.some((k) => sintomas.includes(k))) {
    sugerido = "Medio";
  }

  currentCase.triageSugerido = sugerido;
  setText("triage-sugerido-badge", `Sugerido por sistema: ${sugerido}`);
}

function applyDecisionFlow() {
  const triage = (currentCase.triage || "").toLowerCase();
  const hasSeguro = currentCase.seguro === "Sí";

  if (triage === "bajo") {
    currentCase.destino = "Atención ambulatoria en Salud Digna";
    currentCase.decisionFinal = "Resolución local con indicaciones y seguimiento";
    currentCase.traslado = "No requiere traslado";
    currentCase.tipoAtencion = "Ambulatorio";
    currentCase.deduciblePct = hasSeguro ? 15 : 100;
    currentCase.cobro = hasSeguro
      ? "Se paga un porcentaje del deducible"
      : "Pago directo del servicio";
  } else if (triage === "medio") {
    currentCase.destino = "Evaluación con estudios y posible referencia";
    currentCase.decisionFinal = "Se revisan estudios y diagnóstico antes de definir traslado";
    currentCase.traslado = "Puede trasladarse por sus propios medios o coordinar traslado";
    currentCase.tipoAtencion = "Ambulatorio / Referencia";
    currentCase.deduciblePct = hasSeguro ? 25 : 100;
    currentCase.cobro = hasSeguro
      ? "Se aplica porcentaje del deducible si se resuelve ambulatoriamente"
      : "Pago directo; si escala, se define en hospital";
  } else if (triage === "alto") {
    currentCase.destino = "Hospital inmediato";
    currentCase.decisionFinal = "Traslado hospitalario inmediato por nivel de riesgo";
    currentCase.traslado = "Traslado al hospital indicado con estudios y diagnóstico";
    currentCase.tipoAtencion = "Hospitalario";
    currentCase.deduciblePct = 100;
    currentCase.cobro = hasSeguro
      ? "El deducible se paga en el hospital"
      : "Pago hospitalario directo";
  }

  renderDecision();
  updateSummary();
}

function renderDecision() {
  setText("decision-triage", capitalize(currentCase.triage) || "—");
  setText("decision-destino", currentCase.destino || "—");
  setText("decision-final", currentCase.decisionFinal || "—");
  setText("decision-traslado", currentCase.traslado || "—");
}

function buildFinancialView() {
  setText("liquidacion-seguro", currentCase.seguro || "—");
  setText("liquidacion-tipo", currentCase.tipoAtencion || "—");
  setText("liquidacion-deducible", `${currentCase.deduciblePct || 0}%`);
  setText("liquidacion-cobro", currentCase.cobro || "—");
  stats.deducible = currentCase.deduciblePct || 0;
  renderKpis();
}

function finalizeCase() {
  stats.casos += 1;

  if ((currentCase.tipoAtencion || "").toLowerCase().includes("hospital")) {
    stats.hospitalarios += 1;
  } else {
    stats.ambulatorios += 1;
  }

  renderKpis();
}

function renderKpis() {
  setText("kpi-casos", String(stats.casos));
  setText("kpi-ambulatorios", String(stats.ambulatorios));
  setText("kpi-hospitalarios", String(stats.hospitalarios));
  setText("kpi-deducible", `${stats.deducible || 0}%`);
}

function updateSummary() {
  setText("summary-expediente", currentCase.expediente || "—");
  setText("summary-nombre", currentCase.nombre || "—");
  setText("summary-edad", currentCase.edad || "—");
  setText("summary-sexo", currentCase.sexo || "—");
  setText("summary-sintomas", currentCase.sintomas || "—");
  setText("summary-triage", currentCase.triage ? capitalize(currentCase.triage) : "—");
  setText("summary-diagnostico", currentCase.diagnostico || "—");
  setText("summary-seguro", currentCase.seguro || "—");
  setText("summary-destino", currentCase.destino || "—");
}

function renderUploadedFiles() {
  const estudios = currentCase.estudios.length
    ? currentCase.estudios.join(", ")
    : "ninguno";

  const files = currentCase.uploadedFiles.length
    ? currentCase.uploadedFiles.join(", ")
    : "ninguno";

  setText("uploaded-files-list", `Estudios seleccionados: ${estudios}. Archivos cargados: ${files}.`);
}

function resetCase(goHome = true) {
  currentCase.expediente = "";
  currentCase.nombre = "";
  currentCase.edad = "";
  currentCase.sexo = "";
  currentCase.sintomas = "";
  currentCase.seguro = "";
  currentCase.poliza = "";
  currentCase.triage = "";
  currentCase.triageSugerido = "";
  currentCase.estudios = [];
  currentCase.uploadedFiles = [];
  currentCase.notasEstudios = "";
  currentCase.diagnostico = "";
  currentCase.comentariosMedicos = "";
  currentCase.destino = "";
  currentCase.decisionFinal = "";
  currentCase.traslado = "";
  currentCase.tipoAtencion = "";
  currentCase.deduciblePct = 0;
  currentCase.cobro = "";

  clearForm();
  clearTriageUI();
  renderDecision();
  buildFinancialView();
  updateSummary();
  renderUploadedFiles();

  if (goHome) {
    goToScreen("screen-registro", 1);
  }
}

function clearForm() {
  [
    "expediente",
    "nombre",
    "edad",
    "sexo",
    "sintomas",
    "seguro",
    "poliza",
    "notas-estudios",
    "diagnostico-clinico",
    "comentarios-medicos"
  ].forEach((id) => {
    const el = byId(id);
    if (!el) return;
    if (el.tagName === "SELECT") {
      el.selectedIndex = 0;
    } else {
      el.value = "";
    }
  });

  ["estudio-rx", "estudio-lab", "estudio-usg", "estudio-otro"].forEach((id) => {
    const el = byId(id);
    if (el) el.checked = false;
  });

  const upload = byId("upload-estudios");
  if (upload) upload.value = "";
}

function clearTriageUI() {
  document.querySelectorAll(".triage-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  setText("selected-triage-label", "Ninguno");
  setText("triage-sugerido-badge", "Sugerido por sistema: —");
}

function goToScreen(screenId, stepNumber) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  byId(screenId)?.classList.add("active");

  document.querySelectorAll(".timeline-step").forEach((step) => {
    step.classList.remove("active");
  });

  byId(`step-${stepNumber}`)?.classList.add("active");
}

function byId(id) {
  return document.getElementById(id);
}

function getValue(id) {
  return byId(id)?.value.trim() || "";
}

function isChecked(id) {
  return !!byId(id)?.checked;
}

function setText(id, value) {
  const el = byId(id);
  if (el) el.textContent = value;
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
