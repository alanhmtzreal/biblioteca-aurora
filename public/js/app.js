const CATEGORIAS = ['Literatura', 'Ciencias', 'Historia', 'Matemáticas', 'Tecnología', 'Arte', 'Infantil'];

const lista = document.querySelector('#libros');
const plantilla = document.querySelector('#plantilla-libro');
const resumen = document.querySelector('#resumen');
const vacio = document.querySelector('#vacio');
const aviso = document.querySelector('#aviso');
const buscar = document.querySelector('#buscar');
const filtroCategoria = document.querySelector('#filtro-categoria');
const btnNuevo = document.querySelector('#btn-nuevo');
const btnEntrar = document.querySelector('#btn-entrar');
const btnSalir = document.querySelector('#btn-salir');
const saludo = document.querySelector('#saludo');

const dialogoLibro = document.querySelector('#dialogo-libro');
const formLibro = document.querySelector('#form-libro');
const tituloDialogo = document.querySelector('#titulo-dialogo');
const erroresLibro = document.querySelector('#errores-libro');

const dialogoEliminar = document.querySelector('#dialogo-eliminar');
const textoEliminar = document.querySelector('#texto-eliminar');

let libros = [];
let idEnEdicion = null;
let idPorEliminar = null;
let temporizadorAviso;
let temporizadorBusqueda;

const mostrarAviso = (texto, esError = false) => {
  aviso.textContent = texto;
  aviso.hidden = false;
  aviso.classList.toggle('aviso-error', esError);
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { aviso.hidden = true; }, 4000);
};

const actualizarSesion = () => {
  const conSesion = Boolean(sesion.token);
  btnEntrar.hidden = conSesion;
  btnSalir.hidden = !conSesion;
  btnNuevo.hidden = !conSesion;
  saludo.textContent = conSesion ? `Hola, ${sesion.usuario?.nombre ?? ''}` : '';
};

// Si el token venció, se limpia la sesión y se pide entrar de nuevo
const manejarError = (error) => {
  if (error.status === 401) {
    sesion.cerrar();
    actualizarSesion();
    dialogoLibro.close();
    dialogoEliminar.close();
    renderizar();
  }
  mostrarAviso(error.message, true);
};

const crearTarjeta = (libro) => {
  const tarjeta = plantilla.content.cloneNode(true);
  const item = tarjeta.querySelector('.libro');

  item.dataset.id = libro._id;
  // textContent evita que los datos se interpreten como HTML
  item.querySelector('.libro-categoria').textContent = libro.categoria;
  item.querySelector('.libro-titulo').textContent = libro.titulo;
  item.querySelector('.libro-autor').textContent = libro.autor;
  item.querySelector('.libro-anio').textContent = libro.anio;
  item.querySelector('.libro-isbn').textContent = libro.isbn;
  item.querySelector('.libro-ejemplares').textContent = libro.ejemplares;
  item.querySelector('.libro-acciones').hidden = !sesion.token;

  return tarjeta;
};

const renderizar = () => {
  lista.replaceChildren(...libros.map(crearTarjeta));
  vacio.hidden = libros.length > 0;
  resumen.textContent = `${libros.length} ${libros.length === 1 ? 'título' : 'títulos'} en el catálogo`;
};

const cargarLibros = async () => {
  const parametros = new URLSearchParams();
  if (buscar.value.trim()) parametros.set('q', buscar.value.trim());
  if (filtroCategoria.value) parametros.set('categoria', filtroCategoria.value);

  try {
    libros = await peticion(`/libros?${parametros}`);
    renderizar();
  } catch (error) {
    resumen.textContent = '';
    mostrarAviso(error.message, true);
  }
};

const abrirFormulario = (libro = null) => {
  idEnEdicion = libro?._id ?? null;
  tituloDialogo.textContent = libro ? 'Editar libro' : 'Agregar libro';
  formLibro.reset();
  erroresLibro.replaceChildren();

  if (libro) {
    ['titulo', 'autor', 'isbn', 'categoria', 'anio', 'ejemplares'].forEach((campo) => {
      formLibro.elements[campo].value = libro[campo];
    });
  }

  dialogoLibro.showModal();
  formLibro.elements.titulo.focus();
};

const leerFormulario = () => {
  const { titulo, autor, isbn, categoria, anio, ejemplares } = Object.fromEntries(new FormData(formLibro));
  return { titulo, autor, isbn, categoria, anio: Number(anio), ejemplares: Number(ejemplares) };
};

const mostrarErroresFormulario = (mensajes) => {
  erroresLibro.replaceChildren(...mensajes.map((texto) => {
    const li = document.createElement('li');
    li.textContent = texto;
    return li;
  }));
};

// ---------- Eventos ----------
formLibro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const cuerpo = leerFormulario();
  const editando = Boolean(idEnEdicion);

  try {
    await peticion(editando ? `/libros/${idEnEdicion}` : '/libros', {
      metodo: editando ? 'PUT' : 'POST',
      cuerpo,
    });
    dialogoLibro.close();
    mostrarAviso(editando ? 'Libro actualizado.' : 'Libro agregado.');
    await cargarLibros();
  } catch (error) {
    if (error.status === 400 || error.status === 409) {
      mostrarErroresFormulario(error.detalles?.length ? error.detalles : [error.message]);
    } else {
      manejarError(error);
    }
  }
});

lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;

  const { id } = boton.closest('.libro').dataset;
  const libro = libros.find(({ _id }) => _id === id);

  if (boton.dataset.accion === 'editar') {
    abrirFormulario(libro);
  } else {
    idPorEliminar = id;
    textoEliminar.textContent = `¿Seguro que quieres eliminar "${libro.titulo}"? Esta acción no se puede deshacer.`;
    dialogoEliminar.showModal();
  }
});

document.querySelector('#btn-si-eliminar').addEventListener('click', async () => {
  try {
    await peticion(`/libros/${idPorEliminar}`, { metodo: 'DELETE' });
    dialogoEliminar.close();
    mostrarAviso('Libro eliminado.');
    await cargarLibros();
  } catch (error) {
    dialogoEliminar.close();
    manejarError(error);
  }
});

document.querySelector('#btn-no-eliminar').addEventListener('click', () => dialogoEliminar.close());
document.querySelector('#btn-cancelar').addEventListener('click', () => dialogoLibro.close());
btnNuevo.addEventListener('click', () => abrirFormulario());

btnSalir.addEventListener('click', () => {
  sesion.cerrar();
  actualizarSesion();
  renderizar();
});

document.querySelector('#filtros').addEventListener('submit', (evento) => evento.preventDefault());
filtroCategoria.addEventListener('change', cargarLibros);
buscar.addEventListener('input', () => {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(cargarLibros, 250);
});

// ---------- Inicio ----------
const opcionesCategoria = CATEGORIAS.map((categoria) => new Option(categoria, categoria));
filtroCategoria.append(...opcionesCategoria);
document.querySelector('#categoria').append(...opcionesCategoria.map((o) => o.cloneNode(true)));

actualizarSesion();
cargarLibros();
