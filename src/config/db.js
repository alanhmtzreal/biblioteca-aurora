const mongoose = require('mongoose');
const env = require('./env');

const conectarDB = async () => {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
};

module.exports = conectarDB;
