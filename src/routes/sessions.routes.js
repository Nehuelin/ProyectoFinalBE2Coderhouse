import { Router } from 'express'
import { register, login, getCurrentUser, logout, githubCallback } from '../controllers/sessions.controller.js'
import { authenticate } from '../middlewares/passport.middleware.js';
import { authorizeRole } from '../middlewares/authorizeRoles.middleware.js';
import passport from '../config/passport.config.js';

const router = Router()

router.post('/register', authenticate('register', 400, 'Todos los campos son obligatorios'), register);

router.post('/login', authenticate('login', 400, 'Email y contraseña son obligatorios'), login);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', authenticate('github', 400, 'Credenciales invalidas'), githubCallback);

router.get('/current', authenticate('current', 401, 'Autenticación requerida'), authorizeRole("admin", "organizer"), getCurrentUser);

router.post('/logout', logout);


export default router