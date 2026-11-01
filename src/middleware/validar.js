const mongoose = require('mongoose');
const { CATEGORIAS } = require('../models/Libro');
const { ErrorApi } = require('./errores');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esTexto = (valor) => typeof valor === 'string' && valor.trim() !== '';
const esEntero = (valor) => Number.isInteger(valor);

// Crea un middleware a partir de una función que devuelve la lista de errores
const validar = (reglas) => (req, res, next) => {
  const errores = reglas(req.body ?? {});
  if (errores.length > 0) return next(new ErrorApi(400, 'Datos inválidos', errores));
  return next();
};

const validarRegistro = validar(({ nombre, email, password }) => {
  const errores = [];
  if (!esTexto(nombre) || nombre.trim().length < 2) errores.push('El nombre debe tener al menos 2 caracteres');
  if (!esTexto(email) || !REGEX_EMAIL.test(email)) errores.push('El correo no es válido');
  if (typeof password !== 'string' || password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres');
  return errores;
});

// Solo se aceptan textos: evita inyecciones como { "email": { "$gt": "" } }
const validarLogin = validar(({ email, password }) => {
  if (esTexto(email) && esTexto(password)) return [];
  return ['Escribe tu correo y tu contraseña'];
});

const validarLibro = validar(({ titulo, autor, isbn, categoria, anio, ejemplares }) => {
  const errores = [];
  const anioMaximo = new Date().getFullYear() + 1;

  if (!esTexto(titulo)) errores.push('El título es obligatorio');
  if (!esTexto(autor)) errores.push('El autor es obligatorio');
  if (!esTexto(isbn) || !/^(\d{10}|\d{13})$/.test(isbn.replace(/-/g, ''))) {
    errores.push('El ISBN debe tener 10 o 13 dígitos');
  }
  if (!CATEGORIAS.includes(categoria)) errores.push(`La categoría debe ser una de: ${CATEGORIAS.join(', ')}`);
  if (!esEntero(anio) || anio < 1000 || anio > anioMaximo) errores.push(`El año debe estar entre 1000 y ${anioMaximo}`);
  if (!esEntero(ejemplares) || ejemplares < 0) errores.push('Los ejemplares deben ser un entero mayor o igual a 0');
  return errores;
});

const validarId = (req, res, next) => {
  if (mongoose.isValidObjectId(req.params.id)) return next();
  return next(new ErrorApi(400, 'El identificador no es válido'));
};

module.exports = { validarRegistro, validarLogin, validarLibro, validarId };
