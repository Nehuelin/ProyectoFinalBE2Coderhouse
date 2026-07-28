import express from 'express'
import { connectDB } from './config/database.js'
import 'dotenv/config'
// import usersRouter from './routes/users.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
// import ticketsRouter from './routes/tickets.routes.js'
import eventsRouter from './routes/events.routes.js'

const app = express()

app.use(express.json())

connectDB()

// app.use('/api/users', usersRouter)
app.use('/api/session', sessionsRouter)
// app.use('/api/tickets', ticketsRouter)
app.use('/api/events', eventsRouter)

app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Servidor activo' 
  });
});

export default app;