import { getStripe, INTERVIEW_PLANS } from "../config/stripe";
import { AppDataSource } from "../config/database";
import { User } from "../entity/user.entity";
import { Payment } from "../entity/payment.entity";
import Stripe from "stripe";
import { Injectable } from "../decorator/injectable.decorator";
import {
  CheckoutSessionResult,
  PaymentVerificationResult,
  CreateCheckoutSessionInput,
  PlanDto,
} from "../dto/payment.dto";

@Injectable()
export class PaymentService {
  private stripe = getStripe();

  async createCheckoutSession(
    data: CreateCheckoutSessionInput
  ): Promise<CheckoutSessionResult> {
    const { planId, userId } = data;

    const plan = Object.values(INTERVIEW_PLANS).find((p) => p.id === planId);
    if (!plan) {
      throw new Error("Invalid plan selected");
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/pricing`,
      metadata: {
        userId,
        planId,
        credits: plan.credits.toString(),
      },
      customer_email: user.email,
    });

    console.log(`Created Stripe session: ${session.id} for user: ${userId}`);

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }

  async processPaymentCompletion(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const credits = Number.parseInt(session.metadata?.credits || "0");

    if (!userId || !planId || !credits) {
      throw new Error("Missing metadata in Stripe session");
    }

    const plan = Object.values(INTERVIEW_PLANS).find((p) => p.id === planId);
    if (!plan) {
      throw new Error("Invalid plan ID");
    }

    const userRepository = AppDataSource.getRepository(User);
    const paymentRepository = AppDataSource.getRepository(Payment);

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new Error("User not found");
      }

      user.interviewCredits += credits;
      await transactionalEntityManager.save(user);

      const payment = new Payment();
      payment.stripeSessionId = session.id;
      payment.stripePaymentIntentId = session.payment_intent as string;
      payment.amount = session.amount_total
        ? session.amount_total / 100
        : plan.amount / 100;
      payment.currency = plan.currency;
      payment.planType = planId;
      payment.interviewCredits = credits;
      payment.status = "completed";
      payment.userId = user.id;

      await transactionalEntityManager.save(payment);
    });
  }

  verifyWebhookSignature(body: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Stripe webhook secret is not configured");
    }

    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  async verifyPaymentSuccess(
    sessionId: string
  ): Promise<PaymentVerificationResult> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      throw new Error("User ID not found in session metadata");
    }

    const paymentRepository = AppDataSource.getRepository(Payment);
    const existingPayment = await paymentRepository.findOne({
      where: { stripeSessionId: sessionId },
    });

    if (!existingPayment) {
      await this.processPaymentCompletion(session);
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        interviewCredits: user.interviewCredits,
      },
    };
  }

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    const paymentRepository = AppDataSource.getRepository(Payment);
    return await paymentRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

getAllPlans(): PlanDto[] {
  return Object.values(INTERVIEW_PLANS).map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.amount / 100,
    priceInCents: plan.priceInCents,
    label: plan.label,
    features: plan.features,
    actionLabel: plan.actionLabel,
    popular: plan.popular,
    credits: plan.credits,
    isFree: plan.amount === 0,
    formattedPrice: plan.formattedPrice,
    currency: plan.currency,
    symbol: plan.symbol,
  }));
}
}
