import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";

@Injectable()
export class PassportAuthMiddleware implements RouteHandler {
  async handle(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", { session: false }, (err: Error, user: Express.User | null | false) => {

      if (err) {
        console.log("Authentication error:", err, "User:", user);
        return res.status(401).json({ message: "Unauthorized", error: err });
      }

      if (!user) {
        console.log("Invalid or expired token");
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = user;
      console.log("User authenticated successfully:", user);
      return next();
    })(req, res, next);
  }
}
