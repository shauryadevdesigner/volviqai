export const maxDuration = 300;
export const dynamic = "force-dynamic";

import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import { RenderRequest } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";
import { requireAuth } from "@/lib/auth-server";
import { startLocalRender } from "@/lib/local-render-jobs";
import { clampDurationInFrames } from "@/lib/video-duration";

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    const auth = await requireAuth(req);
    if (auth instanceof Response) {
      throw new Error("Authentication required.");
    }

    const inputProps = {
      ...body.inputProps,
      durationInFrames: clampDurationInFrames(body.inputProps.durationInFrames),
    };

    const job = startLocalRender(auth.user.id, inputProps);
    return {
      renderId: job.id,
      bucketName: "local-bucket",
    } as unknown as RenderMediaOnLambdaOutput;
  },
);
