import mongoose, { Schema, models, model } from "mongoose";

const TicketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
    },

    priority: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    assignees: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true, 
  }
);

export const Ticket = models.Ticket || model("Ticket", TicketSchema);
