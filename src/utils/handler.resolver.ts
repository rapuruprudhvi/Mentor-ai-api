// // src/util/handler.resolver.ts
// export const resolveRouteHandler = (HandlerClass: any) => {
//   const instance = new HandlerClass();
//   return (req: any, res: any) => instance.handle(req, res);
// };


// src/util/handler.resolver.ts
import { InterviewPromptService } from "../service/interview.prompt.service";
import { CreateInterviewPromptHandler } from "../handler/create.open.ai.handler";

export const resolveRouteHandler = (HandlerClass: any) => {
  let instance;

  if (HandlerClass === CreateInterviewPromptHandler) {
    const promptService = new InterviewPromptService();
    instance = new HandlerClass(promptService);
  } else {
    instance = new HandlerClass(); // fallback for other handlers
  }

  return (req: any, res: any) => instance.handle(req, res);
};
