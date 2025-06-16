import { Router } from 'express';
import { resolveRouteHandler } from '../utils/handler.utils';
import { SignoutHandler } from '../handler/Signout.handler';
import { SignupHandler } from '../handler/signup.handler';
import { SigninHandler } from '../handler/signin.handler';
import { PassportAuthMiddleware } from '../middleware/auth.middleware';


const userrouter = Router({ mergeParams: true });

userrouter.post('/signup', resolveRouteHandler(SignupHandler));
userrouter.post('/signin', resolveRouteHandler(SigninHandler));
userrouter.post("/signout", resolveRouteHandler(PassportAuthMiddleware), resolveRouteHandler(SignoutHandler));

export default userrouter;
