import { PlanTier } from "@/types/profile";

export type PaymentProviderType = "paypal" | "upi";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface CreateOrderParams {
  userId: string;
  plan: PlanTier;
  provider: PaymentProviderType;
  currency?: "INR" | "USD";
  returnUrl?: string;
  cancelUrl?: string;
}

export interface OrderCreationResult {
  orderId: string;
  provider: PaymentProviderType;
  amount: number;
  currency: string;
  plan: PlanTier;
  approvalUrl?: string; // For PayPal redirect / payment page
  upiIntentUrl?: string; // For UPI app deep linking (gpay/phonepe/paytm)
  qrData?: string; // UPI QR code string
  clientToken?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentParams {
  orderId: string;
  provider: PaymentProviderType;
  providerPaymentId?: string;
  signature?: string;
  idempotencyKey?: string;
}

export interface VerificationResult {
  ok: boolean;
  orderId: string;
  status: PaymentStatus;
  plan?: PlanTier;
  creditsGranted?: number;
  error?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  provider: PaymentProviderType;
  orderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  plan: PlanTier;
  creditsGranted: number;
  idempotencyKey: string;
  webhookVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
