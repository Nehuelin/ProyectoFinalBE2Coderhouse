const mapReference = value => {
  if (!value) return value;
  if (typeof value !== "object") return value;

  const reference = value.toObject?.() || null;
  if (!reference) return value.toString();

  const { _id, ...data } = reference;
  return { id: _id, ...data };
};

export class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id;
    this.user = mapReference(ticket.user);
    this.event = mapReference(ticket.event);
    this.status = ticket.status;
    this.quantity = ticket.quantity;
    this.code = ticket.code;
    this.cancelledAt = ticket.cancelledAt;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }
}