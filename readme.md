# Proyecto Final Coderhouse - Backend II (Pre-Entrega 4)

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

Ejemplo de `.env` para desarrollo local:

```dotenv
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/eventos
JWT_SECRET_KEY=reemplazar-por-un-secreto-seguro
JWT_EXPIRES_IN=1h
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

Las rutas disponibles al momento de escribir este readme son las siguientes:

| Método | Ruta | Estado HTTP | Descripción |
| --- | --- | :---: | --- |
| `GET` | `/api/health` | `200` | Comprueba que el servidor esté activo. |
| `GET` | `/api/events` | `200` | Devuelve la colección inicial de eventos; actualmente es un arreglo vacío. |
| `POST` | `/api/events` | `200` | Endpoint preliminar para crear un evento; aún no valida ni persiste el cuerpo enviado. |
| `GET` | `/api/sessions` | `200` | Devuelve un token de sesión de ejemplo. No autentica usuarios todavía. |
| `POST` | `/api/sessions/register` | `201` | Registra un usuario nuevo en el sistema. El mail provisto NO debe existir en la base de datos, y la contraseña debe tener al menos 8 caracteres. |
| `POST` | `/api/sessions/login` | `200` | Verifica las credenciales dadas y si son correctas devuelve el token de sesión para el usuario mediante cookies. |
| `GET` | `/api/sessions/current` | `200` | Verifica las cookies de sesion para mostrar datos del usuario que tiene la sesión actual  |
| `POST` | `/api/sessions/logout` | `200` | Elimina las cookies de sesión actual, sacando al usuario de la sesión |

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
- Busca el usuario en la base de datos mediante `usersRepository.getByEmail()`
- Compara la contraseña ingresada con la contraseña hasheada en la BD usando `isValidPassword()` de `hash.js`
- Retorna un mensaje genérico para credenciales inválidas (previene ataques de información sobre existencia de usuarios)

#### 3. Estrategia "current" (JWT Strategy)
Valida el JWT almacenado en cookies para identificar al usuario en peticiones autenticadas:
- Extrae el token JWT desde las cookies usando `cookieExtractor`
- Verifica la validez del token mediante la clave secreta `JWT_SECRET_KEY`
- Decodifica el payload del token para obtener el ID del usuario
- Busca el usuario en la base de datos mediante `usersRepository.getById()`
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



