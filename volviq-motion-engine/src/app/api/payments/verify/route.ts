import { requireAuth } from "@/lib/auth-server";
import { verifyPayment } from "@/lib/payments";
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
    const { orderId, provider, plan, providerPaymentId } = body as {
      orderId: string;
      provider: PaymentProviderType;
      plan: PlanTier;
      providerPaymentId?: string;
    };

    if (!orderId || !provider || !plan) {
      return NextResponse.json(
        { error: "Missing required verification parameters." },
        { status: 400 }
      );
    }

    // 1. Server-side verification with provider
    const verification = await verifyPayment(
      {
        orderId,
        provider,
        providerPaymentId,
      },
      plan
    );

    if (!verification.ok || verification.status !== "SUCCESS") {
      return NextResponse.json(
        {
          ok: false,
          error: verification.error || "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // 2. Fulfill entitlement in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });

      // Execute fulfillment RPC or update profile
      const { error: rpcError } = await supabase.rpc(
        "fulfill_payment_entitlement",
        {
          p_order_id: orderId,
          p_provider_payment_id: providerPaymentId || orderId,
          p_idempotency_key: `${orderId}_fulfilled`,
        }
      );

      if (rpcError) {
        console.warn(
          "Fulfillment RPC fallback to manual update:",
          rpcError.message
        );
        // Fallback update
        await supabase
          .from("profiles")
          .update({
            plan,
            generations_used_this_month: 0,
            billing_period_start: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
          })
          .eq("id", authUser.id);

        await supabase
          .from("payments")
          .update({
            status: "SUCCESS",
            provider_payment_id: providerPaymentId || orderId,
            webhook_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
      }
    }

    return NextResponse.json({
      ok: true,
      orderId,
      status: "SUCCESS",
      plan,
      message: `Your account has been upgraded to ${plan.toUpperCase()}!`,
    });
  } catch (error) {
    console.error("[Payment Verification Error]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}
