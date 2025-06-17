// src/app.ts
import paymentRouter from "./router/payments.router";

import "reflect-metadata";
import cors from "cors";
import helmet from "helmet";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import morgan from "morgan";

import * as http from "http";

import express, { Request, Response } from "express";
import passport from "passport";
import Container from "typedi";

import { passportStrategy } from "./config/passport";
import { ErrorMiddleware } from "./middleware/error.middleware";
import { logger } from "./config/logger.config";
import userrouter from './router/user.router';
import interviewPromptsRouter from "./router/open.ai.route";


export const createApp = (): http.Server => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(urlencoded({ extended: true }));
  app.use(json());

  app.use(cors());

  app.use(express.json());

  morgan.token("headers", (req: Request) => {
    const kv: string[] = [];
    for (const key in req.headers) {
      if (
        key.toLowerCase() === "authorization" ||
        key.toLowerCase() === "cookie"
      ) {
        continue;
      }

      kv.push(`${key}:${req.headers[key]}`);
    }
    return kv.join(" ");
  });
  app.use(
    morgan(":method :status :url :headers", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );

  app.use(urlencoded({ extended: true }));
  app.use(json());

  passportStrategy(passport);
  app.use(passport.initialize());
  app.use("/api/auth", userrouter);
  app.use("/api/payments", paymentRouter);
    app.use("/api/interview-prompts", interviewPromptsRouter);


  const globalErrorHandler = Container.get(ErrorMiddleware);
  app.use(globalErrorHandler.handle.bind(globalErrorHandler));

  return http.createServer(app);
};
