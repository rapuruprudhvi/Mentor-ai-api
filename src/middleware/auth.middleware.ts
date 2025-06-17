import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";

@Injectable()
export class PassportAuthMiddleware implements RouteHandler {
  async handle(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", { session: false }, (err: Error, user: Express.User | null | false) => {

      if (err) {
        return res.status(401).json({ message: "Unauthorized", error: err });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = user;
      return next();
    })(req, res, next);
  }
}
