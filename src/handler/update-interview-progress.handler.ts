  import { Request, Response } from "express";
  import { RouteHandler } from "../types/handler";
  import { Injectable } from "../decorator/injectable.decorator";
  import { AppDataSource } from "../config/database";
  import { InterviewSession } from "../entity/interview.session.entity";

  @Injectable()
  export class UpdateInterviewProgressHandler implements RouteHandler {
    async handle(req: Request, res: Response): Promise<void> {
      const { sessionId } = req.params;
      const { sessionData } = req.body;
      const userId = (req.user as any)?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!sessionId || !sessionData) {
        res.status(400).json({ error: "Missing sessionId or sessionData" });
        return;
      }

      const repo = AppDataSource.getRepository(InterviewSession);
      const session = await repo.findOne({ where: { id: sessionId, userId } });

      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      session.sessionData = sessionData;
      session.updatedAt = new Date();
      

      await repo.save(session);

      res.status(200).json({ success: true });
    }
  }
