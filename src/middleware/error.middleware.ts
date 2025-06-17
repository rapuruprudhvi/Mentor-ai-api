import type { NextFunction, Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { ApiResponse } from "../types/api.responce";
import { logger } from "../config/logger.config";

@Injectable()
export class ErrorMiddleware {
  handle(
    error: Error,
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction,
  ) {
    logger.error(error.stack);

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}