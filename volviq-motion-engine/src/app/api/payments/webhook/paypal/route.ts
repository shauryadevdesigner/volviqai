import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;

    console.log(`[PayPal Webhook Received]: ${eventType}`);

    if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = eventType === "CHECKOUT.ORDER.APPROVED" ? body.resource.id : body.resource.supplementary_data?.related_ids?.order_id || body.resource.id;
      const paymentId = body.resource.purchase_units?.[0]?.payments?.captures?.[0]?.id || body.resource.id;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && orderId) {
        // Use service role key if available, otherwise anon key
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
        const supabase = createClient(supabaseUrl, serviceKey);

        const { data, error } = await supabase.rpc("fulfill_payment_entitlement", {
          p_order_id: orderId,
          p_provider_payment_id: paymentId,
          p_idempotency_key: `${orderId}_webhook`,
        });

        if (error) {
          console.error("[PayPal Webhook Fulfillment Error]:", error.message);
        } else {
          console.log("[PayPal Webhook Fulfillment Success]:", data);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PayPal Webhook Error]:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
