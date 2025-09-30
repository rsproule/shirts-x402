import { facilitator } from "@coinbase/x402";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { paymentMiddleware } from "x402-next";
import { CreateShirtBody, ShirtJob } from "./lib/contracts/shirt";
import { z } from "zod";
import { inputSchemaToX402 } from "./lib/x402-schema";
import { CreateShirtFromImageBody } from "./app/api/shirts/from-image/route";

const paymentMw = paymentMiddleware(
  "0xc0541B06F703c6753B842D83cF62d55F93EE81bE", // rsproule merit wallet
  {
    "/api/shirts": {
      price: "$25.00",
      network: "base",
      config: {
        description: "AI-generated shirt design + purchase",
        inputSchema: inputSchemaToX402(CreateShirtBody),
        outputSchema: z.toJSONSchema(ShirtJob),
      },
    },
    "/api/shirts/from-image": {
      price: "$25.00",
      network: "base",
      config: {
        description: "Custom shirt from your image",
        inputSchema: inputSchemaToX402(CreateShirtFromImageBody),
        outputSchema: z.toJSONSchema(ShirtJob),
      },
    },
  },
  facilitator,
);

export async function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-payment",
      },
    });
  }

  // Run payment middleware
  const response = await paymentMw(request);

  // Add CORS headers to all responses
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-payment",
  );

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/shirts", "/api/shirts/from-image"],
};
