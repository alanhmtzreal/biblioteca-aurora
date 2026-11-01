const { Router } = require('express');
const libros = require('../controllers/libros.controller');
const { asincrono } = require('../middleware/errores');
const { validarLibro, validarId } = require('../middleware/validar');
const requiereAuth = require('../middleware/auth');

const router = Router();

// Lectura abierta: cualquiera puede consultar el catálogo
router.get('/', asincrono(libros.listar));
router.get('/:id', validarId, asincrono(libros.obtener));

// Escritura protegida: requiere iniciar sesión
router.post('/', requiereAuth, validarLibro, asincrono(libros.crear));
router.put('/:id', requiereAuth, validarId, validarLibro, asincrono(libros.actualizar));
router.delete('/:id', requiereAuth, validarId, asincrono(libros.eliminar));

module.exports = router;
