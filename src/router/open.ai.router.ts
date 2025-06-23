import { Router } from "express";
import { CreateInterviewPromptHandler } from "../handler/create.open.ai.handler";
import { resolveRouteHandler } from "../utils/handler.utils";

const interviewPromptsRouter = Router({ mergeParams: true });

interviewPromptsRouter.post(
  "",
  resolveRouteHandler(CreateInterviewPromptHandler)
);
export default interviewPromptsRouter;
