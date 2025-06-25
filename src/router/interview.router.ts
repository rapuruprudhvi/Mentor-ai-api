// interview.route.ts
import { Router } from "express";
import { StartInterviewHandler } from "../handler/start-interview.handler";
import { EndInterviewHandler } from "../handler/end-interview.handler";
import { resolveRouteHandler } from "../utils/handler.utils";
import { PassportAuthMiddleware } from '../middleware/auth.middleware';

const interviewRouter = Router({ mergeParams: true });


interviewRouter.post("/start", resolveRouteHandler(StartInterviewHandler));
interviewRouter.post("/:sessionId/end", resolveRouteHandler(EndInterviewHandler));

const interviewsRouter = Router({ mergeParams: true });

interviewsRouter.use("", resolveRouteHandler(PassportAuthMiddleware), interviewRouter);

export default interviewsRouter;
