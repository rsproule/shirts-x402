import { facilitator } from "@coinbase/x402";
import { paymentMiddleware } from "x402-next";

export const middleware = paymentMiddleware(
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

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/shirts", "/api/shirts/from-image"],
};
