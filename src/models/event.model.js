import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    eventType: {
      type: String,
      enum: ["show", "parade", "celebration", "meet-and-greet", "workshop"],
      required: true
    },
    ageRecommendation: {
      type: String,
      enum: ["all-ages", "children", "teens", "adults"],
      default: "all-ages"
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1
    },
    parkArea: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "finished"],
      default: "draft"
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
)

eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ parkArea: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });

export const EventModel = mongoose.model('Event', eventSchema);