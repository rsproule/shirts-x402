import { createPrintifyProduct } from "@/lib/services/printify-product";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint for Printify product creation
 * POST /api/test/printify-product
 * Body: { imageUrl: string, title: string, description: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, title, description } = body;

    if (!imageUrl || !title || !description) {
      return NextResponse.json(
        {
          ok: false,
          error: "imageUrl, title, and description are required",
        },
        { status: 400 },
      );
    }

    const startTime = Date.now();
    const product = await createPrintifyProduct({
      imageUrl,
      title,
      description,
    });
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: true,
        result: {
          productId: product.id,
          title: product.title,
          description: product.description,
          variants: product.variants,
          images: product.images,
        },
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Test] Product creation test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Product creation failed",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
