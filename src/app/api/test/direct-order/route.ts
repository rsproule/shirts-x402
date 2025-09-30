import { AddressTo } from "@/lib/contracts/shirt";
import { createDirectPrintifyOrder } from "@/lib/services/printify-order";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint for direct Printify order (skip product creation)
 * POST /api/test/direct-order
 * Body: { imageUrl: string, size?: string, color?: string, variantId?: number, quantity: number, address_to: TAddressTo }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, size, color, variantId, quantity, address_to } = body;

    if (!imageUrl || !quantity || !address_to) {
      return NextResponse.json(
        {
          ok: false,
          error: "imageUrl, quantity, and address_to are required",
        },
        { status: 400 },
      );
    }

    // Validate address with Zod
    const addressValidation = AddressTo.safeParse(address_to);
    if (!addressValidation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid address format",
          details: addressValidation.error.issues,
        },
        { status: 400 },
      );
    }

    const startTime = Date.now();

    // Create direct order (skips product creation)
    const order = await createDirectPrintifyOrder({
      imageUrl,
      size,
      color,
      variantId,
      quantity,
      addressTo: addressValidation.data,
    });

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: true,
        result: {
          orderId: order.id,
          externalId: order.external_id,
          status: order.status,
          lineItems: order.line_items,
          addressTo: order.address_to,
          shipment: order.shipment,
          createdAt: order.created_at,
        },
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
          mode: "direct_order_skip_publish",
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Test] Direct order test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Direct order creation failed",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
