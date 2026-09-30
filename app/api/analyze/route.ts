import { NextResponse } from "next/server";
import { analyzeWithGemini, GEMINI_MODEL } from "@/lib/gemini";
import { demoFallbackAnalysis } from "@/lib/demo-fallback";
import { getRepresentativeContext } from "@/lib/mock-context";

interface AnalyzePayload {
  imageDataUrl?: string;
  farm?: {
    location?: string;
    crop?: string;
    farmSizeAcres?: number;
    growthStage?: string;
  };
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!m) return null;
  return { mimeType: m[1], base64: m[2] };
}

export async function POST(req: Request) {
  let body: AnalyzePayload;
  try {
    body = (await req.json()) as AnalyzePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const farm = body.farm ?? {};
  const location = (farm.location ?? "").trim();
  const crop = (farm.crop ?? "").trim();
  const growthStage = (farm.growthStage ?? "").trim();
  const farmSizeAcres = Number(farm.farmSizeAcres);

  if (!body.imageDataUrl || !location || !crop || !growthStage || !Number.isFinite(farmSizeAcres)) {
    return NextResponse.json(
      { error: "Missing required fields: imageDataUrl, farm.location, farm.crop, farm.growthStage, farm.farmSizeAcres." },
      { status: 400 },
    );
  }

  const parsed = parseDataUrl(body.imageDataUrl);
  if (!parsed) {
    return NextResponse.json(
      { error: "imageDataUrl must be a base64 data URL (e.g. data:image/jpeg;base64,...)." },
      { status: 400 },
    );
  }
  if (parsed.base64.length > 7_000_000) {
    return NextResponse.json(
      { error: "Image too large. Please use an image under ~5 MB." },
      { status: 413 },
    );
  }

  const ctx = getRepresentativeContext(location, crop, growthStage);

  // Server-side only: GEMINI_API_KEY is read here and never sent to the browser.
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      result: demoFallbackAnalysis(crop, growthStage),
      mockContextUsed: ctx,
      demoMode: true,
      model: `${GEMINI_MODEL} (unavailable — demo fallback)`,
    });
  }

  try {
    const { result, model } = await analyzeWithGemini({
      imageBase64: parsed.base64,
      mimeType: parsed.mimeType,
      crop,
      growthStage,
      location,
      farmSizeAcres,
      weather: ctx.weather,
      soil: ctx.soil,
      cropInfo: ctx.cropInfo,
    });
    return NextResponse.json({
      result,
      mockContextUsed: ctx,
      demoMode: false,
      model,
    });
  } catch (err) {
    console.error("Gemini analysis failed, serving demo fallback:", err);
    return NextResponse.json({
      result: demoFallbackAnalysis(crop, growthStage),
      mockContextUsed: ctx,
      demoMode: true,
      model: `${GEMINI_MODEL} (error — demo fallback)`,
    });
  }
}
