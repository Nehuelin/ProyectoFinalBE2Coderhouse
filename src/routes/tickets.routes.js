import { Router } from "express";

import {createTicket, getTicketById, getTickets, getMyTickets, cancelTicket} from "../controllers/ticket.controller.js";

import { authenticate } from "../middlewares/passport.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRoles.middleware.js";

const router = Router();

const anyRoles = [authenticate("current", 401, "Autenticación requerida"), authorizeRole("user", "organizer", "admin")];

// see my tickets
router.get("/my/tickets", authenticate("current", 401, "Autenticación requerida"), getMyTickets);

// PUBLIC
router.get("/", getTickets);
router.get("/:id", getTicketById);

// USER
router.post("/", ...anyRoles, createTicket);
router.patch("/:id/cancel", ...anyRoles, cancelTicket);

export default router;