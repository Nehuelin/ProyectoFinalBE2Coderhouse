import { TicketDAO } from "../dao/ticket.dao.js";

export class TicketRepository {
  constructor() {
    this.dao = new TicketDAO();
  }

  create(data) {
    return this.dao.create(data);
  }

  findById(id) {
    return this.dao.findById(id);
  }

  findByUserAndEvent(userId, eventId) {
    return this.dao.findByUserAndEvent(userId, eventId);
  }

  updateById(id, data) {
    return this.dao.updateById(id, data);
  }

  findAll(filter, pagination) {
    return this.dao.findAll(filter, pagination);
  }

  count(filter) {
    return this.dao.count(filter);
  }

  getReservedTicketsCount(eventId) {
    return this.dao.getReservedTicketsCount(eventId);
  }
}