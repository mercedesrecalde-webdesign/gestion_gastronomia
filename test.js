const fs = require('fs');
const url = 'https://dukgjrhyhyxvdqzhthje.supabase.co/rest/v1/exam_resultados?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a2dqcmh5aHl4dmRxemh0aGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTQzNjIsImV4cCI6MjA4MzQ5MDM2Mn0.JYZWv2vYwMbTopyL-T8_kjbX2py5IL7Ap6ASZc2B4dM';

fetch(url, {
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
}).then(r => r.json()).then(data => {
  fs.writeFileSync('db_out.json', JSON.stringify(data, null, 2));
}).catch(console.error);
