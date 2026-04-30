const fs = require('fs');
const path = require('path');

const indexContent = fs.readFileSync('index.html', 'utf-8');
const cmPeContent = fs.readFileSync('examen_cm_pe.html', 'utf-8');

// We use eval to extract since it's just raw js objects
let QS_SIMULACRO = null;
let ITEMS_CM_PE = null;

// Extract from index.html (Simulacro)
try {
    const qsMatch = indexContent.match(/const QS = \[([\s\S]*?)\];/);
    if (qsMatch) {
        // Need to evaluate it. It's a JS array.
        eval("QS_SIMULACRO = [" + qsMatch[1] + "];");
    }
} catch (e) {
    console.error("Error reading index.html QS", e);
}

// Extract from examen_cm_pe.html (CM y PE)
try {
    const itemsMatch = cmPeContent.match(/const ITEMS = \[([\s\S]*?)\];/);
    if (itemsMatch) {
        eval("ITEMS_CM_PE = [" + itemsMatch[1] + "];");
    }
} catch (e) {
    console.error("Error reading examen_cm_pe.html ITEMS", e);
}

// Format the database
const QUESTION_DB = {
    'SIMULACRO': {},
    'CM_PE': {},
    'TP': {}
};

if (QS_SIMULACRO) {
    QS_SIMULACRO.forEach((q, i) => {
        const key = 'P' + String(i + 1).padStart(2, '0');
        let correctAnswer = '';
        if (q.type === 'mc') {
            correctAnswer = String.fromCharCode(65 + q.ans) + ') ' + q.opts[q.ans];
        } else if (q.type === 'tf') {
            correctAnswer = q.ans ? 'Verdadero' : 'Falso';
        } else if (q.type === 'numeric') {
            correctAnswer = q.ans + ' ' + (q.unit || '');
        }
        
        QUESTION_DB['SIMULACRO'][key] = {
            id: key,
            text: q.text,
            hint: q.hint || '',
            correct: correctAnswer,
            feedback: q.fb || ''
        };
    });
}

if (ITEMS_CM_PE) {
    // Process ITEMS carefully, considering exercises
    ITEMS_CM_PE.forEach(item => {
        if (item.type === 'exercise') {
            item.steps.forEach(s => {
                const key = s.id.toUpperCase();
                QUESTION_DB['CM_PE'][key] = {
                    id: key,
                    text: s.text,
                    hint: s.hint || '',
                    correct: s.ans + ' ' + (s.unit || ''),
                    feedback: s.fb || ''
                };
            });
        } else {
            const key = item.id.toUpperCase();
            let correctAnswer = '';
            if (item.type === 'mc') {
                correctAnswer = String.fromCharCode(65 + item.ans) + ') ' + item.opts[item.ans];
            } else if (item.type === 'tf') {
                correctAnswer = item.ans ? 'Verdadero' : 'Falso';
            } else if (item.type === 'numeric') {
                correctAnswer = item.ans + ' ' + (item.unit || '');
            }
            QUESTION_DB['CM_PE'][key] = {
                id: key,
                text: item.text,
                hint: item.hint || '',
                correct: correctAnswer,
                feedback: item.fb || ''
            };
        }
    });
}

// Write the database to a javascript file so we can read it easily
fs.writeFileSync('db_questions.json', JSON.stringify(QUESTION_DB, null, 2));
console.log("Written to db_questions.json");
