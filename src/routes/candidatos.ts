import { Router } from 'express';
import { db } from '../firebaseClient';

const router = Router();

router.get('/:jornada', async (req, res) => {
  const jornadaUpper = req.params.jornada.toUpperCase();
  if (!['MANANA', 'TARDE', 'NOCHE'].includes(jornadaUpper)) {
    return res.status(400).json({ error: 'Jornada inválida.' });
  }

  try {
    const snapshot = await db.collection('candidatos')
      .where('jornada', '==', jornadaUpper)
      .where('activo', '==', true)
      .get();

    const candidatos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    candidatos.sort((a: any, b: any) => (a.numero_tarjeton ?? 0) - (b.numero_tarjeton ?? 0));

    res.json(candidatos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;