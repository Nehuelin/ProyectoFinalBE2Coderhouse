import { TicketService } from "../services/ticket.service.js";

const ticketService = new TicketService();

export const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user);

    res.status(201).json({
      status: "success",
      message: "Ticket creado",
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);

    res.json({
      status: "success",
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getTickets(req.query, req.user);

    res.json({
      status: "success",
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getTicketsByUser(req.user._id, req.query);

    res.json({
      status: "success",
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.cancelTicket(req.params.id, req.user);

    res.json({
      status: "success",
      message: "Ticket cancelado",
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};   