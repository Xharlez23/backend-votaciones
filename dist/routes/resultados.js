"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../supabaseClient");
const router = (0, express_1.Router)();
// GET /api/resultados/:jornada
router.get('/:jornada', async (req, res) => {
    const jornadaUpper = req.params.jornada.toUpperCase();
    if (!['MANANA', 'TARDE', 'NOCHE'].includes(jornadaUpper)) {
        return res.status(400).json({ error: 'Jornada inválida.' });
    }
    // Traer candidatos de la jornada
    const { data: candidatos, error: errorCandidatos } = await supabaseClient_1.supabase
        .from('candidatos')
        .select('id, nombre, ficha')
        .eq('jornada', jornadaUpper)
        .eq('activo', true);
    if (errorCandidatos) {
        return res.status(500).json({ error: errorCandidatos.message });
    }
    // Traer todos los votos de esa jornada
    const { data: votos, error: errorVotos } = await supabaseClient_1.supabase
        .from('votos')
        .select('candidato_id')
        .eq('jornada', jornadaUpper);
    if (errorVotos) {
        return res.status(500).json({ error: errorVotos.message });
    }
    // Contar votos por candidato
    const resultados = candidatos.map(c => {
        const total = votos.filter(v => v.candidato_id === c.id).length;
        return { id: c.id, nombre: c.nombre, ficha: c.ficha, votos: total };
    });
    // Ordenar de mayor a menor
    resultados.sort((a, b) => b.votos - a.votos);
    const totalVotos = votos.length;
    res.json({ jornada: jornadaUpper, totalVotos, resultados });
});
exports.default = router;
