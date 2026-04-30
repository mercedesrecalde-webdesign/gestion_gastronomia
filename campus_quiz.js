const CampusQuiz = {
  questions: [],
  currentIdx: 0,
  score: 0,

  init(container, sectionTitle) {
    this.container = container;
    this.currentIdx = 0;
    this.score = 0;

    // Filter questions by section if provided
    if (sectionTitle) {
      this.questions = GLOBAL_QS.filter(q => 
        q.sec && q.sec.toUpperCase().includes(sectionTitle.toUpperCase())
      );
    } else {
      this.questions = GLOBAL_QS;
    }
    
    if (this.questions.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 100px; color: var(--muted)">No hay ejercicios disponibles para este módulo.</div>`;
      return;
    }

    this.render();
  },

  render() {
    const q = this.questions[this.currentIdx];
    this.container.innerHTML = `
      <div class="q-card" style="background: var(--card); border: 1px solid var(--border); padding: 32px; border-radius: 12px; animation: fadeIn 0.3s ease;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
          <span style="font-family: var(--mono); font-size: 10px; color: var(--gold)">BLOQUE EJERCICIOS · ${this.currentIdx + 1} / ${this.questions.length}</span>
        </div>
        <h2 style="font-family: var(--body); font-size: 20px; margin-bottom: 32px; line-height: 1.5;">${q.text}</h2>
        
        ${q.scen ? `
          <div style="background: var(--card2); border-left: 3px solid var(--gold); padding: 20px; border-radius: 4px; margin-bottom: 24px; font-size: 14px;">
            <strong style="color:var(--gold); font-family:var(--mono); font-size:10px; display:block; margin-bottom:10px;">ESCENARIO</strong>
            ${q.scen.body}
          </div>
        ` : ''}

        <div id="optionsContainer" style="display: flex; flex-direction: column; gap: 12px;">
           ${this.renderInputs(q)}
        </div>
        <div id="feedbackContainer" style="margin-top: 32px; display: none;"></div>
        <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
          <button id="btnNext" onclick="CampusQuiz.next()" style="display: none; background: var(--gold); color: #111; border: none; padding: 12px 32px; border-radius: 6px; cursor: pointer; font-family: var(--body); font-weight: 600;">Siguiente →</button>
        </div>
      </div>
    `;
  },

  renderInputs(q) {
    if (q.type === 'mc') {
      return q.opts.map((opt, i) => `
        <div class="opt-box" onclick="CampusQuiz.checkMC(${i}, ${q.ans})" style="background: var(--surface); border: 1px solid var(--border); padding: 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
          ${opt}
        </div>
      `).join('');
    } else if (q.type === 'tf') {
      return `
        <div style="display: flex; gap: 16px;">
          <div class="opt-box" onclick="CampusQuiz.checkTF(true, ${q.ans})" style="flex:1; text-align:center; background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 8px; cursor: pointer;">VERDADERO</div>
          <div class="opt-box" onclick="CampusQuiz.checkTF(false, ${q.ans})" style="flex:1; text-align:center; background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 8px; cursor: pointer;">FALSO</div>
        </div>
      `;
    } else if (q.type === 'numeric') {
      return `
        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="number" id="numInput" style="background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 16px; border-radius: 8px; width: 200px; font-family: var(--mono); font-size: 18px;">
          <button onclick="CampusQuiz.checkNumeric(${q.ans})" style="background: var(--gold-low); color: var(--gold); border: 1px solid var(--gold); padding: 16px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Validar</button>
        </div>
      `;
    }
    return '';
  },

  checkMC(selectedIdx, correctIdx) {
    const boxes = document.querySelectorAll('.opt-box');
    boxes.forEach(b => b.style.pointerEvents = 'none');
    const isCorrect = selectedIdx === correctIdx;
    if (isCorrect) {
      boxes[selectedIdx].style.borderColor = 'var(--green)';
      boxes[selectedIdx].style.background = 'rgba(123, 198, 122, 0.1)';
      this.score++;
    } else {
      boxes[selectedIdx].style.borderColor = 'var(--red)';
      boxes[selectedIdx].style.background = 'rgba(224, 90, 90, 0.1)';
      boxes[correctIdx].style.borderColor = 'var(--green)';
    }
    this.showFeedback();
  },

  checkTF(selected, correct) {
    const boxes = document.querySelectorAll('.opt-box');
    boxes.forEach(b => b.style.pointerEvents = 'none');
    const isCorrect = selected === correct;
    const selectedBox = selected ? boxes[0] : boxes[1];
    const correctBox = correct ? boxes[0] : boxes[1];

    if (isCorrect) {
      selectedBox.style.borderColor = 'var(--green)';
      selectedBox.style.background = 'rgba(123, 198, 122, 0.1)';
      this.score++;
    } else {
      selectedBox.style.borderColor = 'var(--red)';
      selectedBox.style.background = 'rgba(224, 90, 90, 0.1)';
      correctBox.style.borderColor = 'var(--green)';
    }
    this.showFeedback();
  },

  checkNumeric(correct) {
    const input = document.getElementById('numInput');
    const val = parseFloat(input.value);
    input.disabled = true;
    if (val === correct) {
      input.style.borderColor = 'var(--green)';
      this.score++;
    } else {
      input.style.borderColor = 'var(--red)';
      const msg = document.createElement('div');
      msg.style.marginTop = '10px';
      msg.style.color = 'var(--green)';
      msg.innerHTML = `Respuesta correcta: <strong>${correct}</strong>`;
      input.parentNode.appendChild(msg);
    }
    this.showFeedback();
  },

  showFeedback() {
    const q = this.questions[this.currentIdx];
    const fb = document.getElementById('feedbackContainer');
    fb.style.display = 'block';
    fb.innerHTML = `
      <div style="background: var(--card2); border-left: 3px solid var(--gold); padding: 20px; font-size: 14px; color: var(--muted); border-radius: 4px;">
        <strong style="color: var(--gold); display: block; margin-bottom: 8px; font-family: var(--mono); font-size: 10px;">EXPLICACIÓN</strong>
        ${q.fb}
      </div>
    `;
    document.getElementById('btnNext').style.display = 'block';
  },

  next() {
    this.currentIdx++;
    if (this.currentIdx < this.questions.length) {
      this.render();
    } else {
      this.showResults();
    }
  },

  showResults() {
    const pct = Math.round((this.score / this.questions.length) * 100);
    this.container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; background: var(--card); border-radius: 12px; border: 1px solid var(--border);">
        <div style="font-size: 64px; margin-bottom: 16px;">${pct >= 70 ? '🎉' : '📚'}</div>
        <h2 style="font-family: var(--display); font-size: 48px; margin-bottom: 8px;">${pct}%</h2>
        <p style="color: var(--muted); margin-bottom: 40px;">Puntaje: ${this.score} de ${this.questions.length}</p>
        <div style="display: flex; justify-content: center; gap: 16px;">
          <button onclick="loadModule(${currentModuleIndex})" style="background: var(--gold); color:#111; border: none; padding: 12px 32px; border-radius: 6px; cursor: pointer; font-weight: 600;">Reiniciar Tema</button>
          <button onclick="loadModule(${currentModuleIndex + 1})" style="background: transparent; border: 1px solid var(--gold); color: var(--gold); padding: 12px 32px; border-radius: 6px; cursor: pointer;">Siguiente Módulo →</button>
        </div>
      </div>
    `;
  }
};
