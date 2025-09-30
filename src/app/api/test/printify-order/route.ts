import { AddressTo } from "@/lib/contracts/shirt";
import {
  createPrintifyOrder,
  submitPrintifyOrder,
} from "@/lib/services/printify-order";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint for Printify order creation
 * POST /api/test/printify-order
 * Body: { productId: string, variantId: number, quantity: number, address_to: TAddressTo }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity, address_to } = body;

    if (!productId || !variantId || !quantity || !address_to) {
      return NextResponse.json(
        {
          ok: false,
          error: "productId, variantId, quantity, and address_to are required",
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

    // Create order
    const order = await createPrintifyOrder({
      productId,
      variantId,
      quantity,
      addressTo: addressValidation.data,
    });

    // Submit to production
    await submitPrintifyOrder(order.id);

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
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Test] Order creation test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Order creation failed",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
