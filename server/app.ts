import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import errorHandler from "./utils/errorHandler";
import userRoutes from "./routes/user.routes";
dotenv.config();
const app = express();
//logger
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
else app.use(morgan("common"));
//body parser
app.use(express.json({ limit: "50mb" }));
//cookie parser
app.use(cookieParser());
//CORS
app.use(
  cors({
    origin: process.env.ORIGINS,
  })
);
app.use("/api/v1", userRoutes);
//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API Live",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`${req.originalUrl} not found`) as any;
  error.statusCode = 404;
  next(error);
});
app.use(errorHandler);
export default app;
// 1:41
