import {
  AwsRegion,
  getRenderProgress,
  speculateFunctionName,
} from "@remotion/lambda/client";
import { DISK, RAM, REGION, TIMEOUT } from "../../../../../config.mjs";
import { ProgressRequest, ProgressResponse } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    if (body.bucketName === "local-bucket" || body.id.startsWith("local-")) {
      interface LocalRenderJob {
        status: "rendering" | "done" | "error";
        progress: number;
        url?: string;
        size?: number;
        error?: string;
      }
      type GlobalWithLocalRenders = typeof globalThis & {
        localRenders?: Map<string, LocalRenderJob>;
      };
      const globalObj = globalThis as GlobalWithLocalRenders;
      const localRenders = (globalObj.localRenders = globalObj.localRenders || new Map<string, LocalRenderJob>());
      const job = localRenders.get(body.id);

      if (!job) {
        return {
          type: "error",
          message: "Local render job not found",
        };
      }

      if (job.status === "error") {
        return {
          type: "error",
          message: job.error || "Local render failed",
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
        progress: Math.max(0.03, job.progress),
      };
    }

    const renderProgress = await getRenderProgress({
      bucketName: body.bucketName,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION as AwsRegion,
      renderId: body.id,
    });

    if (renderProgress.fatalErrorEncountered) {
      return {
        type: "error",
        message: renderProgress.errors[0].message,
      };
    }

    if (renderProgress.done) {
      return {
        type: "done",
        url: renderProgress.outputFile as string,
        size: renderProgress.outputSizeInBytes as number,
      };
    }

    return {
      type: "progress",
      progress: Math.max(0.03, renderProgress.overallProgress),
    };
  },
);
