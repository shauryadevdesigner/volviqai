import { ProgressRequest, ProgressResponse } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";
import { requireAuth } from "@/lib/auth-server";
import { getLocalRenderJob } from "@/lib/local-render-jobs";

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    const auth = await requireAuth(req);
    if (auth instanceof Response) {
      throw new Error("Authentication required.");
    }

    if (body.bucketName !== "local-bucket" || !body.id.startsWith("local-")) {
      return {
        type: "error",
        message: `Unsupported render bucket: ${body.bucketName}`,
      };
    }

    const job = getLocalRenderJob(body.id);
    if (!job || job.userId !== auth.user.id) {
      return {
        type: "error",
        message: "Local render job not found",
      };
    }

    if (job.status === "error") {
      return {
        type: "error",
        message: job.error || "Local Remotion render failed",
      };
    }

    if (job.status === "done") {
      return {
        type: "done",
        url: job.url as string,
        size: job.size as number,
      };
    }

    return {
      type: "progress",
      progress: Math.max(0.01, job.progress),
    };
  },
);
