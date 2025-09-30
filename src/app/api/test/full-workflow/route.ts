import { CreateShirtBody } from "@/lib/contracts/shirt";
import { executeCreateShirtWorkflow } from "@/lib/tasks/create-shirt-workflow";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint for the complete workflow
 * POST /api/test/full-workflow
 * Body: TCreateShirt (prompt + address_to)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate with Zod
    const validation = CreateShirtBody.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const jobId = randomUUID();

    const startTime = Date.now();
    const result = await executeCreateShirtWorkflow(validation.data, jobId);
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: result.success,
        result: result.success
          ? {
              jobId: result.jobId,
              imageUrl: result.imageUrl,
              productId: result.productId,
              orderId: result.orderId,
              trackingInfo: result.trackingInfo,
            }
          : {
              jobId: result.jobId,
              error: result.error,
            },
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: result.success ? 200 : 500 },
    );
  } catch (error: any) {
    console.error("[Test] Full workflow test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Workflow failed",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
