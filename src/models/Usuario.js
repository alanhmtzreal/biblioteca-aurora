const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false evita que el hash salga en las consultas normales
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

usuarioSchema.pre('save', async function cifrarPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

usuarioSchema.methods.compararPassword = function compararPassword(texto) {
  return bcrypt.compare(texto, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
