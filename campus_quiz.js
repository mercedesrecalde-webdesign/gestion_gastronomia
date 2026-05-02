const CampusQuiz = {
  questions: [],
  currentIdx: 0,
  answers: [], // Track user answers to allow corrections

  init(container, sectionTitle) {
    this.container = container;
    this.currentIdx = 0;
    this.answers = [];
    this.sectionTitle = sectionTitle;

    // Fill-down logic to capture all questions in a block
    let currentSec = "";
    const allQs = GLOBAL_QS.map(q => {
      if (q.sec) currentSec = q.sec;
      return { ...q, _assignedSec: currentSec };
    });

    if (sectionTitle) {
      this.questions = allQs.filter(q => 
        q._assignedSec && q._assignedSec.toUpperCase().includes(sectionTitle.toUpperCase())
      );
    } else {
      this.questions = allQs;
    }
    
    if (this.questions.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 100px; color: var(--muted)">No hay ejercicios disponibles para este módulo.</div>`;
      return;
    }

    // Check for saved progress
    const saved = localStorage.getItem(`quiz_progress_${this.sectionTitle}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (confirm(`Tienes un progreso guardado en "${this.sectionTitle}". ¿Deseas continuar desde la pregunta ${data.idx + 1}?`)) {
        this.currentIdx = data.idx;
        this.answers = data.ans || [];
      } else {
        localStorage.removeItem(`quiz_progress_${this.sectionTitle}`);
      }
    }

    this.render();
  },

  saveProgress() {
    const data = {
      idx: this.currentIdx,
      ans: this.answers
    };
    localStorage.setItem(`quiz_progress_${this.sectionTitle}`, JSON.stringify(data));
  },

  render() {
    const q = this.questions[this.currentIdx];
    const prevAns = this.answers[this.currentIdx];

    this.container.innerHTML = `
      <div class="q-card" style="background: var(--card); border: 1px solid var(--border); padding: 32px; border-radius: 12px; animation: fadeIn 0.3s ease;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
          <span style="font-family: var(--mono); font-size: 10px; color: var(--gold)">BLOQUE EJERCICIOS · ${this.currentIdx + 1} / ${this.questions.length}</span>
          ${this.currentIdx > 0 ? `<button onclick="CampusQuiz.back()" style="background:none; border:none; color:var(--muted); cursor:pointer; font-size:11px; font-family:var(--mono);">← VOLVER ATRÁS</button>` : ''}
        </div>
        <h2 style="font-family: var(--body); font-size: 20px; margin-bottom: 32px; line-height: 1.5;">${q.text}</h2>
        
        ${q.scen ? `
          <div style="background: var(--card2); border-left: 3px solid var(--gold); padding: 20px; border-radius: 4px; margin-bottom: 24px; font-size: 14px;">
            <strong style="color:var(--gold); font-family:var(--mono); font-size:10px; display:block; margin-bottom:10px;">ESCENARIO</strong>
            <p style="margin-bottom:15px;">${q.scen.body}</p>
            ${q.scen.rows ? `
              <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 6px;">
                ${q.scen.rows.map(row => `
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                    <span style="color: var(--muted)">${row[0]}</span>
                    <span style="font-family: var(--mono); color: var(--text)">${row[1]}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div id="optionsContainer" style="display: flex; flex-direction: column; gap: 12px;">
           ${this.renderInputs(q, prevAns)}
        </div>
        <div id="feedbackContainer" style="margin-top: 32px; ${prevAns !== undefined ? 'display:block' : 'display:none'}">
          ${prevAns !== undefined ? this.getFeedbackHTML(q) : ''}
        </div>
        <div style="margin-top: 40px; display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;">
          <button onclick="CampusQuiz.showResults()" style="background: transparent; border: 1px solid var(--gold); color: var(--gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-family: var(--body); font-weight: 500; font-size: 13px;">Finalizar y ver resultado</button>
          <button id="btnNext" onclick="CampusQuiz.next()" style="${prevAns !== undefined ? 'display:block' : 'display:none'}; background: var(--gold); color: #111; border: none; padding: 12px 32px; border-radius: 6px; cursor: pointer; font-family: var(--body); font-weight: 600;">Siguiente →</button>
        </div>
      </div>
    `;

    if (prevAns !== undefined) {
      this.highlightAnswer(q, prevAns);
    }
  },

  renderInputs(q, prevAns) {
    const answered = prevAns !== undefined;
    if (q.type === 'mc') {
      return q.opts.map((opt, i) => `
        <div class="opt-box" id="opt-${i}" ${answered ? '' : `onclick="CampusQuiz.submitAnswer(${i})"`} style="background: var(--surface); border: 1px solid var(--border); padding: 16px; border-radius: 8px; cursor: ${answered ? 'default' : 'pointer'}; transition: all 0.2s; ${answered ? 'pointer-events: none; opacity: 0.85;' : ''}">
          ${opt}
        </div>
      `).join('');
    } else if (q.type === 'tf') {
      return `
        <div style="display: flex; gap: 16px;">
          <div class="opt-box" id="opt-true" ${answered ? '' : `onclick="CampusQuiz.submitAnswer(true)"`} style="flex:1; text-align:center; background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 8px; cursor: ${answered ? 'default' : 'pointer'}; ${answered ? 'pointer-events: none; opacity: 0.85;' : ''}">VERDADERO</div>
          <div class="opt-box" id="opt-false" ${answered ? '' : `onclick="CampusQuiz.submitAnswer(false)"`} style="flex:1; text-align:center; background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 8px; cursor: ${answered ? 'default' : 'pointer'}; ${answered ? 'pointer-events: none; opacity: 0.85;' : ''}">FALSO</div>
        </div>
      `;
    } else if (q.type === 'numeric') {
      return `
        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="number" id="numInput" value="${prevAns !== undefined ? prevAns : ''}" style="background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 16px; border-radius: 8px; width: 200px; font-family: var(--mono); font-size: 18px;">
          <button onclick="CampusQuiz.submitAnswer(parseFloat(document.getElementById('numInput').value))" style="background: var(--gold-low); color: var(--gold); border: 1px solid var(--gold); padding: 16px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Validar</button>
        </div>
      `;
    }
    return '';
  },

  submitAnswer(val) {
    if (isNaN(val) && typeof val === 'number') return;
    this.answers[this.currentIdx] = val;
    this.saveProgress();
    this.render();
  },

  highlightAnswer(q, ans) {
    const boxes = document.querySelectorAll('.opt-box');
    if (q.type === 'mc') {
      boxes.forEach((b, i) => {
        if (i === q.ans) b.style.borderColor = 'var(--green)';
        if (i === ans && i !== q.ans) b.style.borderColor = 'var(--red)';
      });
    } else if (q.type === 'tf') {
      const trueBox = document.getElementById('opt-true');
      const falseBox = document.getElementById('opt-false');
      if (q.ans === true) trueBox.style.borderColor = 'var(--green)';
      else falseBox.style.borderColor = 'var(--green)';
      
      if (ans !== q.ans) {
        if (ans === true) trueBox.style.borderColor = 'var(--red)';
        else falseBox.style.borderColor = 'var(--red)';
      }
    } else if (q.type === 'numeric') {
      const input = document.getElementById('numInput');
      input.style.borderColor = (ans === q.ans) ? 'var(--green)' : 'var(--red)';
    }
  },

  getFeedbackHTML(q) {
    return `
      <div style="background: var(--card2); border-left: 3px solid var(--gold); padding: 20px; font-size: 14px; color: var(--muted); border-radius: 4px;">
        <strong style="color: var(--gold); display: block; margin-bottom: 8px; font-family: var(--mono); font-size: 10px;">EXPLICACIÓN</strong>
        ${q.fb}
      </div>
    `;
  },

  back() {
    if (this.currentIdx > 0) {
      this.currentIdx--;
      this.render();
    }
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
    let score = 0;
    let answered = 0;
    this.questions.forEach((q, i) => {
      if (this.answers[i] !== undefined) {
        answered++;
        if (this.answers[i] === q.ans) score++;
      }
    });

    const total = this.questions.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    this.container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; background: var(--card); border-radius: 12px; border: 1px solid var(--border);">
        <div style="font-size: 64px; margin-bottom: 16px;">${pct >= 70 ? '🎉' : '📚'}</div>
        <h2 style="font-family: var(--display); font-size: 48px; margin-bottom: 8px;">${pct}%</h2>
        <p style="color: var(--muted); margin-bottom: 12px;">Puntaje: ${score} correctas de ${total} preguntas</p>
        <p style="color: var(--muted); margin-bottom: 40px; font-size: 13px;">${answered < total ? `Respondiste ${answered} de ${total} preguntas. Las no respondidas se contaron como incorrectas.` : 'Respondiste todas las preguntas.'}</p>
        <div style="display: flex; justify-content: center; gap: 16px;">
          <button onclick="CampusQuiz.init(document.getElementById('moduleView'), '${this.sectionTitle}')" style="background: var(--gold); color:#111; border: none; padding: 12px 32px; border-radius: 6px; cursor: pointer; font-weight: 600;">Reintentar</button>
          <button onclick="switchMainView('campus')" style="background: transparent; border: 1px solid var(--gold); color: var(--gold); padding: 12px 32px; border-radius: 6px; cursor: pointer;">Volver al Inicio</button>
        </div>
      </div>
    `;
    
    // Clear progress since they finished
    localStorage.removeItem(`quiz_progress_${this.sectionTitle}`);
  }
};
