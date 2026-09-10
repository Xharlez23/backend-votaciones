import { Router } from 'express';
import { db } from '../firebaseClient';

const router = Router();

// GET /api/admin/aprendices  -> lista todos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('aprendices').get();
    const aprendices = snapshot.docs.map(doc => ({ cedula: doc.id, ...doc.data() }));
    aprendices.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    res.json(aprendices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/aprendices  -> crear uno nuevo
router.post('/', async (req, res) => {
  const { cedula, nombre, ficha, programa, jornada } = req.body;

  if (!cedula || !nombre || !ficha || !programa || !jornada) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const ref = db.collection('aprendices').doc(cedula);
    const existente = await ref.get();
    if (existente.exists) {
      return res.status(409).json({ error: 'Ya existe un aprendiz registrado con esa cédula.' });
    }

    await ref.set({ nombre, ficha, programa, jornada: jornada.toUpperCase() });
    res.json({ mensaje: 'Aprendiz creado con éxito.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/aprendices/:cedula  -> editar
router.put('/:cedula', async (req, res) => {
  const { nombre, ficha, programa, jornada } = req.body;

  try {
    const ref = db.collection('aprendices').doc(req.params.cedula);
    const existente = await ref.get();
    if (!existente.exists) {
      return res.status(404).json({ error: 'No se encontró un aprendiz con esa cédula.' });
    }

    await ref.update({ nombre, ficha, programa, jornada: jornada.toUpperCase() });
    res.json({ mensaje: 'Aprendiz actualizado con éxito.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/aprendices/:cedula  -> eliminar
router.delete('/:cedula', async (req, res) => {
  try {
    await db.collection('aprendices').doc(req.params.cedula).delete();
    res.json({ mensaje: 'Aprendiz eliminado con éxito.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;