import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.error(
    "⚠️ ERROR: Stripe API key is missing in environment variables!"
  );
  console.error("Please set STRIPE_SECRET_KEY in your .env file");
  console.error(
    "For development, you can use Stripe test keys from https://dashboard.stripe.com/test/apikeys"
  );
}

let stripe: Stripe | null = null;

try {
  if (STRIPE_SECRET_KEY) {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });
    console.log("✅ Stripe initialized successfully");
  } else {
    console.log("⚠️ Stripe not initialized - running in mock mode");
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error);
}

const mockStripe = {
  checkout: {
    sessions: {
      create: async (options: any) => {
        console.log("MOCK: Creating Stripe session with options:", options);
        return {
          id: `cs_mock_${Date.now()}`,
          url: `https://mock-stripe-checkout.com/session/${Date.now()}`,
          amount_total: options.amount_total,
          currency: options.currency,
        };
      },
    },
  },
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => {
      console.log("MOCK: Verifying Stripe webhook signature");
      return {
        type: "checkout.session.completed",
        data: {
          object: {
            id: `cs_mock_${Date.now()}`,
            metadata: {
              userId: "mock_user_id",
              planId: "mock_plan_id",
            },
            amount_total: 5000,
            customer_details: {
              email: "mock@example.com",
            },
          },
        },
      };
    },
  },
};

export const getStripe = () => {
  return stripe || (mockStripe as unknown as Stripe);
};

export const INTERVIEW_PLANS = {
  SINGLE: {
    id: "single_interview",
    name: "Single Interview",
    description: "Access to 1 interview session",
    amount: 9900,
    currency: "INR",
    credits: 1,
  },
  BUNDLE: {
    id: "interview_bundle",
    name: "Interview Bundle",
    description: "Access to 10 interview sessions",
    amount: 24900,
    currency: "INR",
    credits: 5,
  },
};
