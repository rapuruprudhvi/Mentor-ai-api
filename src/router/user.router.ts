import { Router } from 'express';
import { resolveRouteHandler } from '../utils/handler.utils';
import { SignoutHandler } from '../handler/Signout.handler';
import { SignupHandler } from '../handler/signup.handler';
import { SigninHandler } from '../handler/signin.handler';
import { PassportAuthMiddleware } from '../middleware/auth.middleware';
import { VerifyOtpHandler } from '../handler/verify.otp.handler';
import { SendOtpHandler } from '../handler/send.otp.handler';
import { RequestResetHandler } from '../handler/request.reset.password.handler';
import { ResetPasswordHandler } from '../handler/reset.password.handler';


const userrouter = Router({ mergeParams: true });

userrouter.post('/signup', resolveRouteHandler(SignupHandler));
userrouter.post('/signin', resolveRouteHandler(SigninHandler));
userrouter.post('/verify-otp', resolveRouteHandler(VerifyOtpHandler));
userrouter.post("/send-otp", resolveRouteHandler(SendOtpHandler));
userrouter.post("/signout", resolveRouteHandler(PassportAuthMiddleware), resolveRouteHandler(SignoutHandler));
userrouter.post("/request-password-reset", resolveRouteHandler(RequestResetHandler));

userrouter.post(
  "/reset-password",
  resolveRouteHandler(PassportAuthMiddleware),
  resolveRouteHandler(ResetPasswordHandler)
);

export default userrouter;
