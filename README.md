# Biblioteca Aurora

Aplicación full stack para gestionar el catálogo de una biblioteca escolar (sector educativo). Cualquier persona puede consultar los libros; para agregarlos, editarlos o eliminarlos hay que iniciar sesión.

**Tecnologías:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, dotenv, cors, HTML, CSS y JavaScript.

## Estructura

```
server.js                  Punto de entrada: conecta la BD y levanta el servidor
src/
  app.js                   Configuración de Express, middleware y rutas
  config/env.js            Lee y valida las variables de entorno
  config/db.js             Conexión a MongoDB
  models/                  Esquemas Usuario y Libro
  controllers/             Lógica de autenticación y del CRUD
  routes/                  Definición de endpoints
  middleware/auth.js       Verifica el JWT
  middleware/validar.js    Validaciones de entrada
  middleware/errores.js    Manejo centralizado de errores
public/                    Frontend (login.html, index.html, styles.css, js/)
scripts/mongo-local.js     MongoDB local sin instalación
scripts/seed.js            Datos iniciales
postman/                   Colección de Postman con pruebas de la API
```

## Cómo ejecutarla en local

Requiere Node.js 18 o superior.

```bash
npm install
copy .env.example .env
```

Edita `.env`: pon un `JWT_SECRET` propio y una `SEED_PASSWORD`. Luego, en una terminal:

```bash
npm run db
```

Y en otra terminal:

```bash
npm run seed
npm start
```

Abre http://localhost:3000 y entra con `SEED_EMAIL` y `SEED_PASSWORD`. Si ya tienes MongoDB instalado, omite `npm run db`.

## API

Base: `/api`. Las respuestas son JSON. Los errores tienen la forma `{ "error": "...", "detalles": ["..."] }`.

| Método | Ruta | Token | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/salud` | No | Estado del servidor | 200 |
| POST | `/auth/register` | No | Crea un usuario y devuelve un token | 201, 400, 409 |
| POST | `/auth/login` | No | Inicia sesión y devuelve un token | 200, 400, 401 |
| GET | `/auth/perfil` | Sí | Datos del usuario de la sesión | 200, 401 |
| GET | `/libros` | No | Lista libros. Filtros: `?q=` y `?categoria=` | 200 |
| GET | `/libros/:id` | No | Obtiene un libro | 200, 400, 404 |
| POST | `/libros` | Sí | Crea un libro | 201, 400, 401, 409 |
| PUT | `/libros/:id` | Sí | Actualiza un libro | 200, 400, 401, 404, 409 |
| DELETE | `/libros/:id` | Sí | Elimina un libro | 204, 400, 401, 404 |

El token se envía en el encabezado `Authorization: Bearer <token>`.

Ejemplo de cuerpo para crear o actualizar un libro:

```json
{
  "titulo": "Rayuela",
  "autor": "Julio Cortázar",
  "isbn": "9788437604572",
  "categoria": "Literatura",
  "anio": 1963,
  "ejemplares": 3
}
```

Categorías válidas: Literatura, Ciencias, Historia, Matemáticas, Tecnología, Arte, Infantil.

## Pruebas con Postman

Importa `postman/Biblioteca-Aurora.postman_collection.json` en Postman y ejecútala con **Run collection**, con el servidor encendido. Cada ejecución crea su propio usuario de prueba y deja el catálogo como estaba. Para probar otro servidor, cambia la variable `baseUrl`.

## Despliegue en la nube

1. Crea un clúster gratuito en MongoDB Atlas y copia su cadena de conexión.
2. En Render, crea un **Web Service** desde este repositorio. El archivo `render.yaml` ya define los comandos.
3. Define la variable `MONGODB_URI`. Render genera `JWT_SECRET` automáticamente.
4. Para cargar los datos iniciales, ejecuta `npm run seed` en local con `MONGODB_URI` apuntando a Atlas.
