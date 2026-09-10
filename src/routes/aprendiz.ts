import { Router } from 'express';
import { db } from '../firebaseClient';

const router = Router();

router.get('/:cedula', async (req, res) => {
  try {
    const doc = await db.collection('aprendices').doc(req.params.cedula).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'No se encontró un aprendiz con esa cédula.' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;