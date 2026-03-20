const screens = Array.from(document.querySelectorAll(".screen"));
const timelineSteps = Array.from(document.querySelectorAll(".timeline-step"));

const state = {
  currentScreen: 0,
  mode: "interactive",
  autoTimer: null,
  triage: "",
  ruta: "",
  filtroRiesgo: false,
  folio: "",
  paciente: {
    nombre: "María López",
    edad: "29",
    sexo: "F",
    sintoma: "Dificultad leve para respirar",
    categoria: "respiratorio",
    horaIngreso: "10:42"
  },
  seguro: {
    tieneSeguro: "si",
    aseguradora: "Aseguradora Demo",
    poliza: "POL-4589201",
    canalPago: "banco_azteca"
  }
};

const defaultPaciente = { ...state.paciente };
const defaultSeguro = { ...state.seguro };

function getEl(id) {
  return document.getElementById(id);
}

function safeUpperInitials(name) {
  const clean = (name || "").trim();
  if (!clean) return "NA";
  return clean
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function sexoTexto(value) {
  return value === "M" ? "Masculino" : "Femenino";
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function generateFolio() {
  const now = new Date();
  const year = now.getFullYear();
  const serial = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  return `SD-MFH-${year}-${serial}`;
}

function setText(id, value) {
  const el = getEl(id);
  if (el) el.textContent = value;
}

function renderCaseClosure() {
  const ruta = (state.ruta || "").toLowerCase();
  const tieneSeguro = (state.seguro.tieneSeguro || "").toLowerCase() === "si";
  const folio = state.folio || "Pendiente";
  const nombre = state.paciente.nombre || "Paciente";
  const triage = state.triage || "no definido";

  setText("closeFolio", folio);
  setText("closeRuta", ruta === "hospital" ? "Hospital" : ruta === "ambulatorio" ? "Ambulatorio" : "Pendiente");
  setText("closeSeguro", tieneSeguro ? "Con seguro" : "Sin seguro");
  setText("closeEstado", "Caso cerrado");

  let clinicalTitle = "Caso en evaluación";
  let clinicalText = `${nombre} se encuentra en proceso de clasificación clínica.`;
  let operationalTitle = "Ruta operativa pendiente";
  let operationalText = "Aún no se define la ruta final del caso.";
  let financialTitle = "Resolución financiera pendiente";
  let financialText = "La definición financiera depende de la ruta clínica y del estatus de seguro.";
  let patientValue = "El paciente cuenta con una ruta clínica ordenada desde el primer punto de contacto.";
  let systemValue = "Salud Digna actúa como puerta de entrada y organiza el expediente del caso.";
  let payerValue = "La validación financiera depende del tipo de cobertura y del destino clínico.";
  let executiveLine = "El modelo integra clasificación clínica, referencia y trazabilidad financiera desde el primer contacto.";

  if (ruta === "hospital" && tieneSeguro) {
    clinicalTitle = "Referencia hospitalaria procedente";
    clinicalText = `El caso de ${nombre} fue clasificado para escalamiento hospitalario tras triage ${triage} y validación clínica inicial.`;

    operationalTitle = "Paciente enviado con expediente completo";
    operationalText = "El hospital recibe folio, estudios y diagnóstico preliminar desde Salud Digna, reduciendo fricción en admisión.";

    financialTitle = "Liquidación hospitalaria conforme a póliza";
    financialText = "El deducible y el coaseguro se cubren en hospital según la póliza. Salud Digna recibe un fee fijo de $800 por referencia válida pagado por la aseguradora.";

    patientValue = "Llega al hospital con mejor información clínica, menor incertidumbre y una referencia más rápida.";
    systemValue = "El hospital recibe un paciente filtrado y documentado; Salud Digna monetiza la referencia válida sin participar del deducible.";
    payerValue = `La aseguradora valida cobertura con ${state.seguro.aseguradora} y paga solo una referencia clínicamente justificada.`;
    executiveLine = "El modelo convierte una llegada desordenada a urgencias en una referencia validada, trazable y financieramente clara.";
  } else if (ruta === "ambulatorio" && tieneSeguro) {
    clinicalTitle = "Caso resuelto en ruta ambulatoria";
    clinicalText = `El caso de ${nombre} no requirió hospitalización y pudo resolverse con atención ambulatoria posterior al triage ${triage}.`;

    operationalTitle = "Se evita traslado hospitalario innecesario";
    operationalText = "La capacidad hospitalaria se reserva para casos de mayor complejidad y el paciente recibe atención temprana.";

    financialTitle = "Costo contenido desde el primer contacto";
    financialText = "Se liquida el porcentaje correspondiente del deducible en Salud Digna conforme al modelo definido. No se genera fee hospitalario de referencia.";

    patientValue = "Recibe atención resolutiva sin entrar a un circuito hospitalario de mayor costo y complejidad.";
    systemValue = "Salud Digna absorbe una demanda que de otro modo presionaría urgencias hospitalarias.";
    payerValue = `La aseguradora ${state.seguro.aseguradora} evita un evento hospitalario más costoso y mejora eficiencia del gasto.`;
    executiveLine = "El valor no solo está en referir bien, sino en evitar hospitalizaciones innecesarias.";
  } else if (ruta === "hospital" && !tieneSeguro) {
    clinicalTitle = "Referencia hospitalaria necesaria";
    clinicalText = `El caso de ${nombre} requiere continuidad hospitalaria posterior al filtro clínico y al diagnóstico previo realizado en Salud Digna.`;

    operationalTitle = "Ingreso hospitalario mejor documentado";
    operationalText = "El paciente llega con folio, estudios y diagnóstico preliminar, facilitando la continuidad clínica.";

    financialTitle = "Pago hospitalario fuera de Salud Digna";
    financialText = "La resolución económica ocurre mediante pago directo o alternativa financiera disponible. No aplica fee de aseguradora.";

    patientValue = "Aun sin seguro, llega al hospital con mejor información clínica y una ruta operativa más clara.";
    systemValue = "El hospital recibe un caso mejor documentado y Salud Digna cumple la función de filtro y punto de referencia.";
    payerValue = "No existe cobertura aseguradora activa para este caso.";
    executiveLine = "Aun sin seguro, el modelo ordena la entrada al sistema y mejora la calidad de la referencia clínica.";
  } else if (ruta === "ambulatorio" && !tieneSeguro) {
    clinicalTitle = "Caso contenido en atención ambulatoria";
    clinicalText = `El caso de ${nombre} pudo resolverse sin hospitalización, con intervención inicial, estudios y seguimiento indicado.`;

    operationalTitle = "Se evita escalamiento innecesario";
    operationalText = "Se reduce presión hospitalaria y el paciente recibe una solución de menor complejidad.";

    financialTitle = "Pago ambulatorio con alternativa definida";
    financialText = "La atención se liquida en Salud Digna o mediante el mecanismo financiero disponible para población sin seguro.";

    patientValue = "Obtiene acceso temprano a atención resolutiva con menor costo total del episodio.";
    systemValue = "Se contiene demanda clínica antes de que se convierta en saturación hospitalaria.";
    payerValue = "No existe aseguradora en este caso; el valor económico está en la contención del costo total.";
    executiveLine = "La puerta de entrada correcta reduce costo, mejora acceso y evita hospitalización evitable.";
  }

  setText("closeClinicalTitle", clinicalTitle);
  setText("closeClinicalText", clinicalText);
  setText("closeOperationalTitle", operationalTitle);
  setText("closeOperationalText", operationalText);
  setText("closeFinancialTitle", financialTitle);
  setText("closeFinancialText", financialText);
  setText("closePatientValue", patientValue);
  setText("closeSystemValue", systemValue);
  setText("closePayerValue", payerValue);
  setText("closeExecutiveLine", executiveLine);
}

function showScreen(index) {
  if (index < 0 || index >= screens.length) return;

  screens.forEach((screen, i) => {
    screen.classList.toggle("active", i === index);
  });

  timelineSteps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
    step.classList.toggle("done", i < index);
  });

  state.currentScreen = index;
  updateSidebar();
  updateDerivedUI();
}

function updateSidebar() {
  const nombre = state.paciente.nombre || "Sin nombre";
  const edad = state.paciente.edad || "-";
  const sexo = sexoTexto(state.paciente.sexo);

  const resumenNombre = getEl("resumenNombre");
  const resumenDemograficos = getEl("resumenDemograficos");
  const resumenIniciales = getEl("resumenIniciales");
  const resumenExpediente = getEl("resumenExpediente");

  if (resumenNombre) resumenNombre.textContent = nombre;
  if (resumenDemograficos) resumenDemograficos.textContent = `${edad} años · ${sexo}`;
  if (resumenIniciales) resumenIniciales.textContent = safeUpperInitials(nombre);
  if (resumenExpediente) {
    resumenExpediente.textContent = state.folio
      ? `Expediente ${state.folio}`
      : "Expediente PROV-001";
  }

  const kpiPaciente = getEl("kpiPaciente");
  const kpiTriage = getEl("kpiTriage");
  const kpiRuta = getEl("kpiRuta");
  const kpiSeguro = getEl("kpiSeguro");

  if (kpiPaciente) kpiPaciente.textContent = nombre;
  if (kpiTriage) kpiTriage.textContent = state.triage ? capitalize(state.triage) : "Pendiente";
  if (kpiRuta) {
    kpiRuta.textContent =
      state.ruta === "hospital"
        ? "Hospital"
        : state.ruta === "ambulatorio"
        ? "Ambulatorio"
        : "Pendiente";
  }
  if (kpiSeguro) {
    kpiSeguro.textContent = state.seguro.tieneSeguro === "si" ? "Validable" : "Sin seguro";
  }
}

function updatePacienteFromInputs() {
  const nombre = getEl("pacienteNombre");
  const edad = getEl("pacienteEdad");
  const sexo = getEl("pacienteSexo");
  const sintoma = getEl("pacienteSintoma");
  const categoria = getEl("categoriaRapida");
  const horaIngreso = getEl("horaIngreso");

  if (nombre) state.paciente.nombre = nombre.value.trim() || defaultPaciente.nombre;
  if (edad) state.paciente.edad = edad.value.trim() || defaultPaciente.edad;
  if (sexo) state.paciente.sexo = sexo.value;
  if (sintoma) state.paciente.sintoma = sintoma.value.trim() || defaultPaciente.sintoma;
  if (categoria) state.paciente.categoria = categoria.value;
  if (horaIngreso) state.paciente.horaIngreso = horaIngreso.value.trim() || defaultPaciente.horaIngreso;
}

function updateSeguroFromInputs() {
  const tieneSeguro = getEl("tieneSeguro");
  const aseguradora = getEl("aseguradora");
  const numeroPoliza = getEl("numeroPoliza");
  const pagoPoliza = getEl("pagoPoliza");

  if (tieneSeguro) state.seguro.tieneSeguro = tieneSeguro.value;
  if (aseguradora) state.seguro.aseguradora = aseguradora.value.trim() || defaultSeguro.aseguradora;
  if (numeroPoliza) state.seguro.poliza = numeroPoliza.value.trim() || defaultSeguro.poliza;
  if (pagoPoliza) state.seguro.canalPago = pagoPoliza.value;
}

function syncInputsFromState() {
  const map = [
    ["pacienteNombre", state.paciente.nombre],
    ["pacienteEdad", state.paciente.edad],
    ["pacienteSexo", state.paciente.sexo],
    ["pacienteSintoma", state.paciente.sintoma],
    ["categoriaRapida", state.paciente.categoria],
    ["horaIngreso", state.paciente.horaIngreso],
    ["tieneSeguro", state.seguro.tieneSeguro],
    ["aseguradora", state.seguro.aseguradora],
    ["numeroPoliza", state.seguro.poliza],
    ["pagoPoliza", state.seguro.canalPago]
  ];

  map.forEach(([id, value]) => {
    const el = getEl(id);
    if (el) el.value = value;
  });
}

function updateDerivedUI() {
  const triageBadge = getEl("triageSeleccionActual");
  if (triageBadge) {
    triageBadge.textContent = state.triage
      ? `Triage ${capitalize(state.triage)}`
      : "Nivel no definido";
  }

  const resultadoFiltro = getEl("resultadoFiltro");
  if (resultadoFiltro) {
    if (state.filtroRiesgo) {
      resultadoFiltro.textContent =
        "Se detectaron criterios de riesgo. El caso debe considerarse de referencia hospitalaria prioritaria.";
    } else {
      resultadoFiltro.textContent =
        "No se detectan criterios mayores de exclusión. El caso puede continuar en evaluación diagnóstica en Salud Digna.";
    }
  }

  const folioGenerado = getEl("folioGenerado");
  if (folioGenerado) {
    folioGenerado.textContent = state.folio || "SD-MFH-2026-0001";
  }

  const estadoTriageValido = getEl("estadoTriageValido");
  if (estadoTriageValido) {
    estadoTriageValido.textContent = state.triage ? "Triage válido" : "Triage pendiente";
  }

  const routeCards = Array.from(document.querySelectorAll(".route-card"));
  routeCards.forEach(card => {
    card.classList.toggle("selected", card.dataset.ruta === state.ruta);
  });

  const triageCards = Array.from(document.querySelectorAll(".triage-card"));
  triageCards.forEach(card => {
    card.classList.toggle("selected", card.dataset.triage === state.triage);
  });

  const resultadoDecision = getEl("resultadoDecision");
  if (resultadoDecision) {
    if (state.ruta === "hospital") {
      resultadoDecision.textContent =
        "Decisión clínica: referencia hospitalaria. El paciente requiere continuidad de atención en hospital.";
    } else if (state.ruta === "ambulatorio") {
      resultadoDecision.textContent =
        "Decisión clínica: resolución ambulatoria. El paciente puede continuar manejo fuera del hospital.";
    } else {
      resultadoDecision.textContent = "Ruta clínica pendiente.";
    }
  }

  const hospitalAsignado = getEl("hospitalAsignado");
  if (hospitalAsignado) {
    hospitalAsignado.textContent =
      state.ruta === "hospital"
        ? "Hospital de Red Preferente"
        : "No requiere hospital";
  }

  const modoTraslado = getEl("modoTraslado");
  if (modoTraslado) {
    if (state.ruta === "hospital") {
      modoTraslado.textContent = state.filtroRiesgo
        ? "Ambulancia / traslado prioritario"
        : "Propios medios o ambulancia";
    } else {
      modoTraslado.textContent = "No aplica";
    }
  }

  renderCaseClosure();
}

function stopAutoFlow() {
  if (state.autoTimer) {
    clearInterval(state.autoTimer);
    state.autoTimer = null;
  }
}

function startAutoFlow() {
  stopAutoFlow();
  state.mode = "auto";

  updatePacienteFromInputs();
  updateSeguroFromInputs();

  if (!state.triage) state.triage = "medio";
  if (!state.folio) state.folio = generateFolio();
  if (!state.ruta) {
    state.ruta = state.filtroRiesgo || state.triage === "alto" ? "hospital" : "ambulatorio";
  }

  let step = state.currentScreen;

  state.autoTimer = setInterval(() => {
    if (step >= screens.length - 1) {
      stopAutoFlow();
      return;
    }
    step += 1;
    showScreen(step);
  }, 1400);
}

function resetIngreso() {
  state.paciente = { ...defaultPaciente };
  syncInputsFromState();
  updateSidebar();
  updateDerivedUI();
}

function resetDemo() {
  stopAutoFlow();

  state.currentScreen = 0;
  state.mode = "interactive";
  state.triage = "";
  state.ruta = "";
  state.filtroRiesgo = false;
  state.folio = "";
  state.paciente = { ...defaultPaciente };
  state.seguro = { ...defaultSeguro };

  const checks = [
    "chkViaAerea",
    "chkDolorToracico",
    "chkShock",
    "chkNeurologico",
    "estudioRx",
    "estudioLab",
    "estudioElectro",
    "estudioUltrasonido"
  ];

  checks.forEach(id => {
    const el = getEl(id);
    if (!el) return;

    if (id === "estudioRx" || id === "estudioLab") {
      el.checked = true;
    } else {
      el.checked = false;
    }
  });

  const diagnosticoClinico = getEl("diagnosticoClinico");
  const notaEstudios = getEl("notaEstudios");

  if (diagnosticoClinico) {
    diagnosticoClinico.value =
      "Probable infección respiratoria sin datos de insuficiencia aguda.";
  }

  if (notaEstudios) {
    notaEstudios.value =
      "Los estudios quedan cargados en plataforma y visibles para el hospital receptor.";
  }

  syncInputsFromState();
  updateSidebar();
  updateDerivedUI();
  showScreen(0);

  timelineSteps.forEach((step, i) => {
    step.classList.toggle("active", i === 0);
    step.classList.remove("done");
  });

  window.scrollTo(0, 0);
}

function forceResetDemo() {
  resetDemo();
}

window.forceResetDemo = forceResetDemo;

function evaluateFiltro() {
  const flags = [
    getEl("chkViaAerea")?.checked,
    getEl("chkDolorToracico")?.checked,
    getEl("chkShock")?.checked,
    getEl("chkNeurologico")?.checked
  ];

  state.filtroRiesgo = flags.some(Boolean);

  if (state.filtroRiesgo) {
    state.ruta = "hospital";
  }
}

function attachEvents() {
  const ingresoInputs = [
    "pacienteNombre",
    "pacienteEdad",
    "pacienteSexo",
    "pacienteSintoma",
    "categoriaRapida",
    "horaIngreso"
  ];

  ingresoInputs.forEach(id => {
    const el = getEl(id);
    if (!el) return;

    el.addEventListener("input", () => {
      updatePacienteFromInputs();
      updateSidebar();
      updateDerivedUI();
    });

    el.addEventListener("change", () => {
      updatePacienteFromInputs();
      updateSidebar();
      updateDerivedUI();
    });
  });

  const seguroInputs = [
    "tieneSeguro",
    "aseguradora",
    "numeroPoliza",
    "pagoPoliza"
  ];

  seguroInputs.forEach(id => {
    const el = getEl(id);
    if (!el) return;

    el.addEventListener("input", () => {
      updateSeguroFromInputs();
      updateSidebar();
      updateDerivedUI();
    });

    el.addEventListener("change", () => {
      updateSeguroFromInputs();
      updateSidebar();
      updateDerivedUI();
    });
  });

  const triageCards = Array.from(document.querySelectorAll(".triage-card"));
  triageCards.forEach(card => {
    card.addEventListener("click", () => {
      stopAutoFlow();
      state.mode = "interactive";
      state.triage = card.dataset.triage || "";
      updateDerivedUI();
      updateSidebar();
    });
  });

  const routeCards = Array.from(document.querySelectorAll(".route-card"));
  routeCards.forEach(card => {
    card.addEventListener("click", () => {
      stopAutoFlow();
      state.mode = "interactive";
      state.ruta = card.dataset.ruta || "";
      updateDerivedUI();
      updateSidebar();
    });
  });

  const filtroChecks = ["chkViaAerea", "chkDolorToracico", "chkShock", "chkNeurologico"];
  filtroChecks.forEach(id => {
    const el = getEl(id);
    if (!el) return;

    el.addEventListener("change", () => {
      evaluateFiltro();
      updateDerivedUI();
      updateSidebar();
    });
  });

  const btnContinuarIngreso = getEl("btnContinuarIngreso");
  if (btnContinuarIngreso) {
    btnContinuarIngreso.addEventListener("click", () => {
      stopAutoFlow();
      updatePacienteFromInputs();
      showScreen(1);
    });
  }

  const btnReiniciarIngreso = getEl("btnReiniciarIngreso");
  if (btnReiniciarIngreso) {
    btnReiniciarIngreso.addEventListener("click", () => {
      stopAutoFlow();
      resetIngreso();
    });
  }

  const btnContinuarTriage = getEl("btnContinuarTriage");
  if (btnContinuarTriage) {
    btnContinuarTriage.addEventListener("click", () => {
      if (!state.triage) {
        state.triage = "medio";
      }
      showScreen(2);
    });
  }

  const btnContinuarFiltro = getEl("btnContinuarFiltro");
  if (btnContinuarFiltro) {
    btnContinuarFiltro.addEventListener("click", () => {
      evaluateFiltro();
      if (!state.folio) {
        state.folio = generateFolio();
      }
      showScreen(3);
    });
  }

  const btnContinuarDecision = getEl("btnContinuarDecision");
  if (btnContinuarDecision) {
    btnContinuarDecision.addEventListener("click", () => {
      if (!state.ruta) {
        state.ruta = state.filtroRiesgo || state.triage === "alto" ? "hospital" : "ambulatorio";
      }
      showScreen(6);
    });
  }

  const genericNextButtons = Array.from(document.querySelectorAll("[data-next]"));
  genericNextButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      stopAutoFlow();
      const next = Number(btn.dataset.next);
      showScreen(next);
    });
  });

  const genericPrevButtons = Array.from(document.querySelectorAll("[data-prev]"));
  genericPrevButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      stopAutoFlow();
      const prev = Number(btn.dataset.prev);
      showScreen(prev);
    });
  });

  const btnModoInteractivo = getEl("btnModoInteractivo");
  if (btnModoInteractivo) {
    btnModoInteractivo.addEventListener("click", () => {
      stopAutoFlow();
      state.mode = "interactive";
    });
  }

  const btnModoAutomatico = getEl("btnModoAutomatico");
  if (btnModoAutomatico) {
    btnModoAutomatico.addEventListener("click", () => {
      startAutoFlow();
    });
  }

  const btnCerrarCaso = getEl("btnCerrarCaso");
  if (btnCerrarCaso) {
    btnCerrarCaso.addEventListener("click", () => {
      stopAutoFlow();
      alert("Caso cerrado correctamente para fines del demo.");
    });
  }

  timelineSteps.forEach((step, index) => {
    step.addEventListener("click", () => {
      stopAutoFlow();
      showScreen(index);
    });
  });
}

function init() {
  syncInputsFromState();
  updateSidebar();
  updateDerivedUI();
  attachEvents();
  showScreen(0);
}

document.addEventListener("DOMContentLoaded", init);
