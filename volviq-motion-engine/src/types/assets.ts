export type AssetRole =
  | "product"
  | "reference_image"
  | "reference_video"
  | "brand"
  | "logo"
  | "background"
  | "character"
  | "footage";

export interface AssetAnalysis {
  mainSubject?: string;
  colors?: string[];
  composition?: string;
  detectedText?: string[];
  visualStyle?: string;
  brandElements?: string[];
  summary: string;
  // Video specific
  durationSeconds?: number;
  orientation?: "landscape" | "portrait" | "square";
  keyMoments?: string[];
}

export interface UploadedAsset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  type: "image" | "video";
  role?: AssetRole;
  analysis?: AssetAnalysis;
  previewUrl?: string;
}
