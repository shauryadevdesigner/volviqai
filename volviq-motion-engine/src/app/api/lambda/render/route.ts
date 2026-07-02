export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

import {
  AwsRegion,
  renderMediaOnLambda,
  RenderMediaOnLambdaOutput,
  speculateFunctionName,
} from "@remotion/lambda/client";
import {
  DISK,
  RAM,
  REGION,
  SITE_NAME,
  TIMEOUT,
} from "../../../../../config.mjs";
import { COMP_NAME } from "../../../../../types/constants";
import { RenderRequest } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";
import { lambdaRenderQuality } from "@/lib/render-quality";
import { clampDurationInFrames } from "@/lib/video-duration";

import { webpackOverride } from "@/remotion/webpack-override.mjs";
import path from "path";
import fs from "fs";

interface LocalRenderJob {
  status: "rendering" | "done" | "error";
  progress: number;
  url?: string;
  size?: number;
  error?: string;
}

type GlobalWithLocalRenders = typeof globalThis & {
  localRenders?: Map<string, LocalRenderJob>;
  cachedBundleLocation?: string | null;
};

const globalObj = globalThis as GlobalWithLocalRenders;
const localRenders = (globalObj.localRenders = globalObj.localRenders || new Map<string, LocalRenderJob>());
let cachedBundleLocation = globalObj.cachedBundleLocation || null;

const isServerless = !!(
  process.env.VERCEL ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.AWS_EXECUTION_ENV
);

async function getBundle() {
  if (cachedBundleLocation && fs.existsSync(cachedBundleLocation)) {
    return cachedBundleLocation;
  }
  const entryPoint = path.join(/*turbopackIgnore: true*/ process.cwd(), "src/remotion/index.ts");
  const bundlerModuleName = "@remotion/bundler";
  const { bundle } = (await import(bundlerModuleName)) as typeof import("@remotion/bundler");
  cachedBundleLocation = await bundle({
    entryPoint,
    webpackOverride,
  });
  globalObj.cachedBundleLocation = cachedBundleLocation;
  return cachedBundleLocation;
}

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    const hasAwsCredentials =
      (process.env.AWS_ACCESS_KEY_ID || process.env.REMOTION_AWS_ACCESS_KEY_ID) &&
      (process.env.AWS_SECRET_ACCESS_KEY || process.env.REMOTION_AWS_SECRET_ACCESS_KEY);

    const inputProps = {
      ...body.inputProps,
      durationInFrames: clampDurationInFrames(body.inputProps.durationInFrames),
    };

    if (!hasAwsCredentials) {
      if (isServerless) {
        throw new Error(
          "AWS credentials are not configured. Local rendering fallback is not supported in serverless environments (Vercel/Lambda)."
        );
      }

      // Local rendering fallback
      const renderId = "local-" + Math.random().toString(36).substring(2, 9);
      localRenders.set(renderId, {
        status: "rendering",
        progress: 0,
      });

      // Trigger local render asynchronously
      (async () => {
        try {
          const bundleLocation = await getBundle();
          const rendererModuleName = "@remotion/renderer";
          const { selectComposition, renderMedia } = (await import(rendererModuleName)) as typeof import("@remotion/renderer");
          const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: COMP_NAME,
            inputProps,
          });

          const publicDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public");
          const rendersDir = path.join(publicDir, "renders");
          if (!fs.existsSync(rendersDir)) {
            fs.mkdirSync(rendersDir, { recursive: true });
          }

          const outputFilePath = path.join(rendersDir, `${renderId}.mp4`);

          await renderMedia({
            codec: lambdaRenderQuality.codec,
            crf: lambdaRenderQuality.crf,
            imageFormat: lambdaRenderQuality.imageFormat,
            pixelFormat: lambdaRenderQuality.pixelFormat,
            audioCodec: lambdaRenderQuality.audioCodec,
            audioBitrate: lambdaRenderQuality.audioBitrate,
            serveUrl: bundleLocation,
            composition,
            outputLocation: outputFilePath,
            inputProps,
            onProgress: ({ progress }) => {
              localRenders.set(renderId, {
                status: "rendering",
                progress,
              });
            },
          });

          const size = fs.statSync(outputFilePath).size;
          localRenders.set(renderId, {
            status: "done",
            progress: 1,
            url: `/renders/${renderId}.mp4`,
            size,
          });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error("Local render failed:", error);
          localRenders.set(renderId, {
            status: "error",
            progress: 0,
            error: errMsg,
          });
        }
      })();

      return {
        renderId,
        bucketName: "local-bucket",
      } as unknown as RenderMediaOnLambdaOutput;
    }

    const result = await renderMediaOnLambda({
      codec: lambdaRenderQuality.codec,
      crf: lambdaRenderQuality.crf,
      imageFormat: lambdaRenderQuality.imageFormat,
      pixelFormat: lambdaRenderQuality.pixelFormat,
      audioCodec: lambdaRenderQuality.audioCodec,
      audioBitrate: lambdaRenderQuality.audioBitrate,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION as AwsRegion,
      serveUrl: SITE_NAME,
      composition: COMP_NAME,
      inputProps,
      framesPerLambda: 60,
      downloadBehavior: {
        type: "download",
        fileName: "video.mp4",
      },
    });

    return result;
  },
);

