# Proyecto Final Coderhouse - Backend II (Pre-Entrega 5)

## Nombre del Proyecto
ParkEvent Solutions

## Descripción
ParkEvent Solutions es un software que se dedica a gestionar distintos tipos de eventos dentro de un parque tematico. 

## Tematicá elegida
Se eligió la gestión de eventos dentro de parques tematicos. Esto incluye shows, parades, festejos y meet & greets, entre otros.

## Tecnologías
- **Node.js** con módulos ES.
- **Express 5** para el servidor HTTP y las rutas de la API.
- **MongoDB** como base de datos.
- **Mongoose** para definir modelos y conectarse a MongoDB.
- **Passport.js** para autenticación y autorización.
- **dotenv** para cargar la configuración desde variables de entorno.
- **express-handlebars**, instalado para una futura capa de vistas (aún no configurado).
- **nodemon**, disponible como dependencia de desarrollo (el script actual de desarrollo utiliza el modo `--watch` nativo de Node.js).

## Requisitos previos

- [Node.js](https://nodejs.org/) **20.19 o superior**.
- npm (incluido con Node.js).
- Una instancia local o remota de MongoDB en ejecución.

## Instalación
1. Clonar el repositorio y entrar en la carpeta del proyecto:

   ```bash
   git clone https://github.com/Nehuelin/ProyectoFinalBE2Coderhouse.git
   cd ProyectoFinalBE2Coderhouse
   ```

2. Instalar las dependencias respetando el archivo `package-lock.json`:

   ```bash
   npm ci
   ```

3. Crear el archivo local de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

4. Completar los valores de `.env` según el entorno. Este archivo contiene información local o sensible y no debe subirse al repositorio.

## Configuración 
### Variables de entorno

| Variable | Requerida actualmente | Ejemplo | Descripción |
| --- | :---: | --- | --- |
| `PORT` | Sí | `8080` | Puerto en el que escucha el servidor HTTP. |
| `MONGO_URL` | Sí | `mongodb://127.0.0.1:27017/eventos` | URI de conexión a MongoDB. |
| `NODE_ENV` | Sí | `development` | Identifica el entorno. Se utiliza para aumentar la seguridad de los tokens JWT cuando su valor es `production`. |
| `JWT_SECRET_KEY` | Sí | `una-clave-segura` | Se utilizará para firmar tokens JWT. |
| `JWT_EXPIRES_IN` | Sí | `1h` | Se utilizará para establecer el tiempo de vigencia de los tokens JWT. |
| `GITHUB_CLIENT_ID` | Solo para login con GitHub | `tu-client-id` | Identificador de la OAuth App de GitHub. |
| `GITHUB_CLIENT_SECRET` | Solo para login con GitHub | `tu-client-secret` | Secreto de la OAuth App de GitHub. |
| `GITHUB_CALLBACK_URL` | Solo para login con GitHub | `http://localhost:8080/api/sessions/github/callback` | URL de callback registrada en la OAuth App de GitHub. |

Ejemplo de `.env` para desarrollo local:

```dotenv
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/eventos
JWT_SECRET_KEY=reemplazar-por-un-secreto-seguro
JWT_EXPIRES_IN=1h
GITHUB_CLIENT_ID=reemplazar-por-client-id
GITHUB_CLIENT_SECRET=reemplazar-por-client-secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/sessions/github/callback
```

> La aplicación intenta conectarse a MongoDB al iniciarse. Si la conexión falla, registra el error en la consola.

## Ejecución
### Desarrollo

Inicia el servidor y lo reinicia automáticamente cuando cambia un archivo:

```bash
npm run dev
```

Con `PORT=8080`, la API queda disponible en `http://localhost:8080`. Para comprobarla:

```bash
curl http://localhost:8080/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```
Tambien se puede probar en apps dedicadas a endpoints como Insomnia o Postman. Por ejemplo:

![alt text](/docs/images/api-health.png)


## Estructura de carpetas
```text
.
├── src/
│   ├── config/          # Configuración y conexión a la base de datos
│   ├── controllers/     # Controladores HTTP por recurso
│   ├── dao/             # Acceso directo a datos
│   ├── middlewares/     # Middlewares de Express
│   ├── models/          # Esquemas y modelos de Mongoose
│   ├── repositories/    # Abstracción de persistencia
│   ├── routes/          # Definición de endpoints por recurso
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades para errores, hash y JWT
│   ├── app.js           # Configuración de Express y montaje de rutas
│   └── server.js        # Punto de entrada y apertura del puerto HTTP
├── .env.example         # Plantilla de variables de entorno
├── package.json         
└── package-lock.json   
```

## Rutas disponibles

URL base local de ejemplo: `http://localhost:8080`.

Las rutas actualmente montadas en la aplicación son las siguientes:

| Método | Ruta | Estado HTTP | Protección | Descripción |
| --- | --- | :---: | --- | --- |
| `GET` | `/api/health` | `200` | Pública | Comprueba que el servidor esté activo. |
| `GET` | `/api/events` | `200` | Pública | Devuelve la colección inicial de eventos; actualmente es un arreglo vacío. |
| `POST` | `/api/events` | `200` | Rol requerido | Endpoint preliminar para crear un evento; aún no valida ni persiste el cuerpo enviado. |
| `POST` | `/api/sessions/register` | `201` | Pública | Registra un usuario nuevo. El email no debe existir y la contraseña debe tener al menos 8 caracteres. |
| `POST` | `/api/sessions/login` | `200` | Pública | Verifica las credenciales, crea la cookie JWT `currentUser` y devuelve el token. |
| `GET` | `/api/sessions/github` | Redirección | Pública | Inicia la autenticación con GitHub. |
| `GET` | `/api/sessions/github/callback` | `200` | Pública | Recibe la respuesta de GitHub, registra o recupera al usuario y crea la cookie JWT. |
| `GET` | `/api/sessions/current` | `200` | `admin` u `organizer` | Devuelve los datos del usuario de la sesión actual. |
| `POST` | `/api/sessions/logout` | `200` | Pública | Elimina la cookie de sesión actual. |
| `GET` | `/api/users` | `200` | `admin` | Devuelve todos los usuarios. |

La ruta `/api/tickets` todavía no está disponible: su router y controlador están vacíos y el router no está montado en `src/app.js`.

### Ejemplos

Listar eventos:

![alt text](/docs/images/get-all-events.png)

Probar el endpoint preliminar de creación:

![alt text](/docs/images/create-event.png)

## Uso de Passport.js para sesiones

Para los procesos de registro, login, sesión y logout se utiliza **passport.js**, que es un programa intermedio (middleware) de autenticación para Node.js que se integra de forma sencilla con Express.js. Su función principal es verificar la identidad de los usuarios en una aplicación web mediante módulos independientes llamados "estrategias".

### Estrategias de Passport.js

El proyecto implementa tres estrategias de Passport.js, configuradas en [src/config/passport.config.js](src/config/passport.config.js):

#### 1. Estrategia "register" (Local Strategy)
Valida y registra nuevos usuarios. Realiza las siguientes validaciones:
- Verifica que se proporcionen todos los campos requeridos: `first_name`, `last_name`, `email` y `password`
- Normaliza y valida el formato del email mediante funciones de `emailFunctions.js`
- Valida que la contraseña tenga una longitud mínima de 8 caracteres
- Previene duplicados: verifica que no exista otro usuario con el mismo email
- Utiliza la función `registerUser()` del `user.service.js` para crear el registro en la base de datos

Si alguna validación falla, Passport retorna un error con un `statusCode` y `message` específicos que el `error.middleware.js` captura y formatea para la respuesta HTTP.

#### 2. Estrategia "login" (Local Strategy)
Autentica usuarios verificando sus credenciales:
- Normaliza el email ingresado usando `emailFunctions.js`
- Valida que el formato del email sea correcto
- Busca el usuario en la base de datos mediante `userRepository.getByEmail()`
- Compara la contraseña ingresada con la contraseña hasheada en la BD usando `isValidPassword()` de `hash.js`
- Retorna un mensaje genérico para credenciales inválidas (previene ataques de información sobre existencia de usuarios)

#### 3. Estrategia "current" (JWT Strategy)
Valida el JWT almacenado en cookies para identificar al usuario en peticiones autenticadas:
- Extrae el token JWT desde las cookies usando `cookieExtractor`
- Verifica la validez del token mediante la clave secreta `JWT_SECRET_KEY`
- Decodifica el payload del token para obtener el ID del usuario
- Busca el usuario en la base de datos mediante `userRepository.getById()`
- Permite identificar al usuario actual en rutas protegidas

### Manejo de errores con `errors.js`

El archivo [src/utils/errors.js](src/utils/errors.js) define la clase `HttpError` que extiende la clase `Error` de JavaScript y añade propiedades específicas para HTTP:

```javascript
export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}
```

Esta clase se utiliza en toda la aplicación para lanzar errores con información estructurada:
- **statusCode**: El código HTTP a retornar (401, 409, 400, 500, etc.)
- **message**: El mensaje descriptivo del error
- **name**: Identifica el tipo de error

En el contexto de Passport:
- Las estrategias retornan objetos con `statusCode` y `message` via el callback `done()`
- El `error.middleware.js` captura estos errores y extrae el `statusCode` para construir la respuesta HTTP
- Los errores internos (5xx) ocultan información sensible en producción

### Middlewares de autenticación y error handling

#### `auth.middleware.js` - Protección de rutas
El middleware [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js) se utiliza en las rutas que requieren autenticación:
- Verifica que exista un token en las cookies (`req.cookies.currentUser`)
- Valida el token usando `verifyToken()` de `jwt.js`
- Si el token es válido, extrae el payload y adjunta los datos del usuario a `req.user`
- Si no hay token o es inválido, retorna un error 401 (Unauthorized)
- Permite que solo usuarios autenticados accedan a recursos protegidos

#### `error.middleware.js` - Centralización de errores
El middleware [src/middlewares/error.middleware.js](src/middlewares/error.middleware.js) es el último middleware en la cadena y captura todos los errores:
- Verifica si ya se envió una respuesta (si es así, delega al siguiente middleware)
- Extrae el `statusCode` del error (usa 500 como default)
- En producción, oculta los mensajes de errores 500 por seguridad
- Registra los errores 500 en la consola para debugging
- Retorna una respuesta JSON estructurada con el status y mensaje del error

**Flujo de integración:**
1. Passport intenta autenticar al usuario usando la estrategia correspondiente
2. Si hay error, Passport retorna un objeto con `statusCode` y `message`
3. El controlador lanza un `HttpError` con esa información
4. El `error.middleware.js` captura el error y lo formatea
5. La respuesta HTTP se envía con el código y mensaje apropiado

## Como registrar un usuario nuevo en el sistema

Para registrar un nuevo usuario en el sistema se debe utilizar el siguiente endpoint:

`POST /api/sessions/register`

El endpoint espera los siguiente campos:
```
{
   "first_name": "Primer nombre"
   "last_name": "Apellido"
   "email": "mimail@mail.com"
   "password": "unacontraseña123"
}
```
El sistema tiene las siguientes validaciones de seguridad:

- El mail debe tener un formato acorde.
- El mail ingresado no debe existir en la base de datos.
- La contraseña debe tener al menos 8 (ocho) caracteres.
- Se deben completar TODOS los campos.

Si no se cumple alguna de las validaciones el sistema tirará error y no se creará el usuario.

Ejemplo de registro

![alt text](/docs/images/user-register-ok.png)

Evidencia de creación de usuario en MongoDB

![alt text](/docs/images/mongodb-user-creation.png)

## Proceso de login / logout

Si el usuario está registrado en el sistema entonces debería poder loguearse poniendo su mail y contraseña.

![alt text](/docs/images/user-login-ok.png)

Si el login es exitoso entonces se creará una cookie que contendrá el token de sesión del usuario. 

![alt text](/docs/images/session-cookie-creation.png)

Si se intenta loguear con email o contraseñas incorrectas, se mostrará un mensaje genérico para prevenir ataques pasivos (como análisis de emails existentes en la base de datos).

![alt text](/docs/images/user-login-error.png)

El endpoint GET sessions/current permite obtener información sobre la sesión actual, incluida información sobre el usuario logueado actualmente. Esta información es obtenida a partir de la cookie creada en el proceso de login.

![alt text](/docs/images/get-user-session-token.png)

Si no se tiene el token, o el mismo está expirado o fue alterado (es decir, es invalido), entonces se mostrará un mensaje genérico de error.

![alt text](/docs/images/get-user-session-token-error.png)

Para hacer logout se utiliza el endpoint POST sessions/logout. Este endpoint borra la cookie creada con el login.

![alt text](/docs/images/user-logout.png)

Como se puede ver, la cookie ya no posee un valor, por lo que el token fue eliminado exitosamente.

![alt text](/docs/images/session-cookie-deletion.png)


## Login con GitHub

Además del login local mediante email y contraseña, es posible iniciar sesión con una cuenta de GitHub. El flujo es el siguiente:

1. Abrir `GET /api/sessions/github`.
2. La aplicación redirige a GitHub para solicitar autorización y acceso al email de la cuenta.
3. GitHub redirige a `GET /api/sessions/github/callback`.
4. El servidor registra al usuario si es la primera vez que ingresa, genera un JWT y lo guarda en la cookie `currentUser`.

Para habilitar este flujo se deben configurar las credenciales de una OAuth App de GitHub mediante `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` y `GITHUB_CALLBACK_URL`. El callback debe apuntar a `/api/sessions/github/callback` en la URL base del servidor.

![Login exitoso con GitHub](/docs/images/github-login-success.png)

## Roles y RBAC

El sistema utiliza control de acceso basado en roles (RBAC, por sus siglas en inglés). Cada usuario tiene uno de estos roles, almacenado en el campo `role`:

- **`user`**: usuario general. Puede consultar los eventos públicos y es el rol asignado por defecto a los registros nuevos.
- **`organizer`**: responsable de organizar eventos. Puede consultar eventos y acceder a las operaciones destinadas a organizadores.
- **`admin`**: administrador del sistema. Puede consultar todos los usuarios y acceder a las operaciones administrativas.

La tabla siguiente resume los permisos funcionales definidos para el proyecto:

| Acción | `user` | `organizer` | `admin` |
| --- | :---: | :---: | :---: |
| Ver eventos | Sí | Sí | Sí |
| Inscribirse a eventos | Sí | Opcional | Opcional |
| Crear eventos | No | Sí | Sí |
| Editar eventos propios | No | Sí | Sí |
| Editar cualquier evento | No | No | Sí |
| Administrar categorías | No | No | Sí |
| Ver todos los usuarios | No | No | Sí |
| Cambiar roles | No | No | Sí |

### RBAC de los endpoints implementados

| Endpoint | Acceso |
| --- | --- |
| `GET /api/health` | Público |
| `GET /api/events` | Público |
| `POST /api/events` | Organizador según la intención de la ruta |
| `GET /api/sessions/current` | `admin` u `organizer` |
| `GET /api/users` | `admin` |

Las operaciones de inscripción, edición de eventos, administración de categorías y cambio de roles todavía no tienen endpoints implementados.

## Rutas protegidas

Las rutas protegidas requieren que el cliente envíe la cookie `currentUser`, creada después de un login local o de GitHub. La cookie contiene un JWT firmado con `JWT_SECRET_KEY`; el servidor lo valida y obtiene el `id`, email y rol del usuario antes de autorizar la operación.

Actualmente están protegidas `/api/sessions/current` y `/api/users`. Ambas validan el JWT mediante la estrategia `current` de Passport y luego verifican el rol permitido. El endpoint `POST /api/events` también intenta aplicar autorización por rol, aunque todavía no ejecuta el middleware de autenticación y su lista de roles contiene `email` en lugar de `admin`; por eso debe considerarse una implementación pendiente antes de usarlo como endpoint protegido en producción.

## Diferencia entre errores 401 y 403

- **401 Unauthorized**: la solicitud no tiene una autenticación válida. Ocurre cuando falta la cookie `currentUser`, el JWT es inválido o expiró, o las credenciales de login no son correctas. La solución es autenticarse nuevamente o enviar credenciales válidas.
- **403 Forbidden**: el usuario sí está autenticado, pero su rol no tiene permisos para el recurso. Por ejemplo, un usuario con rol `user` que intenta consultar `GET /api/users` recibe este error; debe solicitar un rol autorizado.

En resumen, `401` significa “no se pudo identificar al usuario” y `403` significa “se identificó al usuario, pero no tiene autorización suficiente”.