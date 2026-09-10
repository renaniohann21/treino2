// Database de Exercícios
const exerciseDB = {
  gym: {
    chest: ["Supino Reto com Barra", "Supino Inclinado c/ Halteres", "Crossover na Polia", "Peitoral Voador"],
    back: ["Puxada Alta", "Remada Curvada", "Remada Baixa", "Pulldown com Corda"],
    legs: ["Agachamento Livre", "Leg Press 45°", "Cadeira Extensora", "Mesa Flexora", "Elevação Pélvica"],
    shoulders: ["Desenvolvimento c/ Halteres", "Elevação Lateral", "Elevação Frontal"],
    arms: ["Rosca Direta", "Rosca Martelo", "Tríceps Testa", "Tríceps Crossover"]
  },
  home: {
    chest: ["Flexão de Braços Tradicional", "Flexão Inclinada", "Flexão Declinada"],
    back: ["Barra Fixa (ou Remada Australiana)", "Puxada com Toalha/Elástico", "Perdigueiro"],
    legs: ["Agachamento Búlgaro", "Afundo/Passada", "Agachamento Sumo", "Elevação de Panturrilha Unilateral"],
    shoulders: ["Flexão Pike (Para Ombros)", "Elevação Lateral c/ Garrafas/Elástico"],
    arms: ["Tríceps no Banco (Mergulho)", "Rosca Direta com Elástico/Mochila"]
  }
};

let timerInterval;

// Evento Principal
document.getElementById('profile-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Captura dos dados
  const profile = {
    gender: document.getElementById('gender').value,
    age: parseInt(document.getElementById('age').value),
    weight: parseFloat(document.getElementById('weight').value),
    height: parseInt(document.getElementById('height').value),
    goal: document.getElementById('goal').value,
    days: parseInt(document.getElementById('days').value),
    equipment: document.getElementById('equipment').value
  };

  // Processamentos
  const metrics = calculateMetrics(profile);
  const workoutPlan = generateWorkoutPlan(profile);

  // Renderização
  renderMetrics(metrics);
  renderWorkoutUI(workoutPlan);

  // Exibir seções
  document.getElementById('metrics-card').classList.remove('hidden');
  document.getElementById('workout-card').classList.remove('hidden');
});

// Algoritmo de Cálculo Metabólico (Mifflin-St Jeor)
function calculateMetrics({ gender, age, weight, height, goal }) {
  // 1. IMC
  const heightM = height / 100;
  const imc = (weight / (heightM * heightM)).toFixed(1);
  let imcStatus = "Normal";
  if (imc < 18.5) imcStatus = "Abaixo do peso";
  else if (imc >= 25 && imc < 29.9) imcStatus = "Sobrepeso";
  else if (imc >= 30) imcStatus = "Obesidade";

  // 2. Taxa Metabólica Basal (TMB)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += (gender === 'male') ? 5 : -161;

  // 3. Gasto Energético Estimado & Alvo Calórico
  let calories = bmr * 1.45; // Fator de atividade moderado
  if (goal === 'hypertrophy') calories += 350;
  if (goal === 'fat_loss') calories -= 450;

  // 4. Macronutrientes (em gramas)
  const protein = weight * (goal === 'hypertrophy' ? 2.2 : 2.0);
  const fats = weight * 0.9;
  const carbCalories = calories - ((protein * 4) + (fats * 9));
  const carbs = Math.max(0, carbCalories / 4);

  return {
    imc, imcStatus,
    bmr: Math.round(bmr),
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats)
  };
}

// Algoritmo de Geração da Rotina de Treino
function generateWorkoutPlan({ days, equipment, goal }) {
  const db = exerciseDB[equipment];
  const reps = goal === 'hypertrophy' ? '3x 8-12 reps' : (goal === 'fat_loss' ? '4x 12-15 reps' : '3x 12 reps');
  
  const plan = [];

  // Lógica de Divisão dos Treinos conforme o número de dias selecionado
  if (days === 3) {
    plan.push({ name: "Dia A - Peito & Tríceps", ex: [...db.chest, ...db.arms.slice(2)] });
    plan.push({ name: "Dia B - Costas & Bíceps", ex: [...db.back, ...db.arms.slice(0, 2)] });
    plan.push({ name: "Dia C - Pernas & Ombros", ex: [...db.legs, ...db.shoulders] });
  } else if (days === 4) {
    plan.push({ name: "Dia A - Superior Focus Empurrar", ex: [...db.chest, ...db.shoulders] });
    plan.push({ name: "Dia B - Inferior Completo", ex: db.legs });
    plan.push({ name: "Dia C - Superior Focus Puxar", ex: [...db.back, ...db.arms] });
    plan.push({ name: "Dia D - Inferior & Core", ex: db.legs });
  } else { // 5 ou 6 Dias (Rotina Push / Pull / Legs)
    plan.push({ name: "Dia A - Push (Peito/Ombro/Tríceps)", ex: [db.chest[0], db.chest[1], db.shoulders[0], db.arms[2]] });
    plan.push({ name: "Dia B - Pull (Costas/Bíceps)", ex: [db.back[0], db.back[1], db.back[2], db.arms[0]] });
    plan.push({ name: "Dia C - Legs (Pernas)", ex: db.legs });
    plan.push({ name: "Dia D - Superior Geral", ex: [db.chest[2], db.back[0], db.shoulders[1]] });
    plan.push({ name: "Dia E - Inferior & Braços", ex: [db.legs[0], db.arms[1], db.arms[3]] });
  }

  return plan.map(day => ({
    ...day,
    exercises: day.ex.map(e => ({ name: e, meta: reps }))
  }));
}

// Renderizar Métricas na Tela
function renderMetrics(m) {
  document.getElementById('imc-val').textContent = m.imc;
  document.getElementById('imc-status').textContent = m.imcStatus;
  document.getElementById('bmr-val').textContent = m.bmr;
  document.getElementById('calories-val').textContent = m.calories;
  document.getElementById('prot-val').textContent = m.protein + 'g';
  document.getElementById('carb-val').textContent = m.carbs + 'g';
  document.getElementById('fat-val').textContent = m.fats + 'g';
}

// Renderizar Abas e Lista do Treino
function renderWorkoutUI(plan) {
  const tabsContainer = document.getElementById('tabs-container');
  const detailsContainer = document.getElementById('workout-details');
  
  tabsContainer.innerHTML = '';
  detailsContainer.innerHTML = '';

  plan.forEach((day, index) => {
    // Botão da Aba
    const btn = document.createElement('button');
    btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = `Treino ${String.fromCharCode(65 + index)}`; // A, B, C...
    btn.onclick = () => selectTab(index);
    tabsContainer.appendChild(btn);

    // Conteúdo do Treino
    const dayDiv = document.createElement('div');
    dayDiv.className = `tab-content ${index !== 0 ? 'hidden' : ''}`;
    dayDiv.id = `tab-content-${index}`;

    let html = `<h3 style="margin-bottom:15px; color:var(--primary);">${day.name}</h3>`;
    day.exercises.forEach(ex => {
      html += `
        <div class="exercise-item" onclick="this.classList.toggle('done')">
          <div class="exercise-info">
            <h4>${ex.name}</h4>
            <p>Toque para marcar como concluído</p>
          </div>
          <span class="badge">${ex.meta}</span>
        </div>
      `;
    });

    dayDiv.innerHTML = html;
    detailsContainer.appendChild(dayDiv);
  });
}

function selectTab(selectedIndex) {
  document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === selectedIndex);
  });
  document.querySelectorAll('.tab-content').forEach((content, idx) => {
    content.classList.toggle('hidden', idx !== selectedIndex);
  });
}

// Função do Cronômetro de Descanso
function startTimer(seconds) {
  clearInterval(timerInterval);
  let timer = seconds;
  const display = document.getElementById('timer-display');

  timerInterval = setInterval(() => {
    const mins = String(Math.floor(timer / 60)).padStart(2, '0');
    const secs = String(timer % 60).padStart(2, '0');
    display.textContent = `${mins}:${secs}`;

    if (--timer < 0) {
      clearInterval(timerInterval);
      display.textContent = "Fim!";
    }
  }, 1000);
}