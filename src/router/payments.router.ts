import { Router } from "express";
import { CreateCheckoutSessionHandler } from "../handler/create.checkout.session.handler";
import { HandleStripeWebhookHandler } from "../handler/payment.history.handler";
import { VerifyPaymentSuccessHandler } from "../handler/payment.success.handler";
import { GetPaymentHistoryHandler } from "../handler/stripe.webhook.handler";
import { resolveRouteHandler } from "../utils/handler.utils";

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

export default paymentRouter;
