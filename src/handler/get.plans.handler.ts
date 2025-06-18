import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { PaymentService } from "../service/payment.service";
import { RouteHandler } from "../types/handler";

@Injectable()
export class GetPlansHandler implements RouteHandler {
  constructor(private readonly paymentService: PaymentService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const plans = this.paymentService.getAllPlans();
      res.status(200).json(plans);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      res.status(500).json({ error: "Failed to retrieve plans" });
    }
  }
}
