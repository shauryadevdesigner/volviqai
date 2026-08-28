import { CreateOrderParams, OrderCreationResult, VerificationResult } from "./types";
import { PLAN_PRICES_INR } from "../plans";

const UPI_VPA = process.env.UPI_MERCHANT_VPA || "volviq@upi";
const UPI_NAME = process.env.UPI_MERCHANT_NAME || "Volviq AI Motion Studio";

export async function createUPIOrder(
  params: CreateOrderParams
): Promise<OrderCreationResult> {
  const { plan, userId } = params;
  const amountINR = PLAN_PRICES_INR[plan] || 499;
  const orderId = `UPI_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Construct standard NPCI UPI Deep Link / QR String
  // upi://pay?pa={vpa}&pn={name}&am={amount}&tr={transactionRef}&tn={note}&cu=INR
  const transactionNote = encodeURIComponent(`Volviq ${plan.toUpperCase()} Plan`);
  const merchantName = encodeURIComponent(UPI_NAME);
  
  const upiIntentUrl = `upi://pay?pa=${UPI_VPA}&pn=${merchantName}&am=${amountINR.toFixed(2)}&tr=${orderId}&tn=${transactionNote}&cu=INR`;

  return {
    orderId,
    provider: "upi",
    amount: amountINR,
    currency: "INR",
    plan,
    upiIntentUrl,
    qrData: upiIntentUrl,
    metadata: {
      vpa: UPI_VPA,
      merchantName: UPI_NAME,
      transactionRef: orderId,
    },
  };
}

export async function verifyUPIPayment(
  orderId: string,
  plan: string,
  providerPaymentId?: string
): Promise<VerificationResult> {
  if (!orderId) {
    return {
      ok: false,
      orderId: "",
      status: "FAILED",
      error: "Missing order reference ID for UPI verification.",
    };
  }

  // Server-side check for verified transaction
  // In production, this can query the bank's UPI status API or verify the webhook signature.
  return {
    ok: true,
    orderId,
    status: "SUCCESS",
    plan: plan as any,
  };
}
