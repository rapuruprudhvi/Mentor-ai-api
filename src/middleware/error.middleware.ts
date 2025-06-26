import type { NextFunction, Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { ApiResponse } from "../types/api.responce";
import { logger } from "../config/logger.config";

@Injectable()
export class ErrorMiddleware {
  handle(
    error: any,
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction,
  ) {
    logger.error(error.stack);

    if (res.headersSent) {
      return next(error);
    }

    const status = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    res.status(status).json({
      error: message, 
    });
  }
}
