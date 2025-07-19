import './highlight';

import paymentRouter from "./router/payments.router";
import { Handlers, H } from '@highlight-run/node';
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
import cookieParser from "cookie-parser";

import { setupAdmin } from './config/adminjs';
import { passportStrategy } from "./config/passport";
import { ErrorMiddleware } from "./middleware/error.middleware";
import { logger } from "./config/logger.config";
import authRouter from "./router/user.router";
import interviewPromptsRouter from "./router/open.ai.router";
import openApiRouter from "./router/openapi.router";
import interviewsRouter from "./router/interview.router";

const highlightConfig = {
  projectID: 'ney00pxd',
  serviceName: 'mentor-ai-backend',
  serviceVersion: 'git-sha',
  environment: process.env.NODE_ENV || 'development',
};

export const createApp = async (): Promise<http.Server> => {
  const app = express();
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(Handlers.middleware(highlightConfig));
  app.use(compression());
  app.use(express.json());
  app.use(urlencoded({ extended: true }));

  morgan.token("headers", (req: Request) => {
    const kv: string[] = [];
    for (const key in req.headers) {
      if (key.toLowerCase() === "authorization" || key.toLowerCase() === "cookie") {
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

  passportStrategy(passport);
  app.use(passport.initialize());

  const { admin, adminRouter } = await setupAdmin()
  app.use(admin.options.rootPath, adminRouter);

  app.use("/api", openApiRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/api/interview-prompts", interviewPromptsRouter);
  app.use("/api/interview", interviewsRouter);

  app.get('/debug-async-error', async (req: Request, res: Response) => {
    try {
      throw new Error('Async Highlight error');
    } catch (err) {
      const { secureSessionId, requestId } = H.parseHeaders(req.headers);
      H.consumeError(err as Error, secureSessionId, requestId);
      res.status(500).json({ error: "Reported to Highlight" });
    }
  });

  app.use(Handlers.errorHandler(highlightConfig));

  const globalErrorHandler = Container.get(ErrorMiddleware);
  app.use(globalErrorHandler.handle.bind(globalErrorHandler));

  return http.createServer(app);
};
