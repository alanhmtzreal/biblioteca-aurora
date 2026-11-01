const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ErrorApi } = require('./errores');

// Protege una ruta: exige "Authorization: Bearer <token>" con un JWT válido
const requiereAuth = (req, res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ErrorApi(401, 'Debes iniciar sesión para realizar esta operación'));
  }

  try {
    const { sub, nombre } = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    req.usuario = { id: sub, nombre };
    return next();
  } catch {
    return next(new ErrorApi(401, 'Tu sesión no es válida o ya expiró'));
  }
};

module.exports = requiereAuth;
