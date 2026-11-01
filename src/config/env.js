// Carga las variables de .env y detiene la app si falta alguna obligatoria
require('dotenv').config({ quiet: true });

const obligatorias = ['MONGODB_URI', 'JWT_SECRET'];
const faltantes = obligatorias.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
  console.error(`Faltan variables de entorno: ${faltantes.join(', ')}. Revisa tu archivo .env`);
  process.exit(1);
}

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean),
};
