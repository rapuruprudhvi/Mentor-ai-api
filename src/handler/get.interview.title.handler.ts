import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Interview } from "../entity/interview.entity";
import { InterviewSession } from "../entity/interview.session.entity";
import { Injectable } from "../decorator/injectable.decorator";
import { RouteHandler } from "../types/handler";
import moment from "moment";

@Injectable()
export class GetUserInterviewTitlesHandler implements RouteHandler {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const sessionRepo = AppDataSource.getRepository(InterviewSession);
      const interviewRepo = AppDataSource.getRepository(Interview);

      const sessions = await sessionRepo.find({
        where: { userId },
        order: { createdAt: "DESC" }
      });

      const interviewIds = sessions.map((s) => s.interviewId);
      const interviews = await interviewRepo.findByIds(interviewIds);

      const result = sessions.map((session) => {
        const interview = interviews.find((i) => i.id === session.interviewId);
        return {
          sessionId: session.id,
          title: interview?.title || "Untitled Interview",
          date: moment(session.createdAt).format("MMMM D, YYYY") // e.g. June 10, 2025
        };
      });

      res.status(200).json({ data: result });
    } catch (error) {
      console.error("Error fetching interview titles:", error);
      res.status(500).json({ error: "Failed to fetch interview titles" });
    }
  }
}
