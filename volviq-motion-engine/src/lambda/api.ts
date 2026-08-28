import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import { z } from "zod";
import { CompositionProps } from "../../types/constants";
import {
  ProgressRequest,
  ProgressResponse,
  RenderRequest,
} from "../../types/schema";
import { ApiResponse } from "../helpers/api-response";

const makeRequest = async <Res>(
  endpoint: string,
  body: unknown,
  accessToken?: string | null,
): Promise<Res> => {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const result = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers,
  });
  const json = (await result.json()) as ApiResponse<Res>;
  if (json.type === "error") {
    throw new Error(json.message);
  }

  return json.data;
};

export const renderVideo = async ({
  inputProps,
  accessToken,
}: {
  inputProps: z.infer<typeof CompositionProps>;
  accessToken?: string | null;
}) => {
  const body: z.infer<typeof RenderRequest> = {
    inputProps,
  };

  return makeRequest<RenderMediaOnLambdaOutput>("/api/lambda/render", body, accessToken);
};

export const getProgress = async ({
  id,
  bucketName,
  accessToken,
}: {
  id: string;
  bucketName: string;
  accessToken?: string | null;
}) => {
  const body: z.infer<typeof ProgressRequest> = {
    id,
    bucketName,
  };

  return makeRequest<ProgressResponse>("/api/lambda/progress", body, accessToken);
};
