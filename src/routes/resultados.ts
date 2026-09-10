import { Router } from 'express';
import { db } from '../firebaseClient';

const router = Router();

router.get('/:jornada', async (req, res) => {
  const jornadaUpper = req.params.jornada.toUpperCase();
  if (!['MANANA', 'TARDE', 'NOCHE'].includes(jornadaUpper)) {
    return res.status(400).json({ error: 'Jornada inválida.' });
  }

  try {
    const candidatosSnap = await db.collection('candidatos')
      .where('jornada', '==', jornadaUpper)
      .where('activo', '==', true)
      .get();

    const votosSnap = await db.collection('votos')
      .where('jornada', '==', jornadaUpper)
      .get();

    const votos = votosSnap.docs.map(d => d.data());

    const resultados = candidatosSnap.docs.map(doc => {
      const c: any = doc.data();
      const total = votos.filter((v: any) => v.candidatoId === doc.id).length;
      return { id: doc.id, nombre: c.nombre, ficha: c.ficha, foto_url: c.foto_url, votos: total };
    });

    resultados.sort((a, b) => b.votos - a.votos);

    res.json({ jornada: jornadaUpper, totalVotos: votos.length, resultados });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;