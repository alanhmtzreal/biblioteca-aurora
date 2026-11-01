// Levanta un MongoDB local sin instalarlo (npm run db).
// La primera vez descarga el motor; los datos quedan en la carpeta .data/
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PUERTO = 27017;
const carpetaDatos = path.join(__dirname, '..', '.data');

const iniciar = async () => {
  fs.mkdirSync(carpetaDatos, { recursive: true });
  console.log('Iniciando MongoDB local...');

  const servidor = await MongoMemoryServer.create({
    instance: { port: PUERTO, dbPath: carpetaDatos, storageEngine: 'wiredTiger' },
  });

  console.log(`MongoDB listo en ${servidor.getUri()} (Ctrl+C para detener)`);

  process.on('SIGINT', async () => {
    await servidor.stop({ doCleanup: false });
    process.exit(0);
  });
};

iniciar().catch((error) => {
  console.error('No se pudo iniciar MongoDB:', error.message);
  process.exit(1);
});
