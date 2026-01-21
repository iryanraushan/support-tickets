import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "admin" | "developer";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "developer"],
      default: "developer",
    },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
