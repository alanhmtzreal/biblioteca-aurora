// Error con código HTTP que los controladores y middleware pueden lanzar
class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

// Permite usar async en las rutas: un rechazo llega a manejadorErrores
const asincrono = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const rutaNoEncontrada = (req, res, next) => {
  next(new ErrorApi(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

// Traduce cada tipo de error a una respuesta JSON uniforme
// eslint-disable-next-line no-unused-vars
const manejadorErrores = (error, req, res, next) => {
  let { status = 500, message: mensaje, detalles } = error;

  if (error.name === 'ValidationError') {
    status = 400;
    mensaje = 'Datos inválidos';
    detalles = Object.values(error.errors).map((e) => e.message);
  } else if (error.name === 'CastError') {
    status = 400;
    mensaje = `Valor inválido para ${error.path}`;
  } else if (error.code === 11000) {
    status = 409;
    mensaje = `Ya existe un registro con ese ${Object.keys(error.keyValue)[0]}`;
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    mensaje = 'El cuerpo de la petición no es JSON válido';
  } else if (status >= 500) {
    console.error(error);
    mensaje = 'Error interno del servidor';
  }

  res.status(status).json({ error: mensaje, ...(detalles && { detalles }) });
};

module.exports = { ErrorApi, asincrono, rutaNoEncontrada, manejadorErrores };
