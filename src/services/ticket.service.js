import mongoose from "mongoose";
import { TicketRepository } from "../repositories/ticket.repository.js";
import { EventRepository } from "../repositories/event.repository.js";
import { generateTicketCode } from "../utils/ticketcode.js";
import { sendTicketConfirmationEmail } from "../services/email.service.js";

const VALID_STATUSES = ["active", "cancelled"];

const businessError = (message, status = 400) => Object.assign(new Error(message), { status });

export class TicketService {
  constructor() {
    this.ticketRepository = new TicketRepository();
    this.eventRepository = new EventRepository();
  }

  validateObjectId(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw businessError("ID de ticket inválido", 400);
    }
  }

  validateStatus(status) {
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      throw businessError(`Status inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`);
    }
  }

  async createTicket(data, user) {
    const { eventId, quantity = 1 } = data;

    if (!eventId) {
      throw businessError("eventId es obligatorio");
    }

    this.validateObjectId(eventId);

    if (quantity !== undefined && Number(quantity) <= 0) {
      throw businessError("La cantidad debe ser mayor que 0");
    }

    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw businessError("Evento no encontrado", 404);
    }

    if (event.status !== "published") {
      throw businessError("El evento no está publicado");
    }

    if (event.date <= new Date()) {
      throw businessError("El evento ya ha pasado");
    }

    const existingTicket = await this.ticketRepository.findByUserAndEvent(user._id, eventId);

    if (existingTicket) {
      throw businessError("Ya tienes un ticket activo para este evento");
    }

    const reserved = await this.ticketRepository.getReservedTicketsCount(eventId);
    const available = event.capacity - reserved;

    if (available < quantity) {
      throw businessError("No hay suficientes entradas disponibles");
    }

    const code = generateTicketCode();

    const ticket = await this.ticketRepository.create({
      user: user._id,
      event: eventId,
      quantity,
      code
    });

    sendTicketConfirmationEmail(user.email, user.first_name, event.title, code).catch(error => {console.error("Error al enviar email de confirmación:", error)});

    return ticket;
  }

  async getTicketById(id) {
    this.validateObjectId(id);

    const ticket = await this.ticketRepository.findById(id);

    if (!ticket) {
      throw businessError("Ticket no encontrado", 404);
    }

    return ticket;
  }

  async getTickets(query, user) {
    const {status, eventId, page = 1, limit = 10, sort = "-createdAt"} = query;

    this.validateStatus(status);

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const filter = {};

    if (status) filter.status = status;
    if (eventId) filter.event = eventId;

    const allowedSortFields = ["createdAt", "quantity", "status", "code"];
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;

    if (!allowedSortFields.includes(sortField)) {
      throw businessError(`Campo de ordenamiento inválido. Permitidos: ${allowedSortFields.join(", ")}`);
    }

    const sortObject = {[sortField]: sort.startsWith("-") ? -1 : 1};

    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await Promise.all([
      this.ticketRepository.findAll(filter, {
        skip,
        limit: currentLimit,
        sort: sortObject
      }),
      this.ticketRepository.count(filter)
    ]);

    return {
      data,
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit)
    };
  }

  async getTicketsByUser(userId, query) {
    const {status, page = 1, limit = 10, sort = "-createdAt"} = query;

    this.validateObjectId(userId);
    this.validateStatus(status);

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const filter = { user: userId };

    if (status) filter.status = status;

    const allowedSortFields = ["createdAt", "quantity", "status", "code"];
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;

    if (!allowedSortFields.includes(sortField)) {
      throw businessError(`Campo de ordenamiento inválido. Permitidos: ${allowedSortFields.join(", ")}`);
    }

    const sortObject = {[sortField]: sort.startsWith("-") ? -1 : 1};

    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await Promise.all([
      this.ticketRepository.findAll(filter, {
        skip,
        limit: currentLimit,
        sort: sortObject
      }),
      this.ticketRepository.count(filter)
    ]);

    return {
      data,
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit)
    };
  }

  async assertCanManage(ticket, user) {
    const isAdmin = user.role === "admin";

    if (isAdmin) return;

    const isOwner = ticket.user?._id ? ticket.user._id.toString() === user._id.toString() : ticket.user.toString() === user._id.toString();

    if (!isOwner) {
      throw businessError("No tenés permisos para modificar este ticket", 403);
    }
  }

  async cancelTicket(id, user) {
    const ticket = await this.getTicketById(id);

    if (ticket.status === "cancelled") {
      throw businessError("El ticket ya está cancelado");
    }

    await this.assertCanManage(ticket, user);

    const event = await this.eventRepository.findById(ticket.event._id);

    if (event.date <= new Date()) {
      throw businessError("No se puede cancelar un ticket de un evento que ya ha pasado");
    }

    return this.ticketRepository.updateById(id, {
      status: "cancelled",
      cancelledAt: new Date()
    });
  }
}