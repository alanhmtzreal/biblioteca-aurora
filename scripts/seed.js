// Carga datos iniciales (npm run seed). Se puede ejecutar varias veces: no duplica nada.
const mongoose = require('mongoose');
const conectarDB = require('../src/config/db');
const Usuario = require('../src/models/Usuario');
const Libro = require('../src/models/Libro');

const LIBROS = [
  { titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', isbn: '9780307474728', categoria: 'Literatura', anio: 1967, ejemplares: 4 },
  { titulo: 'El principito', autor: 'Antoine de Saint-Exupéry', isbn: '9780156012195', categoria: 'Infantil', anio: 1943, ejemplares: 6 },
  { titulo: 'Breve historia del tiempo', autor: 'Stephen Hawking', isbn: '9780553380163', categoria: 'Ciencias', anio: 1988, ejemplares: 2 },
  { titulo: 'Pedro Páramo', autor: 'Juan Rulfo', isbn: '9780802133908', categoria: 'Literatura', anio: 1955, ejemplares: 5 },
  { titulo: 'Sapiens', autor: 'Yuval Noah Harari', isbn: '9780062316097', categoria: 'Historia', anio: 2011, ejemplares: 3 },
  { titulo: 'Código limpio', autor: 'Robert C. Martin', isbn: '9780132350884', categoria: 'Tecnología', anio: 2008, ejemplares: 2 },
];

const sembrar = async () => {
  await conectarDB();

  const { SEED_EMAIL: email, SEED_PASSWORD: password } = process.env;
  if (!email || !password) throw new Error('Define SEED_EMAIL y SEED_PASSWORD en tu archivo .env');

  let usuario = await Usuario.findOne({ email });
  if (!usuario) usuario = await Usuario.create({ nombre: 'Bibliotecario', email, password });

  await Promise.all(LIBROS.map((libro) => Libro.updateOne(
    { isbn: libro.isbn },
    { $setOnInsert: { ...libro, creadoPor: usuario.id } },
    { upsert: true },
  )));

  console.log(`Listo: usuario ${email} y ${LIBROS.length} libros de ejemplo.`);
};

sembrar()
  .catch((error) => {
    console.error('Error al cargar los datos:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
