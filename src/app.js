const path = require('path');
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const librosRoutes = require('./routes/libros.routes');
const { rutaNoEncontrada, manejadorErrores } = require('./middleware/errores');

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN.length > 0 ? env.CORS_ORIGIN : false }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/libros', librosRoutes);

// Deben ir al final para atrapar lo que ninguna ruta atendió
app.use('/api', rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
