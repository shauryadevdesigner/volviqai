import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { randomUUID } from "crypto";
import { mkdir, stat } from "fs/promises";
import path from "path";
import type { z } from "zod";
import { COMP_NAME, CompositionProps } from "../../types/constants";
import {
  RENDER_AUDIO_BITRATE,
  RENDER_AUDIO_CODEC,
  RENDER_CODEC,
  RENDER_CRF,
  RENDER_IMAGE_FORMAT,
  RENDER_PIXEL_FORMAT,
} from "./render-quality";

export type LocalRenderJob = {
  id: string;
  userId: string;
  status: "queued" | "rendering" | "done" | "error";
  progress: number;
  url?: string;
  size?: number;
  error?: string;
  createdAt: number;
};

type RenderInputProps = z.infer<typeof CompositionProps>;
type LocalRenderGlobals = typeof globalThis & {
  __volviqLocalRenderJobs?: Map<string, LocalRenderJob>;
  __volviqRemotionBundle?: Promise<string>;
  __volviqRenderQueue?: Promise<void>;
};

const globals = globalThis as LocalRenderGlobals;
const getJobs = () =>
  (globals.__volviqLocalRenderJobs ??= new Map<string, LocalRenderJob>());

const getBundle = () => {
  globals.__volviqRemotionBundle ??= bundle({
    entryPoint: path.join(process.cwd(), "src", "remotion", "index.ts"),
    publicDir: path.join(process.cwd(), "public"),
    onProgress: () => undefined,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@": path.join(process.cwd(), "src"),
        },
      },
    }),
  }).catch((error) => {
    globals.__volviqRemotionBundle = undefined;
    throw error;
  });
  return globals.__volviqRemotionBundle;
};

const runRender = async (job: LocalRenderJob, inputProps: RenderInputProps) => {
  const outputDirectory = path.join(process.cwd(), "public", "renders");
  const outputLocation = path.join(outputDirectory, `${job.id}.mp4`);

  try {
    job.status = "rendering";
    job.progress = 0.01;
    await mkdir(outputDirectory, { recursive: true });

    const serveUrl = await getBundle();
    job.progress = 0.03;
    const composition = await selectComposition({
      serveUrl,
      id: COMP_NAME,
      inputProps,
      logLevel: "warn",
    });

    await renderMedia({
      composition,
      serveUrl,
      inputProps,
      codec: RENDER_CODEC,
      crf: RENDER_CRF,
      imageFormat: RENDER_IMAGE_FORMAT,
      pixelFormat: RENDER_PIXEL_FORMAT,
      audioCodec: RENDER_AUDIO_CODEC,
      audioBitrate: RENDER_AUDIO_BITRATE,
      outputLocation,
      overwrite: true,
      logLevel: "warn",
      licenseKey: null,
      onProgress: ({ progress }) => {
        job.progress = Math.max(0.03, Math.min(0.99, progress));
      },
    });

    const file = await stat(outputLocation);
    job.status = "done";
    job.progress = 1;
    job.size = file.size;
    job.url = `/renders/${job.id}.mp4`;
  } catch (error) {
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Local Remotion render failed";
    console.error(`[LocalRender:${job.id}]`, error);
  }
};

export const startLocalRender = (userId: string, inputProps: RenderInputProps) => {
  const id = `local-${randomUUID()}`;
  const job: LocalRenderJob = {
    id,
    userId,
    status: "queued",
    progress: 0,
    createdAt: Date.now(),
  };
  getJobs().set(id, job);

  const previous = globals.__volviqRenderQueue ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(() => runRender(job, inputProps));
  globals.__volviqRenderQueue = next;
  void next.finally(() => {
    if (globals.__volviqRenderQueue === next) globals.__volviqRenderQueue = undefined;
  });

  return job;
};

export const getLocalRenderJob = (id: string) => getJobs().get(id);
