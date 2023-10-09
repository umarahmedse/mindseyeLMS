import mongoose, { Document, Model, Schema } from "mongoose";
import dotenv from "dotenv";

export interface InterfaceOrder extends Document {
  courseId: string;
  userId: string;
  payment_info: object;
}
const orderSchema = new Schema<InterfaceOrder>(
  {
    courseId: {
      type: String,
      required: [true, "please enter the id of the course"],
    },
    userId: {
      type: String,
      required: [true, "please enter the id of the user"],
    },
    payment_info: {
      type: Object,
      // required:true
    },
  },
  { timestamps: true }
);
const orderModel: Model<InterfaceOrder> = mongoose.model("Order", orderSchema);
export default orderModel;
