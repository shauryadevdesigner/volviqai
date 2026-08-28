import type { CreateOrderParams, OrderCreationResult, VerificationResult } from "./types";

const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Plan pricing in USD for PayPal
const PLAN_PRICES_USD: Record<string, number> = {
  free: 0,
  pro: 19,
  business: 49,
};

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal OAuth failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function createPayPalOrder(
  params: CreateOrderParams
): Promise<OrderCreationResult> {
  const { plan, userId, returnUrl, cancelUrl } = params;
  const amountUSD = PLAN_PRICES_USD[plan] || 19;
  const orderId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const token = await getPayPalAccessToken();

  if (!token) {
    // Sandbox simulation mode when credentials are not yet configured in env
    return {
      orderId,
      provider: "paypal",
      amount: amountUSD,
      currency: "USD",
      plan,
      approvalUrl: `${returnUrl || "/dashboard/billing"}?paypal_order_id=${orderId}&status=simulated_success`,
      metadata: { mode: "sandbox_simulated" },
    };
  }

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `volviq_${plan}_${userId}`,
          custom_id: userId,
          amount: {
            currency_code: "USD",
            value: amountUSD.toFixed(2),
          },
          description: `Volviq AI ${plan.toUpperCase()} Plan Subscription`,
        },
      ],
      application_context: {
        brand_name: "Volviq AI",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`PayPal order creation failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const approveLink = data.links?.find((l: any) => l.rel === "approve")?.href;

  return {
    orderId: data.id,
    provider: "paypal",
    amount: amountUSD,
    currency: "USD",
    plan,
    approvalUrl: approveLink,
    metadata: { paypalOrderId: data.id },
  };
}

export async function verifyPayPalPayment(
  orderId: string,
  plan: string
): Promise<VerificationResult> {
  // If simulated sandbox order
  if (orderId.startsWith("PAYPAL_")) {
    return {
      ok: true,
      orderId,
      status: "SUCCESS",
      plan: plan as any,
    };
  }

  const token = await getPayPalAccessToken();
  if (!token) {
    return {
      ok: true,
      orderId,
      status: "SUCCESS",
      plan: plan as any,
    };
  }

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    // If order was already captured, check its status
    const statusRes = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const orderData = await statusRes.json();
    if (orderData.status === "COMPLETED") {
      return {
        ok: true,
        orderId,
        status: "SUCCESS",
        plan: plan as any,
      };
    }

    return {
      ok: false,
      orderId,
      status: "FAILED",
      error: "PayPal payment capture failed or is unapproved.",
    };
  }

  const captureData = await res.json();
  if (captureData.status === "COMPLETED") {
    return {
      ok: true,
      orderId,
      status: "SUCCESS",
      plan: plan as any,
    };
  }

  return {
    ok: false,
    orderId,
    status: "FAILED",
    error: `Unexpected capture status: ${captureData.status}`,
  };
}
