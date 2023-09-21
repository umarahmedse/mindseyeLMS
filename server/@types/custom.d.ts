import { Request } from "express";
import { InterfaceUser } from "../models/user-model";
declare global {
  namespace Express {
    interface Request {
      user?: InterfaceUser;
    }
  }
}
