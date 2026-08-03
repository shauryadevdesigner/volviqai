import { usageStore } from "@/ai/usage-store";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";

/**
 * GET /api/ai-usage
 *
 * Returns aggregated AI usage metrics for the internal dashboard.
 * NOTE: this had no auth check at all before — anyone with the URL could
 * see internal cost/usage metrics. It now requires login. If this is meant
 * to be founder/admin-only (not just any logged-in user), add an is_admin
 * check on the profile once you have that field.
 */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const metrics = usageStore.getMetrics();
    const recentRecords = usageStore.getRecords(25);

    return NextResponse.json({
      metrics,
      recentRequests: recentRecords,
    });
  } catch (error) {
    console.error("Failed to fetch AI usage metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage metrics" },
      { status: 500 },
    );
  }
}
