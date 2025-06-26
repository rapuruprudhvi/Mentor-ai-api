import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithRequest } from "passport-jwt";
import { PassportStatic } from "passport";
import { AppDataSource } from "./database";
import { User } from "../entity/user.entity";
import { BlacklistedToken } from "../entity/blacklisted-token.entity";
import { Request } from "express";

const opts: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  passReqToCallback: true, // ✅ this enables req in callback
};

export const passportStrategy = (passport: PassportStatic): void => {
  passport.use(
    new JwtStrategy(opts, async (req: Request, jwt_payload, done) => {
      try {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        const blacklistedRepo = AppDataSource.getRepository(BlacklistedToken);
        console.log("JWT Payload:", token, jwt_payload);
        if (token) {
        
          const blacklisted = await blacklistedRepo.findOneBy({ token });
          if (blacklisted) {
            return done(null, false); // token is blacklisted
          }
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = jwt_payload.id
          ? await userRepo.findOneBy({ id: jwt_payload.id })
          : await userRepo.findOneBy({ email: jwt_payload.email });


        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
