import { Router } from 'express'
import { getEvents, createEvent } from '../controllers/events.controller.js'
import { authorizeRole } from '../middlewares/authorizeRoles.middleware.js'

const router = Router()

router.get('/', getEvents);
router.post('/', authorizeRole("organizer", "email"), createEvent);

export default router