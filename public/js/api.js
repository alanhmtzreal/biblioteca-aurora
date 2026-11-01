// Sesión del usuario y comunicación con el backend
const sesion = {
  guardar({ token, usuario }) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },
  cerrar() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },
  get token() {
    return localStorage.getItem('token');
  },
  get usuario() {
    return JSON.parse(localStorage.getItem('usuario'));
  },
};

// Error del API con la lista de detalles de validación, si la hay
class ErrorPeticion extends Error {
  constructor(status, mensaje, detalles = []) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

const peticion = async (ruta, { metodo = 'GET', cuerpo } = {}) => {
  const encabezados = {};
  if (cuerpo) encabezados['Content-Type'] = 'application/json';
  if (sesion.token) encabezados.Authorization = `Bearer ${sesion.token}`;

  let respuesta;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorPeticion(0, 'No se pudo conectar con el servidor');
  }

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new ErrorPeticion(respuesta.status, datos.error ?? 'Ocurrió un error', datos.detalles);
  }
  return datos;
};
