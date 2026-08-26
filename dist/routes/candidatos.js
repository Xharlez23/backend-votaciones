"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../supabaseClient");
const router = (0, express_1.Router)();
// GET /api/candidatos/:jornada  -> ej: /api/candidatos/MANANA
router.get('/:jornada', async (req, res) => {
    const { jornada } = req.params;
    const jornadaUpper = jornada.toUpperCase();
    if (!['MANANA', 'TARDE', 'NOCHE'].includes(jornadaUpper)) {
        return res.status(400).json({ error: 'Jornada inválida. Usa MANANA, TARDE o NOCHE.' });
    }
    const { data, error } = await supabaseClient_1.supabase
        .from('candidatos')
        .select('*')
        .eq('jornada', jornadaUpper)
        .eq('activo', true)
        .order('nombre', { ascending: true });
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});
exports.default = router;
