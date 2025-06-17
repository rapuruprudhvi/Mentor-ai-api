import type { NextFunction, Request, Response } from "express";
import Container, { Constructable } from "typedi";
import { RouteHandler } from "../types/handler";

type AsyncHandlerFn = (req: Request, res: Response, next: NextFunction) => void;

const asyncHandler =
  (fn: AsyncHandlerFn) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const resolveRouteHandler = (
  handlerClass: Constructable<RouteHandler>,
) => {
  return asyncHandler((req: Request, res: Response, next: NextFunction) => {
    const handler = Container.get<RouteHandler>(handlerClass);
    return handler.handle(req, res, next);
  });
};