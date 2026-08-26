import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

// POST /api/votante/verificar
// body: { cedula }
router.post('/verificar', async (req, res) => {
  const { cedula } = req.body;

  if (!cedula) {
    return res.status(400).json({ error: 'La cédula es requerida.' });
  }

  // 1. Buscar al aprendiz en el padrón
  const { data: aprendiz, error: errorAprendiz } = await supabase
    .from('aprendices')
    .select('*')
    .eq('cedula', cedula)
    .maybeSingle();

  if (errorAprendiz) {
    return res.status(500).json({ error: errorAprendiz.message });
  }

  if (!aprendiz) {
    return res.status(404).json({ error: 'Esta cédula no está habilitada para votar.' });
  }

  // 2. Ver si ya existe registro en votantes
  const { data: existente, error: errorBusqueda } = await supabase
    .from('votantes')
    .select('*')
    .eq('cedula', cedula)
    .maybeSingle();

  if (errorBusqueda) {
    return res.status(500).json({ error: errorBusqueda.message });
  }

  if (existente) {
    return res.json({
      votanteId: existente.id,
      yaVoto: existente.ya_voto,
      nombre: aprendiz.nombre,
      ficha: aprendiz.ficha,
      programa: aprendiz.programa,
      jornada: existente.jornada,
      mensaje: existente.ya_voto
        ? 'Esta cédula ya registró su voto.'
        : 'Votante verificado, puede votar.'
    });
  }

  // 3. No existe: lo creamos usando los datos del padrón
  const { data: nuevo, error: errorCrear } = await supabase
    .from('votantes')
    .insert({
      cedula: aprendiz.cedula,
      nombre: aprendiz.nombre,
      jornada: aprendiz.jornada
    })
    .select()
    .single();

  if (errorCrear) {
    return res.status(500).json({ error: errorCrear.message });
  }

  res.json({
    votanteId: nuevo.id,
    yaVoto: false,
    nombre: aprendiz.nombre,
    ficha: aprendiz.ficha,
    programa: aprendiz.programa,
    jornada: nuevo.jornada,
    mensaje: 'Votante registrado, puede votar.'
  });
});

export default router;