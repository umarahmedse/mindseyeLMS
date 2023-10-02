import userModel from "../models/user-model";
import { Response } from "express";
import redis from "../utils/redis";
//get user by id
export const getUserByID = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(201).json({
      success: true,
      user,
    });
  }
};
