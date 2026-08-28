import { EventModel } from "../models/event.model.js";

export default class EventDAO {
  async create(data) {
    return EventModel.create(data);
  }

  async findById(id){
    return EventModel.findById(id)
      .populate("organizer", "first_name last_name email role")
      .populate("category", "name slug description");
  }

  async updateById(id, data){
    return EventModel.findByIdAndUpdate(id, data, {new: true, runValidators: true})
      .populate("organizer", "first_name last_name email role")
      .populate("category", "name slug description");
  }

  async findAll(filter, { skip, limit, sort }) {
    return EventModel.find(filter)
      .populate("organizer", "first_name last_name email role")
      .populate("category", "name slug description")
      .sort(sort).skip(skip).limit(limit);
  }

  async count(filter) {
    return EventModel.countDocuments(filter);
  }
}