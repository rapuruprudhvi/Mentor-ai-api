import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { PaymentService } from "../service/payment.service";
import { RouteHandler } from "../types/handler";

@Injectable()
export class VerifyPaymentSuccessHandler implements RouteHandler {
  constructor(private readonly paymentService: PaymentService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ error: "Session ID is required" });
        return;
      }

      const result = await this.paymentService.verifyPaymentSuccess(sessionId);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error verifying payment:", error);

      if (error instanceof Error) {
        switch (error.message) {
          case "Payment not completed":
          case "User ID not found in session metadata":
          case "Invalid plan ID":
            res.status(400).json({ error: error.message });
            return;

          case "User not found":
            res.status(404).json({ error: error.message });
            return;
        }
      }

      res.status(500).json({ error: "Failed to verify payment" });
    }
  }
}
