import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402";

export const middleware = paymentMiddleware(
  "0xc0541B06F703c6753B842D83cF62d55F93EE81bE", // rsproule merit wallet
  {
    "/api/shirts": {
      price: "$0.01",
      network: "base",
      config: {
        description: "Programmatic Shirt create + purchase",
      },
    },
  },
  facilitator,
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/shirts"],
};
