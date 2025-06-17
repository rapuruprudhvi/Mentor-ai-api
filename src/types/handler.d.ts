import type { NextFunction, Request, Response } from "express";

export interface RouteHandler {
  handle(req: Request, res: Response, next?: NextFunction);
}