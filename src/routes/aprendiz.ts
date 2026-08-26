import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

// GET /api/aprendiz/:cedula
router.get('/:cedula', async (req, res) => {
  const { cedula } = req.params;
  console.log(`Buscando aprendiz con cédula: ${cedula}`);
  const { data, error } = await supabase
    .from('aprendices')
    .select('*')
    .eq('cedula', cedula)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'No se encontró un aprendiz con esa cédula.' });
  }

  res.json(data);
});

export default router;