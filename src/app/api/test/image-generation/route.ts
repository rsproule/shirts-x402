import { generateShirtDesign } from "@/lib/services/image-generation";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint for image generation workflow
 * POST /api/test/image-generation
 * Body: { prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, provider = "google" } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error: "Prompt is required and must be a string",
        },
        { status: 400 },
      );
    }

    if (provider !== "google" && provider !== "openai") {
      return NextResponse.json(
        {
          ok: false,
          error: "Provider must be 'google' or 'openai'",
        },
        { status: 400 },
      );
    }

    console.log(`[Test] Testing image generation with ${provider} provider`, prompt);

    // Test the image generation workflow
    const startTime = Date.now();
    const result = await generateShirtDesign(prompt, provider);
    const duration = Date.now() - startTime;

    console.log("[Test] Image generation test completed successfully", result);

    return NextResponse.json(
      {
        ok: true,
        result: {
          imageUrl: result.imageUrl,
          title: result.title,
          originalPrompt: prompt,
        },
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Test] Image generation test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Image generation failed",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Test endpoint with GET for quick testing
 * GET /api/test/image-generation?prompt=your+prompt+here&provider=google
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  const provider = (searchParams.get("provider") || "google") as "google" | "openai";

  if (!prompt) {
    return NextResponse.json(
      {
        ok: false,
        error: "Prompt query parameter is required",
        example: "/api/test/image-generation?prompt=minimalist+line+art+falcon&provider=google",
      },
      { status: 400 },
    );
  }

  if (provider !== "google" && provider !== "openai") {
    return NextResponse.json(
      {
        ok: false,
        error: "Provider must be 'google' or 'openai'",
      },
      { status: 400 },
    );
  }

  console.log(`🧪 Testing image generation with ${provider} for prompt:`, prompt);

  try {
    const startTime = Date.now();
    const result = await generateShirtDesign(prompt, provider);
    const duration = Date.now() - startTime;

    console.log("[Test] Image generation test completed successfully", result);

    return NextResponse.json(
      {
        ok: true,
        result: {
          imageUrl: result.imageUrl,
          title: result.title,
          originalPrompt: prompt,
        },
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Test] Image generation test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Image generation failed",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
