const fs = require('fs');

// 1. Modificar simulacro2.html
let sim2 = fs.readFileSync('simulacro2.html', 'utf-8');

// Copiar las credenciales exactas desde el index.html
const indexHtml = fs.readFileSync('index.html', 'utf-8');
const urlMatch = indexHtml.match(/const SUPABASE_URL = '(.*?)';/);
const keyMatch = indexHtml.match(/const SUPABASE_KEY = '(.*?)';/);
if (urlMatch && keyMatch) {
  sim2 = sim2.replace(/const SUPABASE_URL = '(.*?)';/, `const SUPABASE_URL = '${urlMatch[1]}';`);
  sim2 = sim2.replace(/const SUPABASE_KEY = '(.*?)';/, `const SUPABASE_KEY = '${keyMatch[1]}';`);
}

// Modificar el showRes para que envíe al exam_resultados y construya failedQs
const oldResBlock = `const rc=document.getElementById('rc');rc.innerHTML='';`;
const newResBlock = `const rc=document.getElementById('rc');rc.innerHTML='';
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
sim2 = sim2.replace(oldResBlock, newResBlock);

const oldInsert = `try{await SB.from('simulacros_resultados').insert({nombre,simulacro_num:SIMULACRO_NUM,score,total:TOTAL,pct,grade,answers_json:ans});}catch(e){console.warn('Supabase:',e);}`;
const newInsert = `try{await SB.from('exam_resultados').insert({nombre: nombre, puntaje: score, total: TOTAL, porcentaje: pct, errores: failedQs.join(', ') });}catch(e){console.warn('Supabase:',e);}`;
sim2 = sim2.replace(oldInsert, newInsert);

fs.writeFileSync('simulacro2.html', sim2);


// 2. Extraer QS de simulacro2.html
let QS_SIMULACRO_2 = null;
const qsMatch = sim2.match(/const QS=\[([\s\S]*?)\];/);
if (qsMatch) {
    eval("QS_SIMULACRO_2 = [" + qsMatch[1] + "];");
}

const dbObj = {};
if (QS_SIMULACRO_2) {
    QS_SIMULACRO_2.forEach((q, i) => {
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

// 3. Modificar dashboard.html
let dash = fs.readFileSync('dashboard.html', 'utf-8');

// Insert the new tab
const tabsTarget = `<button class="tab" onclick="setFilter('TP')">TP Gráficos PE</button>`;
const tabsNew = `<button class="tab" onclick="setFilter('TP')">TP Gráficos PE</button>\n        <button class="tab" onclick="setFilter('SIMULACRO2')">Simulacro 2 (Parcial)</button>`;
dash = dash.replace(tabsTarget, tabsNew);

// Insert into DB
// The DB string looks like: "TP": {} \n};
const dbTarget = `"TP": {}\n};`;
const dbNew = `"TP": {},\n  "SIMULACRO2": ${JSON.stringify(dbObj, null, 4)}\n};`;
if (dash.includes(dbTarget)) {
   dash = dash.replace(dbTarget, dbNew);
} else {
   console.log("Could not find dbTarget in dashboard.html. It might have different spacing.");
}

// Update exLabels
const labelsTarget = `const exLabels = { 'SIMULACRO': 'SIMULACRO GENERAL', 'CM_PE': 'RECETA RENTABILIDAD (CM Y PE)', 'TP': 'TP GRÁFICOS' };`;
const labelsNew = `const exLabels = { 'SIMULACRO': 'SIMULACRO GENERAL', 'CM_PE': 'RECETA RENTABILIDAD (CM Y PE)', 'TP': 'TP GRÁFICOS', 'SIMULACRO2': 'SIMULACRO 2 (PARCIAL)' };`;
dash = dash.replace(labelsTarget, labelsNew);

// Update getExamType logic
// If total === 20, it's SIMULACRO2
const typeTarget = `if (r.total === 21) return 'CM_PE';`;
const typeNew = `if (r.total === 21) return 'CM_PE';\n      if (r.total === 20) return 'SIMULACRO2';`;
dash = dash.replace(typeTarget, typeNew);


fs.writeFileSync('dashboard.html', dash);
console.log('Finished updating simulacro2.html and dashboard.html');
