// src/app.ts
import "reflect-metadata";
import cors from "cors";
import helmet from "helmet";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import morgan from "morgan";
import express, { Application, Request, Response } from 'express';
import passport from "passport";
import Container from "typedi";

import { passportStrategy } from "./config/passport";
import { ErrorMiddleware } from "./middleware/error.middleware";
import { logger } from "./config/logger.config";
import userrouter from './router/user.router';
import interviewPromptsRouter from "./router/open.ai.route";
import { AppDataSource } from "./config/database";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(urlencoded({ extended: true }));
  app.use(json());

  // logging
  morgan.token("headers", (req: Request) => {
    const kv: string[] = [];
    for (const key in req.headers) {
      if (key.toLowerCase() === "authorization" || key.toLowerCase() === "cookie") continue;
      kv.push(`${key}:${req.headers[key]}`);
    }
    return kv.join(" ");
  });
  app.use(
    morgan(":method :status :url :headers", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );

  // passport
  passportStrategy(passport);
  app.use(passport.initialize());

  // routes
  app.use('/api/auth', userrouter);
  app.use("/api/interview-prompts", interviewPromptsRouter);

  // health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: AppDataSource.isInitialized ? "connected" : "disconnected"
    });
  });

  // error middleware
  const globalErrorHandler = Container.get(ErrorMiddleware);
  app.use(globalErrorHandler.handle.bind(globalErrorHandler));

  return app;
};
