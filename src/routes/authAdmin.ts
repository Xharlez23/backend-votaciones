import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  if (usuario !== process.env.ADMIN_USER || contrasena !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  const token = jwt.sign({ usuario }, process.env.JWT_SECRET as string, { expiresIn: '8h' });
  res.json({ token });
});

export default router;