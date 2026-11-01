const mongoose = require('mongoose');

const CATEGORIAS = ['Literatura', 'Ciencias', 'Historia', 'Matemáticas', 'Tecnología', 'Arte', 'Infantil'];

const libroSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 150 },
    autor: { type: String, required: true, trim: true, maxlength: 100 },
    isbn: { type: String, required: true, unique: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIAS },
    anio: { type: Number, required: true, min: 1000 },
    ejemplares: { type: Number, required: true, min: 0, default: 1 },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Libro', libroSchema);
module.exports.CATEGORIAS = CATEGORIAS;
