<<<<<<< HEAD
import { Router } from "express";
import { resolveMiddleware, resolveRouteHandler } from "../utils/handler.utils";
import { SignoutHandler } from "../handler/Signout.handler";
import { SignupHandler } from "../handler/signup.handler";
import { SigninHandler } from "../handler/signin.handler";
import { PassportAuthMiddleware } from "../middleware/auth.middleware";
import { VerifyOtpHandler } from "../handler/verify.otp.handler";
import { SendOtpHandler } from "../handler/send.otp.handler";
import { RequestResetHandler } from "../handler/request.reset.password.handler";
import { ResetPasswordHandler } from "../handler/reset.password.handler";
import { GetUserHandler } from "../handler/get.user.handler";
import { UpdateUserHandler } from "../handler/update.user.handler";

import { DeleteUserHandler } from "../handler/delete.user.handler";
import { ResumeUploadHandler } from "../handler/resume-upload.handler";
import { ResumeUploadMiddleware } from "../middleware/resume-upload.middleware";


=======
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
>>>>>>> main

const userRouter = Router({ mergeParams: true });

userRouter.post("/signOut", resolveRouteHandler(SignoutHandler));
userRouter.post("/reset-password", resolveRouteHandler(ResetPasswordHandler));
userRouter.get("/getUser", resolveRouteHandler(GetUserHandler));
userRouter.put("/user/:userId", resolveRouteHandler(UpdateUserHandler))
userRouter.post(
  "/user/resume",
  resolveMiddleware(ResumeUploadMiddleware),  
  resolveRouteHandler(ResumeUploadHandler)     
);
userRouter.post("/createTicket", resolveRouteHandler(SupportTicketHandler));


// Resume upload route (separate from user update)
// userRouter.post("/user/resume", resolveRouteHandler(ResumeUploadMiddleware), resolveRouteHandler(ResumeUploadHandler))
userRouter.delete("/user/:userId", resolveRouteHandler(DeleteUserHandler));

const authRouter = Router({ mergeParams: true });

authRouter.post("/signUp", resolveRouteHandler(SignupHandler));
authRouter.post("/signIn", resolveRouteHandler(SigninHandler));
authRouter.post("/verify-otp", resolveRouteHandler(VerifyOtpHandler));
authRouter.post("/send-otp", resolveRouteHandler(SendOtpHandler));
<<<<<<< HEAD
authRouter.post(
  "/request-password-reset",
  resolveRouteHandler(RequestResetHandler)
);
=======
authRouter.post("/request-password-reset", resolveRouteHandler(RequestResetHandler));
authRouter.get("/ticket/:ticketId", resolveRouteHandler(GetTicketHandler));
>>>>>>> main

authRouter.use(resolveRouteHandler(PassportAuthMiddleware), userRouter);

export default authRouter;
