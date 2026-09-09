import { Ticket } from "../models/ticket.model.js";

export class TicketDAO {
  async create(data) {
    return Ticket.create(data);
  }

  async findById(id) {
    return Ticket.findById(id)
      .populate("user", "first_name last_name email role")
      .populate("event", "title description category date location capacity price status organizer");
  }

  async findByUserAndEvent(userId, eventId) {
    return Ticket.findOne({ user: userId, event: eventId, status: "active" });
  }

  async updateById(id, data) {
    return Ticket.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    ).populate("user", "first_name last_name email role")
      .populate("event", "title description category date location capacity price status organizer");
  }

  async findAll(filter, { skip, limit, sort }) {
    return Ticket.find(filter)
      .populate("user", "first_name last_name email role")
      .populate("event", "title description category date location capacity price status organizer")
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filter) {
    return Ticket.countDocuments(filter);
  }

  async getReservedTicketsCount(eventId) {
    const result = await Ticket.aggregate([
      { $match: { event: eventId, status: "active" } },
      { $group: { _id: "$event", totalReserved: { $sum: "$quantity" } } }
    ]);
    return result[0]?.totalReserved || 0;
  }

  async getReservedQuantityByEvent(eventId) {
    const result = await Ticket.aggregate([
      {
        $match: {
          event: eventId,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$event',
          totalReserved: {
            $sum: '$quantity'
          }
        }
      }
    ])
    return result[0]?.totalReserved || 0
  }
}