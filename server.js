const app = require('./src/app');
const env = require('./src/config/env');
const conectarDB = require('./src/config/db');

const iniciar = async () => {
  await conectarDB();
  app.listen(env.PORT, () => {
    console.log(`Servidor en http://localhost:${env.PORT}`);
  });
};

iniciar().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});
