import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

// POST /api/votar
// body: { votanteId, candidatoId, jornada }
router.post('/', async (req, res) => {
  const { votanteId, candidatoId, jornada } = req.body;

  if (!votanteId || !candidatoId || !jornada) {
    return res.status(400).json({ error: 'Faltan datos: votanteId, candidatoId y jornada son requeridos.' });
  }

  // 1. Verificar el estado actual del votante (doble chequeo de seguridad)
  const { data: votante, error: errorVotante } = await supabase
    .from('votantes')
    .select('*')
    .eq('id', votanteId)
    .single();

  if (errorVotante || !votante) {
    return res.status(404).json({ error: 'Votante no encontrado.' });
  }

  if (votante.ya_voto) {
    return res.status(409).json({ error: 'Este votante ya emitió su voto anteriormente.' });
  }

  // 2. Insertar el voto (la restricción UNIQUE en votante_id protege contra doble voto
  //    incluso si dos peticiones llegan al mismo tiempo)
  const { error: errorVoto } = await supabase
    .from('votos')
    .insert({
      votante_id: votanteId,
      candidato_id: candidatoId,
      jornada: jornada.toUpperCase()
    });

  if (errorVoto) {
    // Si el error es por violar el UNIQUE, significa que ya había votado
    if (errorVoto.code === '23505') {
      return res.status(409).json({ error: 'Este votante ya emitió su voto anteriormente.' });
    }
    return res.status(500).json({ error: errorVoto.message });
  }

  // 3. Marcar al votante como que ya votó
  const { error: errorUpdate } = await supabase
    .from('votantes')
    .update({ ya_voto: true })
    .eq('id', votanteId);

  if (errorUpdate) {
    return res.status(500).json({ error: errorUpdate.message });
  }

  res.json({ mensaje: 'Voto registrado con éxito.' });
});

export default router;