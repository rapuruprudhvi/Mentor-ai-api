import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { PassportStatic } from "passport";
import { AppDataSource } from "./database";
import { User } from "../entity/user.entity";


const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

export const passportStrategy = (passport: PassportStatic): void => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ id: jwt_payload.id });

        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
