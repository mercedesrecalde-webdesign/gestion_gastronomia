const fs = require('fs');

const db = fs.readFileSync('db_questions.json', 'utf8');
let html = fs.readFileSync('dashboard.html', 'utf8');

// 1. Inject CSS
const cssInject = `
    /* Modal and Pills */
    .q-pill { display: inline-block; background: rgba(224,90,90,0.15); color: #e05a5a; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; cursor: pointer; border: 1px solid rgba(224,90,90,0.3); transition: 0.2s; margin: 2px; }
    .q-pill:hover { background: rgba(224,90,90,0.25); border-color: #e05a5a; transform: translateY(-1px); }
    
    .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
    .modal-overlay.active { display: flex; animation: fadeIn 0.2s ease-out; }
    .q-modal { background: #13160f; border: 1px solid #2a3023; border-radius: 8px; width: 90%; max-width: 600px; padding: 30px; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-close { position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: #7a8470; cursor: pointer; font-size: 24px; line-height: 1; }
    .modal-close:hover { color: #e8ead4; }
    .qm-header { font-family: monospace; font-size: 12px; color: #d4a853; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .qm-badge { background: rgba(212,168,83,0.15); border: 1px solid rgba(212,168,83,0.3); padding: 2px 8px; border-radius: 4px; }
    .qm-text { font-size: 16px; font-weight: 500; color: #e8ead4; line-height: 1.5; margin-bottom: 24px; }
    .qm-correct { background: rgba(107,191,106,0.1); border-left: 3px solid #6bbf6a; padding: 16px; border-radius: 4px; margin-bottom: 16px; }
    .qm-correct-lbl { font-size: 10px; color: #6bbf6a; font-family: monospace; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
    .qm-correct-val { color: #e8ead4; font-size: 14px; font-weight: 600; }
    .qm-feedback { background: #181c14; border: 1px solid #2a3023; padding: 16px; border-radius: 4px; color: #7a8470; font-size: 14px; line-height: 1.6; }
    .qm-feedback strong { color: #d4a853; font-weight: normal; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

html = html.replace('</style>', cssInject + '\n  </style>');

// 2. Inject HTML Modal
const modalHtml = `
  <div class="modal-overlay" id="qModalOverlay" onclick="closeModal(event)">
    <div class="q-modal" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeModal(null, true)">&times;</button>
      <div class="qm-header"><span class="qm-badge" id="qmCode">P13</span> <span id="qmExam">SIMULACRO GENERAL</span></div>
      <div class="qm-text" id="qmText"></div>
      <div class="qm-correct">
        <div class="qm-correct-lbl">RESPUESTA CORRECTA</div>
        <div class="qm-correct-val" id="qmCorrect"></div>
      </div>
      <div class="qm-feedback" id="qmFeedback"></div>
    </div>
  </div>
`;
html = html.replace('</body>', modalHtml + '\n</body>');


// 3. Inject DB and JS Modal Logic
const jsInject = `
    const QUESTION_DB = ${db};

    function showModal(examType, code) {
      if (!QUESTION_DB[examType] || !QUESTION_DB[examType][code]) {
        document.getElementById('qmText').textContent = "Detalle no disponible para esta pregunta.";
        document.getElementById('qmCorrect').innerHTML = "-";
        document.getElementById('qmFeedback').innerHTML = "No se encontraron metadatos para el código ingresado.";
      } else {
        const q = QUESTION_DB[examType][code];
        document.getElementById('qmText').innerHTML = q.text + (q.hint ? '<br><br><span style="color:#5ab4d4;font-size:13px;font-family:monospace">📐 ' + q.hint + '</span>' : '');
        document.getElementById('qmCorrect').innerHTML = q.correct;
        document.getElementById('qmFeedback').innerHTML = q.feedback;
      }
      document.getElementById('qmCode').textContent = code;
      const exLabels = { 'SIMULACRO': 'SIMULACRO GENERAL', 'CM_PE': 'RECETA RENTABILIDAD (CM Y PE)', 'TP': 'TP GRÁFICOS' };
      document.getElementById('qmExam').textContent = exLabels[examType] || examType;
      
      document.getElementById('qModalOverlay').classList.add('active');
    }

    function closeModal(e, force) {
      if (force || e.target === document.getElementById('qModalOverlay')) {
        document.getElementById('qModalOverlay').classList.remove('active');
      }
    }
`;
html = html.replace('<script>', '<script>\n' + jsInject);

// 4. Inject pills rendering in table body
const tableLogicOrig = "          <td style=\"font-size:12px; color:#7a8470; line-height:1.4;\">${r.errores ? r.errores : '-'}</td>";
const tableLogicNew = `          <td style="font-size:12px; color:#7a8470; line-height:1.4;">
            \${(() => {
              if (!r.errores) return '-';
              let eStr = r.errores.replace('TP GRÁFICOS: ', '');
              let errCodes = eStr.split(',').map(s => s.trim()).filter(Boolean);
              let exType = getExamType(r);
              return errCodes.map(code => '<span class="q-pill" onclick="showModal(\\'' + exType + '\\', \\'' + code + '\\')">' + code + '</span>').join('');
            })()}
          </td>`;
          
html = html.replace(tableLogicOrig, tableLogicNew);

fs.writeFileSync('dashboard.html', html);
console.log('Successfully injected modal logic.');
