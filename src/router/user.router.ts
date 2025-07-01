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
import { GetUserHandler } from '../handler/get.user.handler';
import { UpdateUserHandler } from '../handler/update.user.handler';
import { UploadProfilePhotoMiddleware } from '../middleware/upload.middleware';
import { DeleteUserHandler } from '../handler/delete.user.handler';
import { GetTicketHandler } from '../handler/get.support-ticket.handler';
import { SupportTicketHandler } from '../handler/create.support-ticket.handler';

const userRouter = Router({ mergeParams: true });

userRouter.post("/signOut", resolveRouteHandler(SignoutHandler));
userRouter.post("/reset-password", resolveRouteHandler(ResetPasswordHandler));
userRouter.get("/getUser", resolveRouteHandler(GetUserHandler));
userRouter.put(
    "/user/:userId",
    resolveRouteHandler(UploadProfilePhotoMiddleware),
    resolveRouteHandler(UpdateUserHandler)
);
userRouter.delete(
    "/user/:userId",
    resolveRouteHandler(DeleteUserHandler)
);
userRouter.post("/createTicket", resolveRouteHandler(SupportTicketHandler));

const authRouter = Router({ mergeParams: true });
authRouter.post('/signUp', resolveRouteHandler(SignupHandler));
authRouter.post('/signIn', resolveRouteHandler(SigninHandler));
authRouter.post('/verify-otp', resolveRouteHandler(VerifyOtpHandler));
authRouter.post("/send-otp", resolveRouteHandler(SendOtpHandler));
authRouter.post("/request-password-reset", resolveRouteHandler(RequestResetHandler));
authRouter.get("/ticket/:ticketId", resolveRouteHandler(GetTicketHandler));

authRouter.use(resolveRouteHandler(PassportAuthMiddleware), userRouter);

export default authRouter;