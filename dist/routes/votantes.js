"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../supabaseClient");
const router = (0, express_1.Router)();
// POST /api/votante/verificar
// body: { cedula, nombre, jornada }
router.post('/verificar', async (req, res) => {
    const { cedula, nombre, jornada } = req.body;
    if (!cedula || !nombre || !jornada) {
        return res.status(400).json({ error: 'Faltan datos: cedula, nombre y jornada son requeridos.' });
    }
    const jornadaUpper = jornada.toUpperCase();
    if (!['MANANA', 'TARDE', 'NOCHE'].includes(jornadaUpper)) {
        return res.status(400).json({ error: 'Jornada inválida.' });
    }
    // Buscar si el votante ya existe
    const { data: existente, error: errorBusqueda } = await supabaseClient_1.supabase
        .from('votantes')
        .select('*')
        .eq('cedula', cedula)
        .maybeSingle();
    if (errorBusqueda) {
        return res.status(500).json({ error: errorBusqueda.message });
    }
    if (existente) {
        // Ya existe: devolvemos su estado (yaVoto o no)
        return res.json({
            votanteId: existente.id,
            yaVoto: existente.ya_voto,
            jornada: existente.jornada,
            mensaje: existente.ya_voto
                ? 'Esta cédula ya registró su voto.'
                : 'Votante verificado, puede votar.'
        });
    }
    // No existe: lo creamos
    const { data: nuevo, error: errorCrear } = await supabaseClient_1.supabase
        .from('votantes')
        .insert({ cedula, nombre, jornada: jornadaUpper })
        .select()
        .single();
    if (errorCrear) {
        return res.status(500).json({ error: errorCrear.message });
    }
    res.json({
        votanteId: nuevo.id,
        yaVoto: false,
        jornada: nuevo.jornada,
        mensaje: 'Votante registrado, puede votar.'
    });
});
exports.default = router;
