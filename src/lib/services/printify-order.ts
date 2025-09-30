import type { TAddressTo } from "@/lib/contracts/shirt";
import { toPrintifyAddress } from "@/lib/providers/printify";

/**
 * Create an order in Printify
 */
export async function createPrintifyOrder(params: {
  productId: string;
  variantId: number;
  quantity: number;
  addressTo: TAddressTo;
}): Promise<PrintifyOrder> {
  // TODO: Implement Printify order creation
  // Example:
  // const response = await fetch('https://api.printify.com/v1/shops/{shop_id}/orders.json', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     external_id: `order-${Date.now()}`,
  //     line_items: [{
  //       product_id: params.productId,
  //       variant_id: params.variantId,
  //       quantity: params.quantity,
  //     }],
  //     shipping_method: 1,
  //     send_shipping_notification: true,
  //     address_to: toPrintifyAddress(params.addressTo),
  //   }),
  // });
  // return response.json();

  console.log("[Printify Order] Creating order:", {
    productId: params.productId,
    variantId: params.variantId,
    quantity: params.quantity,
  });

  // Convert address to Printify format
  const printifyAddress = toPrintifyAddress(params.addressTo);

  // Dummy implementation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const dummyOrder: PrintifyOrder = {
    id: `order_${Date.now()}`,
    external_id: `ext_order_${Date.now()}`,
    status: "pending",
    line_items: [
      {
        product_id: params.productId,
        variant_id: params.variantId,
        quantity: params.quantity,
        price: 2500, // $25.00 in cents
      },
    ],
    address_to: printifyAddress,
    shipment: {
      carrier: "USPS",
      tracking_number: null,
      tracking_url: null,
    },
    created_at: new Date().toISOString(),
  };

  console.log("[Printify Order] Successfully created order:", dummyOrder.id);
  return dummyOrder;
}

/**
 * Submit order for production
 */
export async function submitPrintifyOrder(orderId: string): Promise<void> {
  // TODO: Implement order submission
  // await fetch(`https://api.printify.com/v1/shops/{shop_id}/orders/${orderId}/send_to_production.json`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
  //   },
  // });

  console.log("[Printify Order] Submitting order to production:", orderId);
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("[Printify Order] Successfully submitted order to production");
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
