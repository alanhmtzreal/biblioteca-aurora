const Libro = require('../models/Libro');
const { ErrorApi } = require('../middleware/errores');

// Solo estos campos se toman del cuerpo; así el cliente no puede fijar creadoPor
const camposLibro = ({ titulo, autor, isbn, categoria, anio, ejemplares }) => ({
  titulo, autor, isbn: isbn.replace(/-/g, ''), categoria, anio, ejemplares,
});

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listar = async (req, res) => {
  const { q, categoria } = req.query;
  const filtro = {};

  if (typeof q === 'string' && q.trim()) {
    const buscado = new RegExp(escaparRegex(q.trim()), 'i');
    filtro.$or = [{ titulo: buscado }, { autor: buscado }];
  }
  if (typeof categoria === 'string' && categoria) filtro.categoria = categoria;

  const libros = await Libro.find(filtro).sort({ createdAt: -1 });
  res.json(libros);
};

const obtener = async (req, res) => {
  const libro = await Libro.findById(req.params.id);
  if (!libro) throw new ErrorApi(404, 'Libro no encontrado');
  res.json(libro);
};

const crear = async (req, res) => {
  const libro = await Libro.create({ ...camposLibro(req.body), creadoPor: req.usuario.id });
  res.status(201).json(libro);
};

const actualizar = async (req, res) => {
  const libro = await Libro.findByIdAndUpdate(req.params.id, camposLibro(req.body), {
    new: true,
    runValidators: true,
  });
  if (!libro) throw new ErrorApi(404, 'Libro no encontrado');
  res.json(libro);
};

const eliminar = async (req, res) => {
  const libro = await Libro.findByIdAndDelete(req.params.id);
  if (!libro) throw new ErrorApi(404, 'Libro no encontrado');
  res.status(204).end();
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
