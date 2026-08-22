import { Router } from 'express'
import { authorizeRole } from '../middlewares/authorizeRoles.middleware.js'
import { authenticate } from '../middlewares/passport.middleware.js'
import { getAllUsers } from '../controllers/users.controller.js';

const router = Router()

router.get('/', authenticate('current', 401, 'Autenticación requerida'), authorizeRole("admin"), getAllUsers);

export default router;