import mongoose, { Document, Model, Schema } from "mongoose";
import dotenv from "dotenv";

export interface InterfaceNotification extends Document {
  title: string;
  message: string;
  status: string;

  userId: string;
}
const notificationSchema = new Schema<InterfaceNotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true, default: "unread" },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);
const notificationModel: Model<InterfaceNotification> = mongoose.model(
  "Order",
  notificationSchema
);
export default notificationModel;
