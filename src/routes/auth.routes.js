const { Router } = require('express');
const { registrar, iniciarSesion, perfil } = require('../controllers/auth.controller');
const { asincrono } = require('../middleware/errores');
const { validarRegistro, validarLogin } = require('../middleware/validar');
const requiereAuth = require('../middleware/auth');

const router = Router();

router.post('/register', validarRegistro, asincrono(registrar));
router.post('/login', validarLogin, asincrono(iniciarSesion));
router.get('/perfil', requiereAuth, asincrono(perfil));

module.exports = router;
