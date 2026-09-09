import mongoose from "mongoose";
import { EventRepository } from "../repositories/event.repository.js";
import { CategoryModel } from "../models/category.model.js";
import { EventDTO } from "../dto/event.dto.js";

const VALID_STATUSES = ["draft", "published", "cancelled", "finished"]
const VALID_EVENT_TYPES = ["show", "parade", "celebration", "meet-and-greet", "workshop"]
const VALID_AGE_RECOMMENDATIONS = ["all-ages", "children", "teens", "adults"]

const businessError = (message, status = 400) => {
  return Object.assign(new Error(message), { status });
}

export class EventService {
  constructor() {
    this.eventRepository = new EventRepository();
  }

  validateObjectId(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw businessError("ID de evento inválido", 400);
    }
  }

  validateCapacityAndPrice(data) {
    if (data.capacity !== undefined && Number(data.capacity) <= 0) {
      throw businessError("La capacidad debe ser mayor a 0");
    }

    if (data.price !== undefined && Number(data.price) < 0){
      throw businessError("El precio no puede ser negativo");
    }
  }

  validateStatus(status) {
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      throw businessError(`Status inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`);
    }
  }

  async validateCategory(category) {
    if (!mongoose.isValidObjectId(category)) {
      throw businessError("La categoría no es válida");
    }

    const categoryExists = await CategoryModel.exists({ _id: category, isActive: true });

    if (!categoryExists) {
      throw businessError("La categoría no existe o está inactiva", 404);
    }
  }

  validateThemeAttributes(data) {
    if (!VALID_EVENT_TYPES.includes(data.eventType)) {
      throw businessError(`eventType inválido. Valores permitidos: ${VALID_EVENT_TYPES.join(", ")}`);
    }

    if (data.ageRecommendation !== undefined && !VALID_AGE_RECOMMENDATIONS.includes(data.ageRecommendation)) {
      throw businessError(`ageRecommendation inválido. Valores permitidos: ${VALID_AGE_RECOMMENDATIONS.join(", ")}`);
    }

    if (data.durationMinutes !== undefined && Number(data.durationMinutes) <= 0) {
      throw businessError("La duración debe ser mayor a 0 minutos");
    }

    if (!data.parkArea) {
      throw businessError("El área del parque es obligatoria");
    }
  }

  async createEvent(data, user){
    const { title, description, category, eventType, ageRecommendation = "all-ages", durationMinutes, parkArea, date, location, capacity, price, status = "draft" } = data;

    if (!title || !description || !category || !eventType || !durationMinutes || !parkArea || !date || !location) {
      throw businessError("title, description, category, eventType, durationMinutes, parkArea, date y location son obligatorios");
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime())) {
      throw businessError("La fecha del evento no es válida");
    }

    if (eventDate <= new Date()) {
      throw businessError("No se puede crear un evento con fecha pasada");
    }

    this.validateCapacityAndPrice({ capacity, price });
    this.validateStatus(status);
    this.validateThemeAttributes({ eventType, ageRecommendation, durationMinutes, parkArea });
    await this.validateCategory(category);

    const event = await this.eventRepository.create({
      title,
      description,
      category,
      eventType,
      ageRecommendation,
      durationMinutes,
      parkArea,
      date: eventDate,
      location,
      capacity,
      price,
      status,
      organizer: user._id   
    });

    return new EventDTO(event);
  }

  async getEventById(id) {
    this.validateObjectId(id);

    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw businessError("Evento no encontrado", 404);
    }

    return new EventDTO(event);
  }

  async getEvents(query){
    const { status, category, location, dateFrom, dateTo, page = 1, limit = 10, sort = "date" } = query

    this.validateStatus(status);

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const filter = {}

    if (status) filter.status = status;
    if (category) {
      if (!mongoose.isValidObjectId(category)) throw businessError("La categoría no es válida");
      filter.category = category;
    }
    if (location) filter.location = { $regex: location, $options: "i"};
    
    if (dateFrom || dateTo){
      filter.date = {};

      if (dateFrom) {
        const from = new Date(dateFrom);
        
        if (Number.isNaN(from.getTime())) {
          throw businessError("dateFrom no es una fecha válida");
        }

        filter.date.$gte = from;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        
        if (Number.isNaN(to.getTime())) {
          throw businessError("dateTo no es una fecha válida");
        }

        filter.date.$lte = to;
      }
    }

    const allowedSortFields = ["date", "price", "title", "category", "location", "eventType", "durationMinutes", "parkArea"];
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;

    if (!allowedSortFields.includes(sortField)) {
      throw businessError(`Campo de ordenamiento inválido. Permitidos: ${allowedSortFields.join(", ")}`);
    }

    const sortObject = {[sortField]: sort.startsWith("-") ? -1 : 1};

    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await Promise.all([
      this.eventRepository.findAll(filter, { skip, limit: currentLimit, sort: sortObject}), 
      this.eventRepository.count(filter)
    ]);

    return { data: data.map(event => new EventDTO(event)), page: currentPage, limit: currentLimit, total, totalPages: Math.ceil(total / currentLimit) };

  }

  async assertCanManage(event, user) {
    const isAdmin = user.role === "admin";

    if (isAdmin) return;

    const isOwner = event.organizer?._id ? event.organizer._id.toString() === user._id.toString() : event.organizer.toString() === user._id.toString()

    if (!isOwner){
      throw businessError("No tienes permisos para modificar este evento", 403)
    }
  }

  async updateEvent(id, data, user) {
    const event = await this.getEventById(id);

    if (event.status === "cancelled") {
      throw businessError("Un evento cancelado no puede modificarse");
    }

    await this.assertCanManage(event, user);

    const allowedFields = ["title", "description", "category", "eventType", "ageRecommendation", "durationMinutes", "parkArea", "date", "location", "capacity", "price"];

    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined){
        updateData[field] = data[field];
      }
    }

    if (updateData.date !== undefined) {
      const newDate = new Date(updateData.date);

      if (Number.isNaN(newDate.getTime())) {
        throw businessError("La fecha no es válida");
      }

      if (newDate <= new Date()){
        throw businessError("La fecha del evento no puede estar en el pasado");
      }

      updateData.date = newDate;
    }

    this.validateCapacityAndPrice(updateData);

    if (updateData.category !== undefined) await this.validateCategory(updateData.category);
    if (updateData.eventType !== undefined || updateData.ageRecommendation !== undefined || updateData.durationMinutes !== undefined || updateData.parkArea !== undefined) {
      this.validateThemeAttributes({
        eventType: updateData.eventType ?? event.eventType,
        ageRecommendation: updateData.ageRecommendation ?? event.ageRecommendation,
        durationMinutes: updateData.durationMinutes ?? event.durationMinutes,
        parkArea: updateData.parkArea ?? event.parkArea
      });
    }

    if (Object.keys(updateData).length === 0) {
      throw businessError("No hay campos válidos para actualizar");
    }

    const updatedEvent = await this.eventRepository.updateById(id, updateData);
    return new EventDTO(updatedEvent);
  }

  async changeStatus(id, status, user) {
    const event = await this.getEventById(id);

    if (event.status === "cancelled") {
      throw businessError("Un evento cancelado no puede cambiar de estado");
    }

    await this.assertCanManage(event, user);

    this.validateStatus(status);

    if (status === "published" && event.status === "finished") {
      throw businessError("No se puede publicar un evento finalizado");
    }

    if (status === "published" && event.status === "cancelled") {
      throw businessError("No se puede publicas un evento cancelado");
    }

    if (event.status === status) {
      throw businessError(`El evento "${event.title}" ya tiene status "${status}"`);
    }

    const updatedEvent = await this.eventRepository.updateById(id, { status });
    return new EventDTO(updatedEvent);
  }
}

