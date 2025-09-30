/**
 * Create a product in Printify with the generated image
 */
export async function createPrintifyProduct(params: {
  imageUrl: string;
  title: string;
  description: string;
}): Promise<PrintifyProduct> {
  // TODO: Implement Printify API integration
  // Example:
  // const response = await fetch('https://api.printify.com/v1/shops/{shop_id}/products.json', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     title: params.title,
  //     description: params.description,
  //     blueprint_id: 3,  // Unisex t-shirt
  //     print_provider_id: 99,  // Example provider
  //     variants: [...],
  //     print_areas: [{
  //       variant_ids: [...],
  //       placeholders: [{
  //         position: 'front',
  //         images: [{ id: uploadedImageId, x: 0.5, y: 0.5, scale: 1, angle: 0 }]
  //       }]
  //     }]
  //   }),
  // });
  // return response.json();

  console.log("[Printify Product] Creating product:", {
    imageUrl: params.imageUrl,
    title: params.title,
  });

  // Dummy implementation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const dummyProduct: PrintifyProduct = {
    id: `prod_${Date.now()}`,
    title: params.title,
    description: params.description,
    blueprint_id: 3,
    print_provider_id: 99,
    variants: [
      {
        id: 12345,
        sku: "SHIRT-M-BLK",
        price: 2500, // $25.00 in cents
        is_enabled: true,
      },
    ],
    images: [
      {
        src: params.imageUrl,
        variant_ids: [12345],
        position: "front",
      },
    ],
  };

  console.log("[Printify Product] Successfully created product:", dummyProduct.id);
  return dummyProduct;
}

/**
 * Upload image to Printify
 */
export async function uploadImageToPrintify(imageUrl: string): Promise<string> {
  // TODO: Implement Printify image upload
  // const response = await fetch('https://api.printify.com/v1/uploads/images.json', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ file_name: 'shirt-design.png', url: imageUrl }),
  // });
  // const data = await response.json();
  // return data.id;

  console.log("[Printify Product] Uploading image to Printify:", imageUrl);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const uploadId = `img_${Date.now()}`;
  console.log("[Printify Product] Successfully uploaded image:", uploadId);
  return uploadId;
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
