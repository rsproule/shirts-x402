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

// Default configuration for t-shirt products
const DEFAULT_BLUEPRINT_ID = 706; // Comfort Colors t-shirt
const DEFAULT_PRINT_PROVIDER_ID = 99;

// Comfort Colors variant IDs
const COMFORT_COLORS_VARIANTS = [
  78994, 73199, 78993, 78962, 78991, 78964, 78961, 78963, 73203, 78992, 73211,
  73207, 78965, 73215, 78995,
];

/**
 * Upload image to Printify
 * @param imageUrl - Base64 data URL or remote URL
 * @returns Printify image upload ID
 */
export async function uploadImageToPrintify(imageUrl: string): Promise<string> {
  try {
    const printify = getPrintifyClient();

    // Extract base64 from data URL if present
    const base64Data = imageUrl.startsWith("data:")
      ? imageUrl.split(",")[1]
      : imageUrl;

    const result = await printify.uploads.uploadImage({
      file_name: `shirt-design-${Date.now()}.png`,
      contents: base64Data,
    });

    return result.id;
  } catch (error: any) {
    console.error("[Printify] Upload error:", error);
    console.error("[Printify] Upload error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw new Error(
      `Failed to upload image: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`,
    );
  }
}

/**
 * Create a product in Printify with the generated image
 */
export async function createPrintifyProduct(params: {
  imageUrl: string;
  title: string;
  description: string;
  placement?: "front" | "back";
}): Promise<PrintifyProduct> {
  try {
    const printify = getPrintifyClient();

    // Step 1: Upload image to Printify
    const uploadedImageId = await uploadImageToPrintify(params.imageUrl);

    // Step 2: Create product with uploaded image
    const productPayload = {
      title: params.title,
      description: params.description || "",
      blueprint_id: DEFAULT_BLUEPRINT_ID,
      print_provider_id: DEFAULT_PRINT_PROVIDER_ID,
      variants: COMFORT_COLORS_VARIANTS.map((id) => ({
        id,
        price: 2500, // $25.00 in cents
        is_enabled: true,
      })),
      print_areas: [
        {
          variant_ids: COMFORT_COLORS_VARIANTS,
          placeholders: [
            {
              position: params.placement === "back" ? "back" : "front",
              images: [
                {
                  id: uploadedImageId,
                  x: 0.5,
                  y: 0.4,
                  scale: 0.5,
                  angle: 0,
                },
              ],
            },
          ],
        },
      ],
    };

    const product = await printify.products.create(productPayload);

    // Step 3: Publish the product
    await publishPrintifyProduct(product.id);

    return product as PrintifyProduct;
  } catch (error: any) {
    console.error("[Printify] Product creation error:", error);
    throw new Error(
      `Failed to create product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Publish a product to make it available
 */
export async function publishPrintifyProduct(productId: string): Promise<void> {
  try {
    const printify = getPrintifyClient();

    await printify.products.publishOne(productId, {
      title: true,
      description: true,
      images: true,
      variants: true,
      tags: true,
      keyFeatures: true,
      shipping_template: true,
    });
  } catch (error) {
    console.error("[Printify] Publish error:", error);
    throw new Error(
      `Failed to publish product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Get product details from Printify
 */
export async function getPrintifyProduct(
  productId: string,
): Promise<PrintifyProduct> {
  try {
    const printify = getPrintifyClient();
    const product = await printify.products.getOne(productId);
    return product as PrintifyProduct;
  } catch (error) {
    console.error("[Printify] Get product error:", error);
    throw new Error(
      `Failed to get product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

// Printify API Types
export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: PrintifyVariant[];
  images: PrintifyImage[];
}

export interface PrintifyVariant {
  id: number;
  sku: string;
  price: number;
  is_enabled: boolean;
}

export interface PrintifyImage {
  src: string;
  variant_ids: number[];
  position: string;
}
