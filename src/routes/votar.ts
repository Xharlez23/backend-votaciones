import { Router } from 'express';
import { db } from '../firebaseClient';

const router = Router();

router.post('/', async (req, res) => {
  const { votanteId, candidatoId, jornada } = req.body;
  if (!votanteId || !candidatoId || !jornada) {
    return res.status(400).json({ error: 'Faltan datos: votanteId, candidatoId y jornada son requeridos.' });
  }

  const votanteRef = db.collection('votantes').doc(votanteId);
  const votoRef = db.collection('votos').doc(votanteId); // mismo ID que el votante -> evita doble voto

  try {
    await db.runTransaction(async (t) => {
      const votanteDoc = await t.get(votanteRef);
      if (!votanteDoc.exists) {
        throw { status: 404, message: 'Votante no encontrado.' };
      }

      const votante: any = votanteDoc.data();
      if (votante.yaVoto) {
        throw { status: 409, message: 'Este votante ya emitió su voto anteriormente.' };
      }

      const votoDoc = await t.get(votoRef);
      if (votoDoc.exists) {
        throw { status: 409, message: 'Este votante ya emitió su voto anteriormente.' };
      }

      t.set(votoRef, {
        candidatoId,
        jornada: jornada.toUpperCase(),
        creadoEn: new Date().toISOString()
      });

      t.update(votanteRef, { yaVoto: true });
    });

    res.json({ mensaje: 'Voto registrado con éxito.' });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error al registrar el voto.' });
  }
});

export default router;