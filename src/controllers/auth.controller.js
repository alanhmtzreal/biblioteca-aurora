const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Usuario = require('../models/Usuario');
const { ErrorApi } = require('../middleware/errores');

const crearToken = ({ id, nombre }) =>
  jwt.sign({ nombre }, env.JWT_SECRET, { subject: id, expiresIn: env.JWT_EXPIRES_IN, algorithm: 'HS256' });

const respuestaSesion = (usuario) => ({
  token: crearToken(usuario),
  usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
});

const registrar = async (req, res) => {
  const { nombre, email, password } = req.body;
  const usuario = await Usuario.create({ nombre, email, password });
  res.status(201).json(respuestaSesion(usuario));
};

const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() }).select('+password');

  // El mismo mensaje en ambos casos: no revela si el correo existe
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw new ErrorApi(401, 'Correo o contraseña incorrectos');
  }

  res.json(respuestaSesion(usuario));
};

const perfil = async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id);
  if (!usuario) throw new ErrorApi(401, 'Tu sesión no es válida o ya expiró');
  res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
};

module.exports = { registrar, iniciarSesion, perfil };
