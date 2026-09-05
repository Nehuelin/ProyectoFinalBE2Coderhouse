import { Router } from 'express'
import { authorizeRole } from '../middlewares/authorizeRoles.middleware.js'
import { authenticate } from '../middlewares/passport.middleware.js';
import { changeEventStatus, createEvent, getEventById, getEvents, updateEvent } from '../controllers/event.controller.js';

const router = Router()

// PUBLIC
router.get("/", getEvents);
router.get("/:id", getEventById);

// RBAC DEPENDANT
router.post("/", authenticate("current", 401, "Autenticación requerida"), authorizeRole("organizer", "admin"), createEvent);
router.put("/:id", authenticate("current", 401, "Autenticación requerida"), authorizeRole("organizer", "admin"), updateEvent);
router.patch("/:id/status", authenticate("current", 401, "Autenticación requerida"), authorizeRole("organizer", "admin"), changeEventStatus);

export default router;