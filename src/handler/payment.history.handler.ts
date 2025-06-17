import type { Request, Response } from "express";
import { Injectable } from "../decorator/injectable.decorator";
import { PaymentService } from "../service/payment.service";
import { RouteHandler } from "../types/handler";
import type Stripe from "stripe";

@Injectable()
export class HandleStripeWebhookHandler implements RouteHandler {
  constructor(private readonly paymentService: PaymentService) {}

  async handle(req: Request, res: Response): Promise<void> {
    console.log(
      "Webhook received:",
      req.headers["stripe-signature"] ? "with signature" : "without signature"
    );

    try {
      const signature = req.headers["stripe-signature"] as string;

      let event: Stripe.Event;
      try {
        event = this.paymentService.verifyWebhookSignature(req.body, signature);
        console.log("Webhook event verified:", event.type);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        res
          .status(400)
          .json({ error: "Webhook signature verification failed" });
        return;
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing checkout.session.completed:", session.id);

        try {
          await this.paymentService.processPaymentCompletion(session);
        } catch (dbError) {
          console.error("Database error during payment processing:", dbError);
          res
            .status(500)
            .json({ error: "Database error during payment processing" });
          return;
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);

      if (
        error instanceof Error &&
        error.message === "Stripe webhook secret is not configured"
      ) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Failed to process webhook" });
    }
  }
}
