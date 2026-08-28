import { GenerateObjectResult, StreamTextResult } from "ai";

export interface AIProvider {
  name: string;

  generateObject<T = any>(params: {
    model: string;
    system?: string;
    prompt?: string;
    messages?: any[];
    schema: any;
    maxTokens?: number;
    temperature?: number;
  }): Promise<GenerateObjectResult<T>>;

  streamText(params: {
    model: string;
    system?: string;
    prompt?: string;
    messages?: any[];
    maxTokens?: number;
    temperature?: number;
  }): Promise<StreamTextResult<any, any>>;
}
