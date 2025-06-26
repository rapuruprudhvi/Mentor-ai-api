import { Router } from "express";
import { CreateCheckoutSessionHandler } from "../handler/create.checkout.session.handler";

import { VerifyPaymentSuccessHandler } from "../handler/payment.success.handler";

import { resolveRouteHandler } from "../utils/handler.utils";
import { GetPlansHandler } from "../handler/get.plans.handler";
import { HandleStripeWebhookHandler } from "../handler/stripe.webhook.handler";
import { GetPaymentHistoryHandler } from "../handler/payment.history.handler";

const paymentRouter = Router({ mergeParams: true });

paymentRouter.post(
  "/checkout-session",
  resolveRouteHandler(CreateCheckoutSessionHandler)
);

paymentRouter.post("/webhook", resolveRouteHandler(HandleStripeWebhookHandler));

paymentRouter.get(
  "/verify/:sessionId",
  resolveRouteHandler(VerifyPaymentSuccessHandler)
);

paymentRouter.get(
  "/history/:userId",
  resolveRouteHandler(GetPaymentHistoryHandler)
);

paymentRouter.get("/plans", resolveRouteHandler(GetPlansHandler));

export default paymentRouter;
