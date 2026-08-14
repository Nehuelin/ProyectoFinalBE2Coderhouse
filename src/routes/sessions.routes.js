import { Router } from 'express'
import { register, login, getCurrentUser, logout } from '../controllers/sessions.controller.js'
import { authenticate } from '../middlewares/passport.middleware.js';

const router = Router()

router.post('/register', authenticate('register', 400, 'Todos los campos son obligatorios'), register);

router.post('/login', authenticate('login', 400, 'Email y contraseña son obligatorios'), login);

router.get('/current', authenticate('current', 401, 'Autenticación requerida'), getCurrentUser);

router.post('/logout', logout)

export default router