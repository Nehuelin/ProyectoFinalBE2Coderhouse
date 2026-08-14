import { Router } from 'express'
import { register, login, getCurrentUser, logout } from '../controllers/sessions.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import passport from '../config/passport.config.js'

const router = Router()

router.post('/register', passport.authenticate("register", { session: false }), register);

router.post('/login', passport.authenticate("login", { session: false }), login);

router.get('/current', passport.authenticate("current", { session: false }), getCurrentUser);

router.post('/logout', logout)

export default router