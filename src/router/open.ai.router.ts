import { Router } from "express";
import { CreateInterviewPromptHandler } from "../handler/create.open.ai.handler";
import { resolveRouteHandler } from "../utils/handler.utils";
import { GetAllPromptsHandler } from "../handler/get.all.prompts.handler";

const interviewPromptsRouter = Router({ mergeParams: true });

interviewPromptsRouter.get("/", resolveRouteHandler(GetAllPromptsHandler));

interviewPromptsRouter.post(
  "",
  resolveRouteHandler(CreateInterviewPromptHandler)
);
export default interviewPromptsRouter;
