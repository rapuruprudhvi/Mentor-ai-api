import express, { Application, Request, Response } from "express";
import paymentRouter from "./config/router/payments.router";
import cors from "cors";

export const createApp = (): Application => {
  const app = express();

  app.use(cors());

  app.use(express.json());

  app.use("/api/payments", paymentRouter);

  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "API is running" });
  });

  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  return app;
};

