import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { PaymentService } from "../service/payment.service";
import { RouteHandler } from "../types/handler";

@Injectable()
export class GetPaymentHistoryHandler implements RouteHandler {
  constructor(private readonly paymentService: PaymentService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { pageIndex = "0", pageSize = "10" } = req.query;

      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const page = parseInt(pageIndex as string, 10);
      const size = parseInt(pageSize as string, 10);

      if (isNaN(page) || isNaN(size)) {
        res.status(400).json({ error: "Invalid pagination parameters" });
        return;
      }

      const skip = page * size;

      const [result] = await this.paymentService.getPaymentHistory(userId, skip, size);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  }
}
