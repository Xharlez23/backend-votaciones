import { Router } from 'express';
import { db } from '../firebaseClient';

const router = Router();

// GET /api/admin/candidatos  -> lista todos (de todas las jornadas)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('candidatos').get();
    const candidatos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    candidatos.sort((a: any, b: any) =>
      a.jornada.localeCompare(b.jornada) || (a.numero_tarjeton ?? 0) - (b.numero_tarjeton ?? 0)
    );
    res.json(candidatos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/candidatos  -> crear uno nuevo
router.post('/', async (req, res) => {
  const { nombre, ficha, jornada, numero_tarjeton, foto_url, activo } = req.body;

  if (!nombre || !ficha || !jornada || numero_tarjeton === undefined) {
    return res.status(400).json({ error: 'Nombre, ficha, jornada y número de tarjetón son obligatorios.' });
  }

  try {
    const docRef = await db.collection('candidatos').add({
      nombre,
      ficha,
      jornada: jornada.toUpperCase(),
      numero_tarjeton: Number(numero_tarjeton),
      foto_url: foto_url || '',
      activo: activo !== undefined ? activo : true
    });

    res.json({ mensaje: 'Candidato creado con éxito.', id: docRef.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/candidatos/:id  -> editar
router.put('/:id', async (req, res) => {
  const { nombre, ficha, jornada, numero_tarjeton, foto_url, activo } = req.body;

  try {
    const ref = db.collection('candidatos').doc(req.params.id);
    const existente = await ref.get();
    if (!existente.exists) {
      return res.status(404).json({ error: 'No se encontró el candidato.' });
    }

    await ref.update({
      nombre,
      ficha,
      jornada: jornada.toUpperCase(),
      numero_tarjeton: Number(numero_tarjeton),
      foto_url: foto_url || '',
      activo: activo !== undefined ? activo : true
    });

    res.json({ mensaje: 'Candidato actualizado con éxito.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/candidatos/:id  -> eliminar
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('candidatos').doc(req.params.id).delete();
    res.json({ mensaje: 'Candidato eliminado con éxito.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;