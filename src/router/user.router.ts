import { Router } from 'express';
import { resolveRouteHandler } from '../utils/handler.utils';
import { SignoutHandler } from '../handler/Signout.handler';
import { SignupHandler } from '../handler/signup.handler';
import { SigninHandler } from '../handler/signin.handler';
import { PassportAuthMiddleware } from '../middleware/auth.middleware';
import { VerifyOtpHandler } from '../handler/verify.otp.handler';
import { SendOtpHandler } from '../handler/send.otp.handler';


const userrouter = Router({ mergeParams: true });

userrouter.post('/signup', resolveRouteHandler(SignupHandler));
userrouter.post('/signin', resolveRouteHandler(SigninHandler));
userrouter.post('/verify-otp', resolveRouteHandler(VerifyOtpHandler));
userrouter.post("/send-otp", resolveRouteHandler(SendOtpHandler));
userrouter.post("/signout", resolveRouteHandler(PassportAuthMiddleware), resolveRouteHandler(SignoutHandler));

export default userrouter;
