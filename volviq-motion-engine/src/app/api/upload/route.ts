import { requireAuth } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB limit

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user: authUser } = auth;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const role = (formData.get("role") as string) || "product";

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 50MB.`,
        },
        { status: 400 }
      );
    }

    const mimeType = file.type || "application/octet-stream";
    const isImage = mimeType.startsWith("image/");

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: "Unsupported file type. Please upload a supported image (PNG, JPG, WebP) or video (MP4, WebM).",
        },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop() || (isImage ? "png" : "mp4");
    const uniqueId = crypto.randomUUID();
    const storagePath = `${authUser.id}/${uniqueId}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let publicUrl = "";

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Attempt upload to 'user-assets' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-assets")
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("user-assets")
          .getPublicUrl(storagePath);
        publicUrl = urlData.publicUrl;
      }
    }

    // Fallback: If Supabase Storage is not actively hooked up in local dev, provide base64 data url for images or blob representation
    if (!publicUrl) {
      if (isImage) {
        publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else {
        publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }
    }

    return NextResponse.json({
      id: uniqueId,
      url: publicUrl,
      filename: file.name,
      mimeType,
      sizeBytes: file.size,
      type: isImage ? "image" : "video",
      role,
    });
  } catch (error) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
