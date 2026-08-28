import type {
  CreateOrderParams,
  OrderCreationResult,
  VerificationResult,
  VerifyPaymentParams,
} from "./types";
import { createPayPalOrder, verifyPayPalPayment } from "./paypal";
import { createUPIOrder, verifyUPIPayment } from "./upi";

export * from "./types";
export * from "./paypal";
export * from "./upi";

export async function createPaymentOrder(
  params: CreateOrderParams
): Promise<OrderCreationResult> {
  if (params.provider === "paypal") {
    return createPayPalOrder(params);
  } else if (params.provider === "upi") {
    return createUPIOrder(params);
  }
  throw new Error(`Unsupported payment provider: ${params.provider}`);
}

export async function verifyPayment(
  params: VerifyPaymentParams,
  plan: string
): Promise<VerificationResult> {
  if (params.provider === "paypal") {
    return verifyPayPalPayment(params.orderId, plan);
  } else if (params.provider === "upi") {
    return verifyUPIPayment(params.orderId, plan, params.providerPaymentId);
  }
  throw new Error(`Unsupported payment provider: ${params.provider}`);
}
