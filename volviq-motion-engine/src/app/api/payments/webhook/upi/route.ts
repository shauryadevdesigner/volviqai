import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, transactionId, status } = body;

    console.log(`[UPI Webhook Received]: ${orderId} - Status: ${status}`);

    if (status === "SUCCESS" && orderId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
        const supabase = createClient(supabaseUrl, serviceKey);

        const { data, error } = await supabase.rpc("fulfill_payment_entitlement", {
          p_order_id: orderId,
          p_provider_payment_id: transactionId || orderId,
          p_idempotency_key: `${orderId}_webhook`,
        });

        if (error) {
          console.error("[UPI Webhook Fulfillment Error]:", error.message);
        } else {
          console.log("[UPI Webhook Fulfillment Success]:", data);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[UPI Webhook Error]:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
