import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { db } from '../firebaseClient';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function normalizarJornada(valor: string): string | null {
  const v = valor.trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quita tildes
  if (v.startsWith('MAN')) return 'MANANA';
  if (v.startsWith('TAR')) return 'TARDE';
  if (v.startsWith('NOC')) return 'NOCHE';
  return null;
}

// POST /api/admin/carga-masiva/aprendices  (multipart/form-data, campo "archivo")
router.post('/aprendices', upload.single('archivo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const filas: any[] = XLSX.utils.sheet_to_json(hoja, { defval: '' });

    const errores: { fila: number; motivo: string }[] = [];
    const validos: { cedula: string; nombre: string; ficha: string; programa: string; jornada: string }[] = [];

    filas.forEach((fila, index) => {
      const numFila = index + 2; // fila 1 es el encabezado del Excel

      const cedula = String(fila.cedula ?? fila.Cedula ?? fila.CEDULA ?? '').trim();
      const nombre = String(fila.nombre ?? fila.Nombre ?? fila.NOMBRE ?? '').trim();
      const ficha = String(fila.ficha ?? fila.Ficha ?? fila.FICHA ?? '').trim();
      const formacion = String(fila.formacion ?? fila.Formacion ?? fila.FORMACION ?? '').trim();
      const jornadaRaw = String(fila.jornada ?? fila.Jornada ?? fila.JORNADA ?? '').trim();

      if (!cedula || !nombre || !ficha || !formacion || !jornadaRaw) {
        errores.push({ fila: numFila, motivo: 'Faltan datos obligatorios (cédula, nombre, ficha, formación o jornada).' });
        return;
      }

      const jornada = normalizarJornada(jornadaRaw);
      if (!jornada) {
        errores.push({ fila: numFila, motivo: `Jornada "${jornadaRaw}" no reconocida. Usa Mañana, Tarde o Noche.` });
        return;
      }

      validos.push({ cedula, nombre, ficha, programa: formacion, jornada });
    });

    const TAMANO_LOTE = 400;
    let insertados = 0;

    for (let i = 0; i < validos.length; i += TAMANO_LOTE) {
      const lote = validos.slice(i, i + TAMANO_LOTE);
      const batch = db.batch();

      lote.forEach(a => {
        const ref = db.collection('aprendices').doc(a.cedula);
        batch.set(ref, {
          nombre: a.nombre,
          ficha: a.ficha,
          programa: a.programa,
          jornada: a.jornada
        });
      });

      await batch.commit();
      insertados += lote.length;
    }

    res.json({
      mensaje: `Carga completada: ${insertados} aprendices cargados.`,
      insertados,
      errores
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al procesar el archivo: ' + error.message });
  }
});

export default router;