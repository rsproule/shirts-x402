import { facilitator } from "@coinbase/x402";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { paymentMiddleware } from "x402-next";

const paymentMw = paymentMiddleware(
  "0xc0541B06F703c6753B842D83cF62d55F93EE81bE", // rsproule merit wallet
  {
    "/api/shirts": {
      price: "$25.00",
      network: "base",
      config: {
        description: "AI-generated shirt design + purchase",
      },
    },
    "/api/shirts/from-image": {
      price: "$25.00",
      network: "base",
      config: {
        description: "Custom shirt from your image",
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
