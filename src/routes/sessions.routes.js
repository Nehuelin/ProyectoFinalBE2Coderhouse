import { Router } from 'express'
import { register, login, getCurrentUser, logout } from '../controllers/sessions.controller.js'
import { auth } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/current', auth, getCurrentUser)
router.post('/logout', logout)

export default router