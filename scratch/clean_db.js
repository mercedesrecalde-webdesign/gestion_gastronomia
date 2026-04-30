const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dukgjrhyhyxvdqzhthje.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a2dqcmh5aHl4dmRxemh0aGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTQzNjIsImV4cCI6MjA4MzQ5MDM2Mn0.JYZWv2vYwMbTopyL-T8_kjbX2py5IL7Ap6ASZc2B4dM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanFailed() {
    console.log('Iniciando limpieza de desaprobados (< 70%)...');
    
    // Intentamos borrar de exam_resultados
    const { data, error } = await supabase
        .from('exam_resultados')
        .delete()
        .lt('porcentaje', 70);

    if (error) {
        console.error('Error al borrar:', error.message);
    } else {
        console.log('Limpieza completada exitosamente.');
    }
}

cleanFailed();
