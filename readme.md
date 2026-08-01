# Proyecto Final Coderhouse - Backend II (Pre-Entrega 2)

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
| `NODE_ENV` | No | `development` | Identifica el entorno. Está preparada para configuración futura, pero todavía no modifica el comportamiento de la aplicación. |
| `JWT_SECRET` | No | `una-clave-segura` | Se utilizará para firmar tokens JWT. La autenticación JWT aún no está implementada. |

Ejemplo de `.env` para desarrollo local:

```dotenv
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/eventos
JWT_SECRET=reemplazar-por-un-secreto-seguro
```

> La aplicación intenta conectarse a MongoDB al iniciarse. Si la conexión falla, registra el error en la consola; la persistencia de los endpoints todavía no está implementada en esta pre-entrega.

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
Tambien se puede probar en apps dedicadas a endpoints como Insomnia o Postman
Por ejemplo:

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

Los recursos de usuarios y tickets ya cuentan con archivos base, pero sus rutas no están habilitadas. Las carpetas `dao`, `repositories` y `services`, así como algunas utilidades, son parte de la estructura prevista para las próximas entregas.

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


### Ejemplos

Obtener la sesión de ejemplo:

![alt text](/docs/images/get-user-session-token.png)

Listar eventos:

![alt text](/docs/images/get-all-events.png)

Probar el endpoint preliminar de creación:

![alt text](/docs/images/create-event.png)

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