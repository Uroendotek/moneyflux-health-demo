let demoData = null;
let isRunning = false;

async function loadData(){
  const res = await fetch('data.json');
  demoData = await res.json();
  renderStatic();
}

function renderStatic(){
  const p = demoData.patient;
  document.getElementById('patientCard').innerHTML = `
    <div class="patient-grid">
      <div class="data-box"><div class="label">Paciente</div><div class="value">${p.name}</div></div>
      <div class="data-box"><div class="label">Edad</div><div class="value">${p.age} años</div></div>
      <div class="data-box"><div class="label">Sexo</div><div class="value">${p.sex}</div></div>
      <div class="data-box"><div class="label">Aseguradora</div><div class="value small">${p.insurer}</div></div>
      <div class="data-box"><div class="label">Motivo</div><div class="value small">${p.reason}</div></div>
      <div class="data-box"><div class="label">Diagnóstico</div><div class="value small">${p.diagnosis}</div></div>
    </div>
  `;

  document.getElementById('studiesList').innerHTML = demoData.studies.map(s => `
    <div class="study-item">
      <div class="study-title">${s.name}</div>
      <div class="study-result">${s.result}</div>
    </div>
  `).join('');

  const decision = demoData.decision;
  const cls = decision.route === 'hospital' ? 'route-hospital' : 'route-observation';
  document.getElementById('decisionCard').className = `decision-card ${cls}`;
  document.getElementById('decisionCard').innerHTML = `
    <div class="decision-title">${decision.title}</div>
    <div class="decision-text">${decision.text}</div>
  `;

  document.getElementById('flowBoard').innerHTML = demoData.flow.map((step, i) => `
    <div class="flow-step" id="step-${i}">
      <div class="step-top">
        <div class="step-number">Paso ${i+1}</div>
        <div class="step-status" id="status-${i}">Pendiente</div>
      </div>
      <div class="step-title">${step.title}</div>
      <div class="step-detail">${step.detail}</div>
    </div>
  `).join('');

  document.getElementById('metricsGrid').innerHTML = demoData.metrics.map(m => `
    <div class="metric-card">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
      <div class="metric-note">${m.note}</div>
    </div>
  `).join('');
}

function resetFlow(){
  demoData.flow.forEach((_, i) => {
    const step = document.getElementById(`step-${i}`);
    const status = document.getElementById(`status-${i}`);
    step.classList.remove('active', 'done');
    status.textContent = 'Pendiente';
  });
}

function startDemo(){
  if (isRunning) return;
  isRunning = true;
  const btn = document.getElementById('startBtn');
  btn.disabled = true;
  resetFlow();

  demoData.flow.forEach((_, i) => {
    setTimeout(() => {
      if (i > 0) {
        document.getElementById(`step-${i-1}`).classList.remove('active');
        document.getElementById(`step-${i-1}`).classList.add('done');
        document.getElementById(`status-${i-1}`).textContent = 'Completado';
      }
      document.getElementById(`step-${i}`).classList.add('active');
      document.getElementById(`status-${i}`).textContent = 'En curso';

      if (i === demoData.flow.length - 1) {
        setTimeout(() => {
          document.getElementById(`step-${i}`).classList.remove('active');
          document.getElementById(`step-${i}`).classList.add('done');
          document.getElementById(`status-${i}`).textContent = 'Completado';
          btn.disabled = false;
          isRunning = false;
        }, 1000);
      }
    }, i * 1200);
  });
}

document.getElementById('startBtn').addEventListener('click', startDemo);
loadData();
