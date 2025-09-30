import type { TAddressTo } from "@/lib/contracts/shirt";
import { toPrintifyAddress } from "@/lib/providers/printify";
import Printify from "printify-sdk-js";

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

// Initialize Printify SDK
const getPrintifyClient = () => {
  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    throw new Error("PRINTIFY_API_KEY and PRINTIFY_SHOP_ID must be set");
  }

  return new Printify({
    accessToken: PRINTIFY_API_KEY,
    shopId: PRINTIFY_SHOP_ID,
    enableLogging: false,
  });
};

/**
 * Create an order in Printify
 */
export async function createPrintifyOrder(params: {
  productId: string;
  variantId: number;
  quantity: number;
  addressTo: TAddressTo;
}): Promise<PrintifyOrder> {
  try {
    const printify = getPrintifyClient();

    // Convert address to Printify format
    const printifyAddress = toPrintifyAddress(params.addressTo);

    const orderPayload = {
      external_id: `order-${Date.now()}`,
      line_items: [
        {
          product_id: params.productId,
          variant_id: params.variantId,
          quantity: params.quantity,
        },
      ],
      shipping_method: 1,
      send_shipping_notification: true,
      address_to: printifyAddress,
    };

    const order = await printify.orders.create(orderPayload);
    return order as PrintifyOrder;
  } catch (error) {
    console.error("[Printify] Order creation error:", error);
    throw new Error(
      `Failed to create order: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Submit order for production
 */
export async function submitPrintifyOrder(orderId: string): Promise<void> {
  try {
    const printify = getPrintifyClient();
    await printify.orders.submit(orderId);
  } catch (error) {
    console.error("[Printify] Order submission error:", error);
    throw new Error(
      `Failed to submit order: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

// Printify Order Types
export interface PrintifyOrder {
  id: string;
  external_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  line_items: PrintifyLineItem[];
  address_to: any;
  shipment: PrintifyShipment;
  created_at: string;
}

export interface PrintifyLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
  price: number;
}

export interface PrintifyShipment {
  carrier: string;
  tracking_number: string | null;
  tracking_url: string | null;
}
