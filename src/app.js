import express from 'express'
import 'dotenv/config'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import './config/passport.config.js'
import { connectDB } from './config/database.js'
import { errorHandler } from './middlewares/error.middleware.js'
import usersRouter from './routes/users.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
import ticketsRouter from './routes/tickets.routes.js'
import eventsRouter from './routes/events.routes.js'
import categoriesRouter from './routes/categories.routes.js'

const app = express()

app.use(express.json())

connectDB()

app.use(cookieParser());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Servidor activo' 
  });
});

app.use('/api/users', usersRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/tickets', ticketsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/categories', categoriesRouter)

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;

  res.status(status).json({
    status: "error",
    message: err.message || "Error interno del servidor"
  });
});

app.use(errorHandler);

export default app;