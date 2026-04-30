const fs = require('fs');

// --- 1. Modify simulacro1.html ---
let sim1 = fs.readFileSync('simulacro1.html', 'utf-8');

// Copy Supabase keys from index.html
const indexHtml = fs.readFileSync('index.html', 'utf-8');
const urlMatch = indexHtml.match(/const SUPABASE_URL = '(.*?)';/);
const keyMatch = indexHtml.match(/const SUPABASE_KEY = '(.*?)';/);
if (urlMatch && keyMatch) {
  sim1 = sim1.replace(/const SUPABASE_URL = '(.*?)';/, `const SUPABASE_URL = '${urlMatch[1]}';`);
  sim1 = sim1.replace(/const SUPABASE_KEY = '(.*?)';/, `const SUPABASE_KEY = '${keyMatch[1]}';`);
}

// Modify showRes in simulacro1.html
const oldResBlock1 = `const rc=document.getElementById('rc');rc.innerHTML='';`;
const newResBlock1 = `const rc=document.getElementById('rc');rc.innerHTML='';
  const failedQs = [];
  QS.forEach((q,i)=>{
    const ok=corr[q.id]||false;const a=ans[q.id];
    if(!ok) {
       let ansStr = 'Sin responder';
       if (a !== undefined) {
         if (q.type==='mc') ansStr = String.fromCharCode(65+a);
         else if(q.type==='tf') ansStr= a ? 'Verdadero' : 'Falso';
         else ansStr = a + (q.unit ? ' ' + q.unit : '');
       }
       failedQs.push(q.id.toUpperCase() + '||' + ansStr);
    }
  });`;
sim1 = sim1.replace(oldResBlock1, newResBlock1);

const oldInsert1 = `try{await SB.from('simulacros_resultados').insert({nombre,simulacro_num:SIMULACRO_NUM,score,total:TOTAL,pct,grade,answers_json:ans});}catch(e){console.warn('Supabase error:',e);}`;
const newInsert1 = `try{await SB.from('exam_resultados').insert({nombre: nombre, puntaje: score, total: TOTAL, porcentaje: pct, errores: failedQs.length ? 'S1: ' + failedQs.join(', ') : 'S1: OK' });}catch(e){console.warn('Supabase error:',e);}`;
sim1 = sim1.replace(oldInsert1, newInsert1);

fs.writeFileSync('simulacro1.html', sim1);

// --- 2. Modify simulacro2.html to add S2 prefix ---
let sim2 = fs.readFileSync('simulacro2.html', 'utf-8');
const oldInsert2 = `try{await SB.from('exam_resultados').insert({nombre: nombre, puntaje: score, total: TOTAL, porcentaje: pct, errores: failedQs.join(', ') });}catch(e){console.warn('Supabase:',e);}`;
const newInsert2 = `try{await SB.from('exam_resultados').insert({nombre: nombre, puntaje: score, total: TOTAL, porcentaje: pct, errores: failedQs.length ? 'S2: ' + failedQs.join(', ') : 'S2: OK' });}catch(e){console.warn('Supabase:',e);}`;
sim2 = sim2.replace(oldInsert2, newInsert2);
fs.writeFileSync('simulacro2.html', sim2);


// --- 3. Extract QS from simulacro1.html ---
let QS_SIMULACRO_1 = null;
const qsMatch = sim1.match(/const QS = \[([\s\S]*?)\];/);
if (qsMatch) {
    eval("QS_SIMULACRO_1 = [" + qsMatch[1] + "];");
}

const dbObj = {};
if (QS_SIMULACRO_1) {
    QS_SIMULACRO_1.forEach((q, i) => {
        const key = q.id.toUpperCase();
        let correctAnswer = '';
        if (q.type === 'mc') {
            correctAnswer = String.fromCharCode(65 + q.ans) + ') ' + q.opts[q.ans];
        } else if (q.type === 'tf') {
            correctAnswer = q.ans ? 'Verdadero' : 'Falso';
        } else if (q.type === 'numeric') {
            correctAnswer = q.ans + ' ' + (q.unit || '');
        }
        
        dbObj[key] = {
            id: key,
            text: q.text,
            hint: q.hint || '',
            correct: correctAnswer,
            feedback: q.fb || ''
        };
    });
}

// --- 4. Modify dashboard.html ---
let dash = fs.readFileSync('dashboard.html', 'utf-8');

// Update QUESTION_DB by appending SIMULACRO1 before SIMULACRO2
const dbTarget1 = `"SIMULACRO2": {`;
const dbNew1 = `"SIMULACRO1": ${JSON.stringify(dbObj, null, 4)},\n  "SIMULACRO2": {`;
dash = dash.replace(dbTarget1, dbNew1);

// Update exLabels
const labelsTarget = `const exLabels = { 'SIMULACRO': 'SIMULACRO GENERAL', 'CM_PE': 'RECETA RENTABILIDAD (CM Y PE)', 'TP': 'TP GRÁFICOS', 'SIMULACRO2': 'SIMULACRO 2 (PARCIAL)' };`;
const labelsNew = `const exLabels = { 'SIMULACRO': 'SIMULACRO GENERAL', 'CM_PE': 'RECETA RENTABILIDAD (CM Y PE)', 'TP': 'TP GRÁFICOS', 'SIMULACRO1': 'SIMULACRO 1', 'SIMULACRO2': 'SIMULACRO 2 (PARCIAL)' };`;
dash = dash.replace(labelsTarget, labelsNew);

// Update the tabs in HTML
const tabsTarget = `<button class="tab" onclick="setFilter('SIMULACRO2')">Simulacro 2 (Parcial)</button>`;
const tabsNew = `<button class="tab" onclick="setFilter('SIMULACRO1')">Simulacro 1 (Don Burger)</button>
        <button class="tab" onclick="setFilter('SIMULACRO2')">Simulacro 2 (Parcial)</button>`;
dash = dash.replace(tabsTarget, tabsNew);

// Update getExamType logic
const typeLogicalTarget = `    function getExamType(r) {
      if (r.errores && r.errores.startsWith('TP GRÁFICOS')) return 'TP';
      if (r.total === 13) return 'TP';
      if (r.total === 21) return 'CM_PE';
      if (r.total === 20) return 'SIMULACRO2';
      return 'SIMULACRO';
    }`;
const typeLogicalNew = `    function getExamType(r) {
      if (r.errores) {
        if (r.errores.startsWith('TP GRÁFICOS')) return 'TP';
        if (r.errores.startsWith('S1:')) return 'SIMULACRO1';
        if (r.errores.startsWith('S2:')) return 'SIMULACRO2';
      }
      if (r.total === 13) return 'TP';
      if (r.total === 21) return 'CM_PE';
      if (r.total === 20) return 'SIMULACRO2'; // fallback for backward compatibility
      return 'SIMULACRO';
    }`;
dash = dash.replace(typeLogicalTarget, typeLogicalNew);

// Update eStr replacing multiple prefixes
const replaceLogicalTarget = `let eStr = r.errores.replace('TP GRÁFICOS: ', '');`;
const replaceLogicalNew = `let eStr = r.errores.replace('TP GRÁFICOS: ', '').replace('S1: OK', '').replace('S2: OK', '').replace('S1: ', '').replace('S2: ', '');`;
dash = dash.replace(replaceLogicalTarget, replaceLogicalNew);

fs.writeFileSync('dashboard.html', dash);
console.log('Finished updating simulacro1 and dashboard.html');
