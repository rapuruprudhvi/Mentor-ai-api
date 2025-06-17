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

      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const payments = await this.paymentService.getPaymentHistory(userId);

      res.status(200).json(payments);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  }
}
