import "reflect-metadata";
import cors from "cors";
import helmet from "helmet";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import morgan from "morgan";
import * as http from "http";


import express, { Application, Request, Response } from 'express';
import userrouter from './router/user.router';
import passport from "passport";
import { passportStrategy } from "./config/passport";
import Container from "typedi";
import { ErrorMiddleware } from "./middleware/error.middleware";
import { logger } from "./config/logger.config";

export const createApp = (): http.Server => { 

  const app = express();
  app.use(helmet());
  app.use(compression());

  // header output for logging
  morgan.token("headers", (req: Request) => {
    const kv: string[] = [];
    for (const key in req.headers) {
      // Skip sensitive headers
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
    }),
  );

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(cors());
  passportStrategy(passport);

  app.use(express.json());
  app.use(passport.initialize());
  app.use('/api/auth', userrouter);
  
  const globalErrorHandler = Container.get(ErrorMiddleware);
  app.use(globalErrorHandler.handle.bind(globalErrorHandler));

  return http.createServer(app);
};
