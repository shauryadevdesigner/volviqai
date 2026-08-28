import { requireAuth } from "@/lib/auth-server";
import { createPaymentOrder } from "@/lib/payments";
import { PaymentProviderType } from "@/lib/payments/types";
import { PlanTier } from "@/types/profile";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user: authUser, accessToken } = auth;

    const body = await req.json();
    const { plan, provider, returnUrl, cancelUrl } = body as {
      plan: PlanTier;
      provider: PaymentProviderType;
      returnUrl?: string;
      cancelUrl?: string;
    };

    if (plan !== "pro" && plan !== "business") {
      return NextResponse.json(
        { error: "Invalid plan selected for checkout." },
        { status: 400 }
      );
    }

    if (provider !== "paypal" && provider !== "upi") {
      return NextResponse.json(
        { error: "Invalid payment provider. Choose 'paypal' or 'upi'." },
        { status: 400 }
      );
    }

    // Create payment order with provider
    const order = await createPaymentOrder({
      userId: authUser.id,
      plan,
      provider,
      returnUrl,
      cancelUrl,
    });

    // Record pending transaction in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });

      const idempotencyKey = `${authUser.id}_${order.orderId}_${Date.now()}`;

      await supabase.from("payments").insert({
        user_id: authUser.id,
        provider,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        status: "PENDING",
        plan,
        idempotency_key: idempotencyKey,
        metadata: order.metadata || {},
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[Create Payment Order Error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initiate checkout order.",
      },
      { status: 500 }
    );
  }
}
