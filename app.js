const steps = [
  {
    title: "1. Recepción y apertura de expediente",
    subtitle: "El paciente ingresa por Salud Digna y se registra para evaluación inicial.",
    text: "Salud Digna recibe al paciente, genera expediente y concentra la información clínica inicial para tomar la decisión adecuada."
  },
  {
    title: "2. Triage y clasificación",
    subtitle: "El personal clínico asigna nivel de prioridad: bajo, medio o alto.",
    text: "En esta etapa se determina la gravedad inicial del caso para orientar la ruta de atención."
  },
  {
    title: "3. Estudios y valoración médica",
    subtitle: "Se revisan los estudios disponibles y el diagnóstico clínico preliminar.",
    text: "Con base en la evidencia diagnóstica, se decide si el caso puede resolverse en forma ambulatoria o requiere hospital."
  },
  {
    title: "4. Decisión clínica",
    subtitle: "Se define la ruta de atención del paciente.",
    text: "La decisión depende del nivel de triage, del motivo de consulta y de los hallazgos clínicos."
  },
  {
    title: "5. Cierre del caso",
    subtitle: "Se documenta la salida del paciente y el expediente queda trazable.",
    text: "El caso se cierra con ruta final registrada para análisis operativo posterior."
  }
];

let currentStep = 0;
let autoTimer = null;

const expediente = document.getElementById("expediente");
const nombre = document.getElementById("nombre");
const edad = document.getElementById("edad");
const sexo = document.getElementById("sexo");
const motivo = document.getElementById("motivo");
const estudios = document.getElementById("estudios");
const diagnostico = document.getElementById("diagnostico");
const modo = document.getElementById("modo");

const btnActualizar = document.getElementById("btnActualizar");
const btnSiguiente = document.getElementById("btnSiguiente");
const btnAuto = document.getElementById("btnAuto");
const btnReset = document.getElementById("btnReset");

const viewNombre = document.getElementById("viewNombre");
const viewEdad = document.getElementById("viewEdad");
const viewSexo = document.getElementById("viewSexo");
const viewMotivo = document.getElementById("viewMotivo");
const viewEstudios = document.getElementById("viewEstudios");
const viewDiagnostico = document.getElementById("viewDiagnostico");
const viewTriage = document.getElementById("viewTriage");

const stepTitle = document.getElementById("stepTitle");
const stepSubtitle = document.getElementById("stepSubtitle");
const decisionBox = document.getElementById("decisionBox");
const narrative = document.getElementById("narrative");
const timeline = document.getElementById("timeline");

const kpiExp = document.getElementById("kpiExp");
const kpiTriage = document.getElementById("kpiTriage");
const kpiRuta = document.getElementById("kpiRuta");
const kpiStatus = document.getElementById("kpiStatus");

function getTriage() {
  const selected = document.querySelector('input[name="triage"]:checked');
  return selected ? selected.value : "Medio";
}

function getCaseData() {
  return {
    expediente: expediente.value.trim() || "SD-URG-2026-001",
    nombre: nombre.value.trim() || "Paciente sin nombre",
    edad: edad.value.trim() || "0",
    sexo: sexo.value,
    motivo: motivo.value.trim() || "Sin motivo registrado",
    estudios: estudios.value.trim() || "Sin estudios",
    diagnostico: diagnostico.value.trim() || "Sin diagnóstico",
    triage: getTriage()
  };
}

function getDecision(triageValue) {
  if (triageValue === "Alto") {
    return {
      css: "high",
      text: "Decisión actual: Caso grave. Ruta sugerida: traslado hospitalario inmediato.",
      ruta: "Hospital"
    };
  }

  if (triageValue === "Medio") {
    return {
      css: "mid",
      text: "Decisión actual: Caso de prioridad media. Requiere evaluación clínica y definición ambulatoria vs hospital.",
      ruta: "En evaluación"
    };
  }

  return {
    css: "low",
    text: "Decisión actual: Caso de baja prioridad. Ruta sugerida: manejo ambulatorio en Salud Digna.",
    ruta: "Ambulatorio"
  };
}

function renderTimeline() {
  timeline.innerHTML = "";

  steps.forEach((step, index) => {
    const item = document.createElement("div");
    item.className = "timeline-item";

    if (index < currentStep) item.classList.add("done");
    if (index === currentStep) item.classList.add("active");

    item.innerHTML = `
      <div class="timeline-step">Paso ${index + 1}</div>
      <div class="timeline-name">${step.title.replace(/^\d+\.\s*/, "")}</div>
    `;

    timeline.appendChild(item);
  });
}

function render() {
  const data = getCaseData();
  const step = steps[currentStep];
  const decision = getDecision(data.triage);

  viewNombre.textContent = data.nombre;
  viewEdad.textContent = data.edad;
  viewSexo.textContent = data.sexo;
  viewMotivo.textContent = data.motivo;
  viewEstudios.textContent = data.estudios;
  viewDiagnostico.textContent = data.diagnostico;
  viewTriage.textContent = data.triage;

  stepTitle.textContent = step.title;
  stepSubtitle.textContent = step.subtitle;

  let narrativeText = step.text;

  if (currentStep === 1) {
    narrativeText = `Se asigna triage ${data.triage}. Esto modifica la prioridad del caso y el resto del flujo clínico.`;
  }

  if (currentStep === 2) {
    narrativeText = `Se consideran los estudios (${data.estudios}) y el diagnóstico (${data.diagnostico}) para valorar la resolución del caso.`;
  }

  if (currentStep === 3) {
    if (data.triage === "Alto") {
      narrativeText = "El caso se clasifica como grave y la ruta recomendada es hospitalaria inmediata.";
    } else if (data.triage === "Medio") {
      narrativeText = "El caso permanece en evaluación médica para definir si continúa ambulatorio o se escala a hospital.";
    } else {
      narrativeText = "El caso puede resolverse de forma ambulatoria dentro del modelo operativo.";
    }
  }

  if (currentStep === 4) {
    if (data.triage === "Alto") {
      narrativeText = "El expediente se cierra con ruta hospitalaria documentada para seguimiento operativo.";
    } else if (data.triage === "Medio") {
      narrativeText = "El expediente se cierra como caso evaluado con definición clínica documentada.";
    } else {
      narrativeText = "El expediente se cierra como atención ambulatoria resuelta.";
    }
  }

  narrative.textContent = narrativeText;

  decisionBox.className = `decision ${decision.css}`;
  decisionBox.textContent = decision.text;

  kpiExp.textContent = data.expediente.split("-").pop() || data.expediente;
  kpiTriage.textContent = data.triage;
  kpiRuta.textContent = currentStep >= 3 ? decision.ruta : "En evaluación";
  kpiStatus.textContent = currentStep === steps.length - 1 ? "Cerrado" : "Activo";

  renderTimeline();
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    render();
  } else {
    stopAuto();
  }
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      stopAuto();
    }
  }, 1800);
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function resetDemo() {
  stopAuto();

  expediente.value = "SD-URG-2026-001";
  nombre.value = "María González";
  edad.value = "42";
  sexo.value = "Femenino";
  motivo.value = "Dolor abdominal agudo";
  estudios.value = "Laboratorio + Ultrasonido";
  diagnostico.value = "Apendicitis probable";
  document.querySelector('input[name="triage"][value="Medio"]').checked = true;
  modo.value = "interactivo";

  currentStep = 0;
  render();
}

btnActualizar.addEventListener("click", () => {
  stopAuto();
  render();
});

btnSiguiente.addEventListener("click", () => {
  stopAuto();
  nextStep();
});

btnAuto.addEventListener("click", () => {
  startAuto();
});

btnReset.addEventListener("click", () => {
  resetDemo();
});

[nombre, edad, sexo, motivo, estudios, diagnostico, expediente].forEach((el) => {
  el.addEventListener("input", () => {
    if (modo.value === "interactivo") {
      render();
    }
  });
});

document.querySelectorAll('input[name="triage"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    if (modo.value === "interactivo") {
      render();
    }
  });
});

modo.addEventListener("change", () => {
  stopAuto();
  render();
});

render();
