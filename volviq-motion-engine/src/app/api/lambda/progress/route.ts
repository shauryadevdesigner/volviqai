import { ProgressRequest, ProgressResponse } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    // If it's a JSON2VIDEO render
    if (body.bucketName === "json2video") {
      try {
        const response = await fetch(`https://api.json2video.com/v2/movies?project=${body.id}`, {
          method: "GET",
          headers: {
            "x-api-key": "cZehYVmEjAje7GoNCndm1bhliwGFHecRA5dKd7cg",
          },
        });

        if (!response.ok) {
          return {
            type: "error",
            message: "Failed to fetch progress from JSON2VIDEO",
          };
        }

        const data = await response.json();
        
        if (!data.success || !data.movie) {
          return {
            type: "error",
            message: "Invalid response from JSON2VIDEO",
          };
        }

        const movie = data.movie;

        if (movie.status === "error") {
          return {
            type: "error",
            message: movie.message || "JSON2VIDEO rendering failed",
          };
        }

        if (movie.status === "done" && movie.url) {
          return {
            type: "done",
            url: movie.url,
            size: movie.size || 0,
          };
        }

        // JSON2VIDEO doesn't provide fine-grained percentage progress, so we mock it
        return {
          type: "progress",
          progress: 0.5, // 50% fixed progress while rendering
        };
      } catch (e: any) {
        return {
          type: "error",
          message: e.message || "JSON2VIDEO polling failed",
        };
      }
    }

    // Local render polling fallback
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

    return {
      type: "error",
      message: "Unsupported render bucket: " + body.bucketName,
    };
  }
);
