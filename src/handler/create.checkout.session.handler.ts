import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { PaymentService } from "../service/payment.service";
import { RouteHandler } from "../types/handler";

@Injectable()
export class CreateCheckoutSessionHandler implements RouteHandler {
  constructor(private readonly paymentService: PaymentService) {}

  async handle(req: Request, res: Response) {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ error: "Plan ID and User ID are required" });
    }

    try {
      const result = await this.paymentService.createCheckoutSession({ planId, userId });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error creating checkout session:", error);

      if (error instanceof Error) {
        switch (error.message) {
          case "Invalid plan selected":
            return res.status(400).json({ error: error.message });
          case "User not found":
            return res.status(404).json({ error: error.message });
        }
      }

      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  }
}
