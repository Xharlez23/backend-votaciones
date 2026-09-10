import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import candidatosRouter from './routes/candidatos';
import votanteRouter from './routes/votantes';
import votarRouter from './routes/votar';
import resultadosRouter from './routes/resultados';
import aprendizRouter from './routes/aprendiz';
import aprendicesAdminRouter from './routes/aprendicesAdmin';
import candidatosAdminRouter from './routes/candidatosAdmin';
import cargaMasivaRouter from './routes/cargaMasiva';
import authAdminRouter from './routes/authAdmin';
import { verificarToken } from './middleware/verificarToken';
// ...
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API de votaciones SENA funcionando' });
});

app.use('/api/candidatos', candidatosRouter);
app.use('/api/votante', votanteRouter);
app.use('/api/votar', votarRouter);
app.use('/api/resultados', resultadosRouter);
app.use('/api/aprendiz', aprendizRouter);
app.use('/api/admin/auth', authAdminRouter); // login, sin proteger

app.use('/api/admin/aprendices', verificarToken, aprendicesAdminRouter);
app.use('/api/admin/candidatos', verificarToken, candidatosAdminRouter);
app.use('/api/admin/carga-masiva', verificarToken, cargaMasivaRouter);
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});