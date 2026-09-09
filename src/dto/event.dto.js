const mapReference = value => {
  if (!value) return value;
  if (typeof value !== "object") return value;

  const reference = value.toObject?.() || null;
  if (!reference) return value.toString();

  const { _id, ...data } = reference;
  return { id: _id, ...data };
};

export class EventDTO {
  constructor(event) {
    this.id = event._id;
    this.title = event.title;
    this.description = event.description;
    this.category = mapReference(event.category);
    this.eventType = event.eventType;
    this.ageRecommendation = event.ageRecommendation;
    this.durationMinutes = event.durationMinutes;
    this.parkArea = event.parkArea;
    this.date = event.date;
    this.location = event.location;
    this.capacity = event.capacity;
    this.price = event.price;
    this.status = event.status;
    this.organizer = mapReference(event.organizer);
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}