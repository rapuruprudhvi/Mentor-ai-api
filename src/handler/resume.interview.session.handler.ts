// import { Request, Response } from "express";
// import { RouteHandler } from "../types/handler";
// import { Injectable } from "../decorator/injectable.decorator";
// import { AppDataSource } from "../config/database";
// import { InterviewSession } from "../entity/interview.session.entity";

// @Injectable()
// export class ResumeInterviewSessionHandler implements RouteHandler {
//   async handle(req: Request, res: Response): Promise<void> {
//     const { sessionId } = req.params;
//     const userId = (req.user as any)?.id;

//     if (!userId) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     if (!sessionId) {
//       res.status(400).json({ error: "Missing sessionId" });
//       return;
//     }

//     const repo = AppDataSource.getRepository(InterviewSession);
//     const session = await repo.findOne({ where: { id: sessionId, userId } });

//     if (!session) {
//       res.status(404).json({ error: "Session not found" });
//       return;
//     }

//     res.status(200).json({
//       session: {
//         id: session.id,
//         userId: session.userId,
//         interviewId: session.interviewId,
//         status: session.status,
//         startedAt: session.startedAt,
//         endedAt: session.endedAt,
//         sessionData: session.sessionData || {},
//         createdAt: session.createdAt,
//         updatedAt: session.updatedAt,
//       }
//     });
//   }
// }



import { Request, Response } from "express";
import { RouteHandler } from "../types/handler";
import { Injectable } from "../decorator/injectable.decorator";
import { AppDataSource } from "../config/database";
import { InterviewSession } from "../entity/interview.session.entity";


@Injectable()
export class ResumeInterviewSessionHandler implements RouteHandler {
  async handle(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const userId = (req.user as any)?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId" });
      return;
    }

    const repo = AppDataSource.getRepository(InterviewSession);
    const session = await repo.findOne({ where: { id: sessionId, userId } });

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (!session.startedAt) {
      res.status(500).json({ error: "Invalid session: missing start time." });
      return;
    }

    const MAX_DURATION_MINUTES = 90;
    const now = new Date();
    const startedAt = new Date(session.startedAt);
    const elapsedMinutes = (now.getTime() - startedAt.getTime()) / 60000;

    if (elapsedMinutes >= MAX_DURATION_MINUTES) {
      session.status = "expired";
      session.endedAt = now;
      await repo.save(session);

      res.status(403).json({ error: "Session expired. Interview duration is limited to 90 minutes." });
      return;
    }

    res.status(200).json({
      session: {
        id: session.id,
        userId: session.userId,
        interviewId: session.interviewId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        sessionData: session.sessionData || {},
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }
    });
  }
}
