import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

// GET /api/candidatos/:jornada  -> ej: /api/candidatos/MANANA
router.get('/:jornada', async (req, res) => {
  const { jornada } = req.params;
  const jornadaUpper = jornada.toUpperCase();

  if (!['MANANA', 'TARDE', 'NOCHE'].includes(jornadaUpper)) {
    return res.status(400).json({ error: 'Jornada inválida. Usa MANANA, TARDE o NOCHE.' });
  }

  const { data, error } = await supabase
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

export default router;