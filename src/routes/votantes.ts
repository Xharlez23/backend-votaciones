import { Router } from 'express';
import { db } from '../firebaseClient';

const router = Router();

router.post('/verificar', async (req, res) => {
  const { cedula } = req.body;
  if (!cedula) return res.status(400).json({ error: 'La cédula es requerida.' });

  try {
    const aprendizDoc = await db.collection('aprendices').doc(cedula).get();
    if (!aprendizDoc.exists) {
      return res.status(404).json({ error: 'Esta cédula no está habilitada para votar.' });
    }
    const aprendiz: any = aprendizDoc.data();

    const votanteRef = db.collection('votantes').doc(cedula);
    const votanteDoc = await votanteRef.get();

    if (votanteDoc.exists) {
      const votante: any = votanteDoc.data();
      return res.json({
        votanteId: cedula,
        yaVoto: votante.yaVoto,
        nombre: aprendiz.nombre,
        ficha: aprendiz.ficha,
        programa: aprendiz.programa,
        jornada: votante.jornada,
        mensaje: votante.yaVoto ? 'Esta cédula ya registró su voto.' : 'Votante verificado, puede votar.'
      });
    }

    await votanteRef.set({
      nombre: aprendiz.nombre,
      jornada: aprendiz.jornada,
      yaVoto: false,
      creadoEn: new Date().toISOString()
    });

    res.json({
      votanteId: cedula,
      yaVoto: false,
      nombre: aprendiz.nombre,
      ficha: aprendiz.ficha,
      programa: aprendiz.programa,
      jornada: aprendiz.jornada,
      mensaje: 'Votante registrado, puede votar.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;