import { Router } from "express";
import { StartInterviewHandler } from "../handler/start-interview.handler";
import { EndInterviewHandler } from "../handler/end-interview.handler";
import { resolveRouteHandler } from "../utils/handler.utils";
import { PassportAuthMiddleware } from '../middleware/auth.middleware';
import { AskInterviewQuestionHandler } from "../handler/interview.sesion.handler";
import { GetInterviewQuestionsHandler } from "../handler/get-interview-questions.handler";
import { GetUserInterviewTitlesHandler } from "../handler/get.interview.title.handler";
import { ResumeInterviewSessionHandler } from "../handler/resume.interview.session.handler";
import { UpdateInterviewProgressHandler } from "../handler/update-interview-progress.handler";

const interviewRouter = Router({ mergeParams: true });

interviewRouter.get("/title", resolveRouteHandler(GetUserInterviewTitlesHandler));
interviewRouter.post("/start", resolveRouteHandler(StartInterviewHandler));

interviewRouter.post("/:sessionId/end", resolveRouteHandler(EndInterviewHandler));
interviewRouter.post("/:sessionId", resolveRouteHandler(AskInterviewQuestionHandler));
interviewRouter.get("/:sessionId", resolveRouteHandler(GetInterviewQuestionsHandler));
interviewRouter.patch("/:sessionId/progress", resolveRouteHandler(UpdateInterviewProgressHandler));

interviewRouter.get("/:sessionId/resume", resolveRouteHandler(ResumeInterviewSessionHandler));

const interviewsRouter = Router({ mergeParams: true });

interviewsRouter.use("", resolveRouteHandler(PassportAuthMiddleware), interviewRouter);

export default interviewsRouter;