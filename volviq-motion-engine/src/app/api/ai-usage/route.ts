import { usageStore } from "@/ai/usage-store";
import { NextResponse } from "next/server";

/**
 * GET /api/ai-usage
 *
 * Returns aggregated AI usage metrics for the internal dashboard.
 */
export async function GET() {
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
