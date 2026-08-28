"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { PLAN_LIMITS, PLAN_PRICES_INR } from "@/lib/plans";
import type { PlanTier } from "@/types/profile";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, AlertCircle, QrCode, CreditCard, ChevronRight } from "lucide-react";

const PLANS: {
  id: PlanTier;
  name: string;
  price: number;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: PLAN_PRICES_INR.free,
    features: [
      `${PLAN_LIMITS.free} motion graphic ads / month`,
      "720p export",
      "Basic templates",
      "Volviq watermark",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: PLAN_PRICES_INR.pro,
    features: [
      `${PLAN_LIMITS.pro} video generations / month`,
      "Premium templates",
      "1080p exports",
      "Faster rendering",
      "No watermark",
      "Advanced customization",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: PLAN_PRICES_INR.business,
    features: [
      `${PLAN_LIMITS.business} video generations / month`,
      "Priority rendering",
      "All premium templates",
      "Brand kits",
      "Team collaboration",
      "Priority support",
      "Commercial usage rights",
    ],
  },
];

export default function BillingPage() {
  const { profile, accessToken, refreshProfile } = useRequireAuth();
  const currentPlan = profile?.plan ?? "free";

  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "upi" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UPI Specific state
  const [upiOrder, setUpiOrder] = useState<{
    orderId: string;
    upiIntentUrl: string;
    amount: number;
  } | null>(null);
  const [upiRefId, setUpiRefId] = useState("");

  // Success state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpgradeClick = (plan: PlanTier) => {
    setSelectedPlan(plan);
    setPaymentMethod(null);
    setUpiOrder(null);
    setError(null);
    setSuccessMessage(null);
    setCheckoutDialogOpen(true);
  };

  const handleSelectPaymentMethod = async (method: "paypal" | "upi") => {
    if (!selectedPlan) return;
    setPaymentMethod(method);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          plan: selectedPlan,
          provider: method,
          returnUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?cancel=true`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create payment order.");
      }

      const orderData = await res.json();

      if (method === "paypal") {
        if (orderData.approvalUrl) {
          window.location.href = orderData.approvalUrl;
        } else {
          throw new Error("No approval URL received from PayPal.");
        }
      } else {
        setUpiOrder({
          orderId: orderData.orderId,
          upiIntentUrl: orderData.upiIntentUrl,
          amount: orderData.amount,
        });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setPaymentMethod(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUPI = async () => {
    if (!upiOrder || !selectedPlan) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          orderId: upiOrder.orderId,
          provider: "upi",
          plan: selectedPlan,
          providerPaymentId: upiRefId || upiOrder.orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      setSuccessMessage(data.message || "Payment verified successfully!");
      await refreshProfile();
      setTimeout(() => {
        setCheckoutDialogOpen(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to verify payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and usage. Pay securely via PayPal or UPI.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border p-6 flex flex-col justify-between min-h-[350px]",
                currentPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background-elevated",
              )}
            >
              <div>
                {currentPlan === plan.id && (
                  <span className="mb-3 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    Current plan
                  </span>
                )}
                <h2 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h2>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  ₹{plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
              {currentPlan !== plan.id && plan.id !== "free" && (
                <button
                  type="button"
                  onClick={() => handleUpgradeClick(plan.id)}
                  className="mt-6 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 cursor-pointer"
                >
                  Upgrade
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="max-w-md border-border bg-background-elevated text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl">Upgrade to {selectedPlan?.toUpperCase()}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select your payment method below to complete the subscription.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!successMessage && !paymentMethod && (
            <div className="flex flex-col gap-3 py-4">
              <button
                type="button"
                onClick={() => handleSelectPaymentMethod("paypal")}
                disabled={loading}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:border-primary hover:bg-secondary/70 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-background border border-border text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold block">PayPal / Card</span>
                    <span className="text-xs text-muted-foreground">International cards and USD billing</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectPaymentMethod("upi")}
                disabled={loading}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:border-primary hover:bg-secondary/70 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-background border border-border text-purple-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold block">UPI / QR Code</span>
                    <span className="text-xs text-muted-foreground">GPay, PhonePe, Paytm, BHIM (INR)</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span>Preparing secure checkout...</span>
            </div>
          )}

          {!successMessage && paymentMethod === "upi" && upiOrder && !loading && (
            <div className="flex flex-col items-center py-4 gap-4 text-center">
              <span className="text-sm font-semibold">Scan QR Code or Use UPI Intent Link</span>
              
              <div className="p-4 rounded-xl bg-white border border-border flex items-center justify-center">
                {/* Generate fallback QR display using Google Charts API for lightweight display */}
                <img
                  src={`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(upiOrder.upiIntentUrl)}`}
                  alt="UPI QR Code"
                  className="w-48 h-48"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="block font-semibold text-foreground text-sm">Amount: ₹{upiOrder.amount}</span>
                <span className="block mt-1">Transaction Ref: {upiOrder.orderId}</span>
              </div>

              <a
                href={upiOrder.upiIntentUrl}
                className="w-full text-center py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm transition"
              >
                Pay via App
              </a>

              <div className="w-full border-t border-border/20 pt-4 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter UPI Reference / UTR Number (Optional)"
                  value={upiRefId}
                  onChange={(e) => setUpiRefId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleVerifyUPI}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg text-sm transition cursor-pointer"
                >
                  Verify Payment
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
