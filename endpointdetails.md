# Backend Endpoint Guide

This file is the secondary README for the ParkEvent Solutions backend. It describes the HTTP contract implemented by the current codebase and provides payload examples.

## Table of Contents

- [1. Before Testing](#1-before-testing)
	- [Base URL](#base-url)
	- [Required services and environment variables](#required-services-and-environment-variables)
	- [Insomnia setup](#insomnia-setup)
	- [Common response shapes](#common-response-shapes)
- [2. Health Check](#2-health-check)
	- [`GET /api/health`](#get-apihealth)
- [3. Sessions and Authentication](#3-sessions-and-authentication)
	- [`POST /api/sessions/register`](#post-apisessionsregister)
	- [`POST /api/sessions/login`](#post-apisessionslogin)
	- [`GET /api/sessions/current`](#get-apisessionscurrent)
	- [`POST /api/sessions/logout`](#post-apisessionslogout)
	- [GitHub login](#github-login)
		- [`GET /api/sessions/github`](#get-apisessionsgithub)
		- [`GET /api/sessions/github/callback`](#get-apisessionsgithubcallback)
- [4. Users](#4-users)
	- [`GET /api/users`](#get-apiusers)
- [5. Categories](#5-categories)
	- [`GET /api/categories`](#get-apicategories)
	- [`GET /api/categories/:id`](#get-apicategoriesid)
	- [`POST /api/categories`](#post-apicategories)
	- [`PUT /api/categories/:id`](#put-apicategoriesid)
	- [`PATCH /api/categories/:id/status`](#patch-apicategoriesidstatus)
	- [`DELETE /api/categories/:id`](#delete-apicategoriesid)
- [6. Events](#6-events)
	- [Event data model](#event-data-model)
	- [`GET /api/events`](#get-apievents)
	- [`GET /api/events/:id`](#get-apieventsid)
	- [`POST /api/events`](#post-apievents)
	- [`PUT /api/events/:id`](#put-apieventsid)
	- [`PATCH /api/events/:id/status`](#patch-apieventsidstatus)
- [7. Tickets](#7-tickets)
	- [Ticket data model](#ticket-data-model)
	- [`GET /api/tickets`](#get-api-tickets)
	- [`GET /api/tickets/:id`](#get-api-ticketsid)
	- [`GET /api/tickets/my/tickets`](#get-api-ticketsmy-tickets)
	- [`POST /api/tickets`](#post-api-tickets)
	- [`PATCH /api/tickets/:id/cancel`](#patch-api-ticketsidcancel)
- [8. Authorization Test Matrix](#8-authorization-test-matrix)
- [9. Useful Negative Tests](#9-useful-negative-tests)



## 1. Before Testing

### Base URL

For local development, use:

```text
http://localhost:8080
```

The port comes from the `PORT` environment variable. Every endpoint in this document is relative to that base URL.

### Required services and environment variables

Start MongoDB first, then create a `.env` file with at least:

```dotenv
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/eventos
JWT_SECRET_KEY=replace-with-a-long-secret
JWT_EXPIRES_IN=1h
```

GitHub login additionally requires `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL`. The application currently constructs the GitHub Passport strategy during startup, so these values may also be needed just to start the server even when you only test local login.

Run the API with:

```bash
npm run dev
```

or:

```bash
npm start
```

### Insomnia setup

For JSON requests:

1. Select the **JSON** body type.
2. Add `Content-Type: application/json` if Insomnia does not add it automatically.
3. Send the request.

Protected endpoints authenticate through the `currentUser` cookie. They do **not** read an `Authorization: Bearer ...` header. Insomnia normally stores the cookie returned by the login request. If it does not, open the cookie manager for `localhost` and create:

```text
Name: currentUser
Value: <token returned by POST /api/sessions/login>
```

You can also send it as a header:

```http
Cookie: currentUser=<token>
```

The cookie is HTTP-only, so browser JavaScript cannot read it, but Insomnia can retain and send it.

### Common response shapes

Successful responses generally use:

```json
{
	"status": "success",
	"data": {}
}
```

Errors generally use:

```json
{
	"status": "error",
	"message": "Description of the problem"
}
```

Invalid or missing authentication normally results in `401`; an authenticated user without the required role receives `403`; invalid input normally results in `400`; and a missing resource normally results in `404`.

## 2. Health Check

### `GET /api/health`

Checks that Express is responding. It is public and does not require a cookie.

**Request**

```http
GET http://localhost:8080/api/health
```

**Response: `200 OK`**

```json
{
	"status": "ok",
	"message": "Servidor activo"
}
```

This confirms that the HTTP server is reachable. It does not prove that MongoDB is available.

## 3. Sessions and Authentication

### `POST /api/sessions/register`

Creates a local user. This endpoint is public.

**Request body**

```json
{
	"first_name": "Ana",
	"last_name": "Gomez",
	"email": "ana.gomez@example.com",
	"password": "securepass123"
}
```

All four fields are required by the Passport registration strategy. The email is normalized and must have a valid format. The password must contain at least eight characters. The email must not already exist.

**Response: `201 Created`**

```json
{
	"status": "success",
	"message": "Usuario registrado correctamente"
}
```

The password is hashed before persistence. A successful registration does not create a session cookie; perform login separately.

**Possible errors**

- `400`: missing fields, invalid email, or password shorter than eight characters.
- `409`: another user already has the email.

### `POST /api/sessions/login`

Authenticates a local user and creates the session cookie used by protected routes.

**Request body**

```json
{
	"email": "ana.gomez@example.com",
	"password": "securepass123"
}
```

The email is normalized before lookup. Invalid email format and incorrect credentials are rejected.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Usuario logueado correctamente",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The response also sends a `Set-Cookie` header similar to:

```http
Set-Cookie: currentUser=<jwt>; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax
```

The JWT payload contains the user ID, email, and role. Use the stored cookie for category administration, event management, `sessions/current`, and `users` requests.

**Possible errors**

- `400`: missing email or password, or invalid email format.
- `401`: credentials are invalid.

### `GET /api/sessions/current`

Returns the currently authenticated user. It requires a valid `currentUser` cookie and accepts roles `admin` and `organizer`.

**Request**

```http
GET http://localhost:8080/api/sessions/current
Cookie: currentUser=<jwt>
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"payload": {
		"id": "665f1a2b3c4d5e6f78901234",
		"email": "ana.gomez@example.com",
		"role": "organizer"
	}
}
```

The password is not included in this response.

### `POST /api/sessions/logout`

Clears the session cookie. It is public, so it can be called even when the cookie is already missing or expired.

**Request**

```http
POST http://localhost:8080/api/sessions/logout
```

No body is required.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Sesión cerrada"
}
```

### GitHub login

#### `GET /api/sessions/github`

Starts the GitHub OAuth flow. Open this URL in a browser or use an Insomnia request that follows redirects:

```http
GET http://localhost:8080/api/sessions/github
```

The server redirects to GitHub. The user authorizes the application, then GitHub redirects to the callback URL configured in `GITHUB_CALLBACK_URL`.

#### `GET /api/sessions/github/callback`

This route is called by GitHub, not normally by manually writing a JSON request. GitHub sends query parameters such as:

```text
?code=<temporary-code>&state=<state-value>
```

On success, the backend registers or retrieves the GitHub user, creates the same `currentUser` cookie, and returns:

```json
{
	"status": "success",
	"message": "Usuario logueado correctamente con GitHub",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

This flow requires valid GitHub OAuth credentials and a callback URL registered with GitHub.

## 4. Users

### `GET /api/users`

Returns all users. It requires a valid `currentUser` cookie and the `admin` role.

**Request**

```http
GET http://localhost:8080/api/users
Cookie: currentUser=<admin-jwt>
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"users": [
		{
			"_id": "665f1a2b3c4d5e6f78901234",
			"first_name": "Ana",
			"last_name": "Gomez",
			"email": "ana.gomez@example.com",
			"role": "admin",
			"provider": "local",
			"providerId": null,
			"createdAt": "2026-08-26T12:00:00.000Z",
			"updatedAt": "2026-08-26T12:00:00.000Z"
		}
	]
}
```

The exact list fields depend on the stored MongoDB documents. Passwords are stored in the model, so treat this endpoint as administrative and do not expose its response to untrusted clients.

## 5. Categories

Categories are stored in MongoDB with `name`, `slug`, `description`, `isActive`, `createdAt`, and `updatedAt`. The public listing and public detail endpoint return active categories only.

### `GET /api/categories`

Lists active categories ordered by `name` ascending. No authentication is required.

**Request**

```http
GET http://localhost:8080/api/categories
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"data": [
		{
			"_id": "665f1a2b3c4d5e6f78901234",
			"name": "Shows",
			"slug": "shows",
			"description": "Espectáculos y presentaciones del parque",
			"isActive": true,
			"createdAt": "2026-08-26T12:00:00.000Z",
			"updatedAt": "2026-08-26T12:00:00.000Z"
		}
	]
}
```

An empty database returns `data: []`.

### `GET /api/categories/:id`

Returns one active category. Replace `:id` with a MongoDB ObjectId.

**Request**

```http
GET http://localhost:8080/api/categories/665f1a2b3c4d5e6f78901234
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"data": {
		"_id": "665f1a2b3c4d5e6f78901234",
		"name": "Shows",
		"slug": "shows",
		"description": "Espectáculos y presentaciones del parque",
		"isActive": true
	}
}
```

An invalid ID returns `400`; an unknown or inactive category returns `404`.

### `POST /api/categories`

Creates a category. Requires an authenticated `admin`.

**Request headers**

```http
Content-Type: application/json
Cookie: currentUser=<admin-jwt>
```

**Request body with automatic slug**

```json
{
	"name": "Meet and Greets",
	"description": "Encuentros con personajes del parque"
}
```

The service generates `meet-and-greets` from the name. Accented characters are normalized and spaces or punctuation become hyphens.

**Request body with explicit slug**

```json
{
	"name": "Shows Especiales",
	"slug": "shows-especiales",
	"description": "Presentaciones especiales",
	"isActive": true
}
```

`name` is required. `slug` is optional, but if supplied it must produce a non-empty slug. `description` is optional. `isActive` defaults to `true`.

**Response: `201 Created`**

```json
{
	"status": "success",
	"message": "Categoría creada",
	"data": {
		"_id": "665f1a2b3c4d5e6f78901234",
		"name": "Meet and Greets",
		"slug": "meet-and-greets",
		"description": "Encuentros con personajes del parque",
		"isActive": true,
		"createdAt": "2026-08-26T12:00:00.000Z",
		"updatedAt": "2026-08-26T12:00:00.000Z"
	}
}
```

Duplicate `name` or `slug` values are rejected by MongoDB's unique indexes. Use a different value when testing repeated requests.

### `PUT /api/categories/:id`

Updates the editable fields of a category. Requires an authenticated `admin`. Despite using `PUT`, the implementation accepts a partial update.

**Request body**

```json
{
	"name": "Shows nocturnos",
	"slug": "shows-nocturnos",
	"description": "Espectáculos realizados durante la noche"
}
```

Accepted fields are `name`, `slug`, and `description`. `isActive` is intentionally changed through the status endpoint. At least one accepted field must be present.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Categoría actualizada",
	"data": {
		"_id": "665f1a2b3c4d5e6f78901234",
		"name": "Shows nocturnos",
		"slug": "shows-nocturnos",
		"description": "Espectáculos realizados durante la noche",
		"isActive": true
	}
}
```

### `PATCH /api/categories/:id/status`

Activates or deactivates a category. Requires an authenticated `admin`.

**Deactivate**

```http
PATCH http://localhost:8080/api/categories/665f1a2b3c4d5e6f78901234/status
```

```json
{
	"isActive": false
}
```

**Activate again**

```json
{
	"isActive": true
}
```

`isActive` must be a JSON boolean, not the string `"false"` or `"true"`.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Estado de la categoría actualizado",
	"data": {
		"_id": "665f1a2b3c4d5e6f78901234",
		"name": "Shows",
		"slug": "shows",
		"description": "Espectáculos del parque",
		"isActive": false
	}
}
```

### `DELETE /api/categories/:id`

Performs a logical delete by setting `isActive` to `false`. Requires an authenticated `admin`.

**Request**

```http
DELETE http://localhost:8080/api/categories/665f1a2b3c4d5e6f78901234
Cookie: currentUser=<admin-jwt>
```

No body is required.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Categoría eliminada",
	"data": {
		"_id": "665f1a2b3c4d5e6f78901234",
		"name": "Shows",
		"slug": "shows",
		"isActive": false
	}
}
```

The MongoDB document is retained so existing events can continue referencing it. The category disappears from the public category list and cannot be used when creating or updating an event.

## 6. Events

Events can be read publicly. Creating and editing requires `organizer` or `admin`. An organizer can edit only events they own; an admin can edit any event.

### Event data model

An event contains:

| Field | Type | Required | Allowed values or behavior |
| --- | --- | --- | --- |
| `title` | string | Yes | Event title |
| `description` | string | Yes | Event description |
| `category` | ObjectId string | Yes | Must refer to an active category |
| `eventType` | string | Yes | `show`, `parade`, `celebration`, `meet-and-greet`, `workshop` |
| `ageRecommendation` | string | No | `all-ages`, `children`, `teens`, `adults`; defaults to `all-ages` |
| `durationMinutes` | number | Yes | Greater than zero |
| `parkArea` | string | Yes | Park area |
| `date` | ISO date string | Yes | Must be a valid future date on create/update |
| `location` | string | Yes | Event location |
| `capacity` | number | Yes | Greater than zero |
| `price` | number | Yes | Zero or greater |
| `status` | string | No | `draft`, `published`, `cancelled`, `finished`; defaults to `draft` on create |
| `organizer` | ObjectId | Set by server | The authenticated user's ID |

### `GET /api/events`

Lists events with pagination, filters, and sorting. It is public.

**Basic request**

```http
GET http://localhost:8080/api/events
```

**Supported query parameters**

| Parameter | Example | Meaning |
| --- | --- | --- |
| `status` | `published` | Filters by event status |
| `category` | `665f1a2b3c4d5e6f78901234` | Filters by category ID |
| `location` | `Main%20Stage` | Case-insensitive partial match |
| `dateFrom` | `2026-09-01T00:00:00.000Z` | Events on or after this date |
| `dateTo` | `2026-09-30T23:59:59.000Z` | Events on or before this date |
| `page` | `2` | Page number, minimum 1; default 1 |
| `limit` | `20` | Results per page, from 1 to 100; default 10 |
| `sort` | `-price` | Sort field; prefix with `-` for descending |

Allowed sort fields are `date`, `price`, `title`, `category`, `location`, `eventType`, `durationMinutes`, and `parkArea`.

**Example filtered request**

```http
GET http://localhost:8080/api/events?status=published&category=665f1a2b3c4d5e6f78901234&dateFrom=2026-09-01&dateTo=2026-09-30&page=1&limit=10&sort=-price
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"data": [
		{
			"_id": "777f1a2b3c4d5e6f78901234",
			"title": "Night Parade",
			"description": "A parade through the central avenue",
			"category": {
				"_id": "665f1a2b3c4d5e6f78901234",
				"name": "Shows",
				"slug": "shows",
				"description": "Espectáculos del parque"
			},
			"eventType": "parade",
			"ageRecommendation": "all-ages",
			"durationMinutes": 45,
			"parkArea": "Central Avenue",
			"date": "2026-09-15T22:00:00.000Z",
			"location": "Main Gate",
			"capacity": 1000,
			"price": 0,
			"status": "published",
			"organizer": {
				"_id": "888f1a2b3c4d5e6f78901234",
				"first_name": "Ana",
				"last_name": "Gomez",
				"email": "ana.gomez@example.com",
				"role": "organizer"
			}
		}
	],
	"page": 1,
	"limit": 10,
	"total": 1,
	"totalPages": 1
}
```

The response populates both `category` and `organizer`. Invalid dates, category IDs, status values, or sort fields return `400`.

### `GET /api/events/:id`

Returns one event by ID. It is public and includes populated category and organizer data.

**Request**

```http
GET http://localhost:8080/api/events/777f1a2b3c4d5e6f78901234
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"data": {
		"_id": "777f1a2b3c4d5e6f78901234",
		"title": "Night Parade",
		"description": "A parade through the central avenue",
		"category": {
			"_id": "665f1a2b3c4d5e6f78901234",
			"name": "Shows",
			"slug": "shows",
			"description": "Espectáculos del parque"
		},
		"eventType": "parade",
		"ageRecommendation": "all-ages",
		"durationMinutes": 45,
		"parkArea": "Central Avenue",
		"date": "2026-09-15T22:00:00.000Z",
		"location": "Main Gate",
		"capacity": 1000,
		"price": 0,
		"status": "published",
		"organizer": {
			"_id": "888f1a2b3c4d5e6f78901234",
			"first_name": "Ana",
			"last_name": "Gomez",
			"email": "ana.gomez@example.com",
			"role": "organizer"
		}
	}
}
```

Invalid IDs return `400`; an unknown ID returns `404`.

### `POST /api/events`

Creates an event. Requires a valid session cookie and role `organizer` or `admin`.

**Request headers**

```http
Content-Type: application/json
Cookie: currentUser=<organizer-or-admin-jwt>
```

**Request body**

```json
{
	"title": "Night Parade",
	"description": "A parade through the central avenue",
	"category": "665f1a2b3c4d5e6f78901234",
	"eventType": "parade",
	"ageRecommendation": "all-ages",
	"durationMinutes": 45,
	"parkArea": "Central Avenue",
	"date": "2026-09-15T22:00:00.000Z",
	"location": "Main Gate",
	"capacity": 1000,
	"price": 0,
	"status": "draft"
}
```

`organizer` must not be sent by the client; it is assigned from the authenticated user. The category must exist and be active. The date must be in the future. The service requires all fields shown except `ageRecommendation` and `status`, which have defaults. The Mongoose schema also requires `capacity` and `price` even though the service's missing-field message does not list them.

**Response: `201 Created`**

```json
{
	"status": "success",
	"message": "Evento creado",
	"data": {
		"_id": "777f1a2b3c4d5e6f78901234",
		"title": "Night Parade",
		"description": "A parade through the central avenue",
		"category": "665f1a2b3c4d5e6f78901234",
		"eventType": "parade",
		"ageRecommendation": "all-ages",
		"durationMinutes": 45,
		"parkArea": "Central Avenue",
		"date": "2026-09-15T22:00:00.000Z",
		"location": "Main Gate",
		"capacity": 1000,
		"price": 0,
		"status": "draft",
		"organizer": "888f1a2b3c4d5e6f78901234"
	}
}
```

### `PUT /api/events/:id`

Updates an event. Requires `organizer` or `admin`. Organizers may update only their own events; admins may update any event. Cancelled events cannot be modified.

Although this is a `PUT` route, the implementation accepts a partial body. Accepted fields are `title`, `description`, `category`, `eventType`, `ageRecommendation`, `durationMinutes`, `parkArea`, `date`, `location`, `capacity`, and `price`. `status` and `organizer` cannot be changed here.

**Request**

```http
PUT http://localhost:8080/api/events/777f1a2b3c4d5e6f78901234
Cookie: currentUser=<owner-or-admin-jwt>
```

```json
{
	"title": "Night Parade - Extended",
	"durationMinutes": 60,
	"price": 5
}
```

If changing `category`, it must be an active category. If changing `date`, it must remain in the future. The service revalidates the event type/theme values and capacity/price.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Evento actualizado",
	"data": {
		"_id": "777f1a2b3c4d5e6f78901234",
		"title": "Night Parade - Extended",
		"durationMinutes": 60,
		"price": 5,
		"status": "draft"
	}
}
```

An empty update returns `400`; a non-owner organizer receives `403`; a missing event returns `404`.

### `PATCH /api/events/:id/status`

Changes only the event status. Requires `organizer` or `admin`, with the same ownership rule as update.

**Request**

```http
PATCH http://localhost:8080/api/events/777f1a2b3c4d5e6f78901234/status
Cookie: currentUser=<owner-or-admin-jwt>
```

```json
{
	"status": "published"
}
```

Allowed values are `draft`, `published`, `cancelled`, and `finished`. A cancelled event cannot change status. A finished event cannot be published.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Estado del evento actualizado",
	"data": {
		"_id": "777f1a2b3c4d5e6f78901234",
		"title": "Night Parade",
		"status": "published"
	}
}
```

## 7. Tickets

Tickets represent a reservation for an event by a user. The backend stores the buyer, the event, the quantity, a generated code, and a cancellation state.

### Ticket data model

| Field | Type | Required | Allowed values or behavior |
| --- | --- | --- | --- |
| `user` | ObjectId | Yes | Owner of the ticket |
| `event` | ObjectId | Yes | Event being booked |
| `status` | string | No | `active` or `cancelled`; defaults to `active` |
| `quantity` | number | No | Greater than zero; defaults to `1` |
| `code` | string | Auto-generated | Unique ticket code |
| `cancelledAt` | Date | No | Set when the ticket is cancelled |

### `GET /api/tickets`

Lists tickets with pagination, filtering, and sorting. This route is public and does not require authentication.

**Request**

```http
GET http://localhost:8080/api/tickets?status=active&eventId=777f1a2b3c4d5e6f78901234&page=1&limit=10&sort=-createdAt
```

**Supported query parameters**

| Parameter | Example | Meaning |
| --- | --- | --- |
| `status` | `active` | Filters by ticket status |
| `eventId` | `777f1a2b3c4d5e6f78901234` | Filters by event ID |
| `page` | `1` | Page number, minimum 1 |
| `limit` | `10` | Results per page, from 1 to 100 |
| `sort` | `-createdAt` | Sort field; prefix with `-` for descending |

Allowed sort fields are `createdAt`, `quantity`, `status`, and `code`.

**Response: `200 OK`**

```json
{
	"status": "success",
	"data": [
		{
			"_id": "998f1a2b3c4d5e6f78901234",
			"user": "888f1a2b3c4d5e6f78901234",
			"event": "777f1a2b3c4d5e6f78901234",
			"status": "active",
			"quantity": 2,
			"code": "PARK-AB12CD",
			"cancelledAt": null,
			"createdAt": "2026-09-05T18:00:00.000Z",
			"updatedAt": "2026-09-05T18:00:00.000Z"
		}
	],
	"page": 1,
	"limit": 10,
	"total": 1,
	"totalPages": 1
}
```

An invalid `status` or `sort` value returns `400`.

### `GET /api/tickets/:id`

Returns one ticket by ID. It is public and does not require authentication.

**Request**

```http
GET http://localhost:8080/api/tickets/998f1a2b3c4d5e6f78901234
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"data": {
		"_id": "998f1a2b3c4d5e6f78901234",
		"user": "888f1a2b3c4d5e6f78901234",
		"event": "777f1a2b3c4d5e6f78901234",
		"status": "active",
		"quantity": 2,
		"code": "PARK-AB12CD",
		"cancelledAt": null,
		"createdAt": "2026-09-05T18:00:00.000Z",
		"updatedAt": "2026-09-05T18:00:00.000Z"
	}
}
```

An invalid ID returns `400`; an unknown ticket returns `404`.

### `GET /api/tickets/my/tickets`

Returns the current user's tickets. Requires a valid `currentUser` cookie and any of the roles `user`, `organizer`, or `admin`.

**Request**

```http
GET http://localhost:8080/api/tickets/my/tickets
Cookie: currentUser=<jwt>
```

**Response: `200 OK`**

```json
{
	"status": "success",
	"data": [
		{
			"_id": "998f1a2b3c4d5e6f78901234",
			"user": "888f1a2b3c4d5e6f78901234",
			"event": "777f1a2b3c4d5e6f78901234",
			"status": "active",
			"quantity": 2,
			"code": "PARK-AB12CD",
			"cancelledAt": null,
			"createdAt": "2026-09-05T18:00:00.000Z",
			"updatedAt": "2026-09-05T18:00:00.000Z"
		}
	],
	"page": 1,
	"limit": 10,
	"total": 1,
	"totalPages": 1
}
```

### `POST /api/tickets`

Creates a ticket for an event. Requires a valid session cookie and role `user`, `organizer`, or `admin`.

**Request headers**

```http
Content-Type: application/json
Cookie: currentUser=<user-or-organizer-or-admin-jwt>
```

**Request body**

```json
{
	"eventId": "777f1a2b3c4d5e6f78901234",
	"quantity": 2
}
```

The API validates that:

- `eventId` is required and must be a valid MongoDB ObjectId
- the event exists
- the event is `published`
- the event date is still in the future
- the user does not already have an active ticket for that event
- enough seats remain for the requested quantity

**Response: `201 Created`**

```json
{
	"status": "success",
	"message": "Ticket creado",
	"data": {
		"_id": "998f1a2b3c4d5e6f78901234",
		"user": "888f1a2b3c4d5e6f78901234",
		"event": "777f1a2b3c4d5e6f78901234",
		"status": "active",
		"quantity": 2,
		"code": "PARK-AB12CD",
		"cancelledAt": null,
		"createdAt": "2026-09-05T18:00:00.000Z",
		"updatedAt": "2026-09-05T18:00:00.000Z"
	}
}
```

Possible errors include `400` for invalid payloads or dates, `404` when the event is missing, and `409` or `400` for duplicate or capacity-related conditions depending on the exact validation path.

### `PATCH /api/tickets/:id/cancel`

Cancels an existing ticket. Requires a valid session cookie and role `user`, `organizer`, or `admin`.

A user may cancel only their own ticket unless they are an `admin`. An already cancelled ticket cannot be cancelled again.

**Request**

```http
PATCH http://localhost:8080/api/tickets/998f1a2b3c4d5e6f78901234/cancel
Cookie: currentUser=<owner-or-admin-jwt>
```

No body is required.

**Response: `200 OK`**

```json
{
	"status": "success",
	"message": "Ticket cancelado",
	"data": {
		"_id": "998f1a2b3c4d5e6f78901234",
		"user": "888f1a2b3c4d5e6f78901234",
		"event": "777f1a2b3c4d5e6f78901234",
		"status": "cancelled",
		"quantity": 2,
		"code": "PARK-AB12CD",
		"cancelledAt": "2026-09-05T18:30:00.000Z",
		"createdAt": "2026-09-05T18:00:00.000Z",
		"updatedAt": "2026-09-05T18:30:00.000Z"
	}
}
```

If the event date has already passed, the cancellation is rejected.

## 8. Authorization Test Matrix

Use these quick checks to verify authentication and RBAC in Insomnia:

| Test | Expected result |
| --- | --- |
| `GET /api/categories` without cookie | `200` |
| `POST /api/categories` without cookie | `401` |
| `POST /api/categories` with `user` cookie | `403` |
| `POST /api/categories` with `admin` cookie | `201` |
| `POST /api/events` with `user` cookie | `403` |
| `POST /api/events` with `organizer` cookie | `201` if body is valid |
| `GET /api/users` with `organizer` cookie | `403` |
| `GET /api/users` with `admin` cookie | `200` |
| Any protected endpoint with an expired or altered cookie | `401` |

## 9. Useful Negative Tests

These requests help verify validation:

```json
// Category: missing name
{}
```

```json
// Category: wrong boolean type
{
	"isActive": "false"
}
```

```json
// Event: invalid enum
{
	"eventType": "concert"
}
```

```json
// Event: past date
{
	"date": "2020-01-01T12:00:00.000Z"
}
```

```json
// Event status: invalid value
{
	"status": "archived"
}
```

The API's error middleware returns the error message in Spanish, even though this guide is written in English.
