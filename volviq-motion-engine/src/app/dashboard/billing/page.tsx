"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { PLAN_LIMITS, PLAN_PRICES_INR } from "@/lib/plans";
import type { PlanTier } from "@/types/profile";
import { cn } from "@/lib/utils";

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
  const { profile } = useRequireAuth();
  const currentPlan = profile?.plan ?? "free";

  const handleUpgrade = () => {
    alert("Razorpay checkout coming soon. Your plan will sync automatically.");
  };

  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and usage. Payments via Razorpay (coming soon).
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border p-6",
                currentPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background-elevated",
              )}
            >
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
              {currentPlan !== plan.id && plan.id !== "free" && (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="mt-6 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Upgrade
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
