import type { TCreateShirt } from "@/lib/contracts/shirt";
import { generateShirtDesign } from "@/lib/services/image-generation";
import {
  createDirectPrintifyOrder,
  createPrintifyOrder,
} from "@/lib/services/printify-order";
import { createPrintifyProduct } from "@/lib/services/printify-product";

/**
 * Complete workflow for creating a shirt
 * 1. Generate image and title from prompt using LLM
 * 2a. (skip_publish=false) Create product in Printify, publish, then order
 * 2b. (skip_publish=true) Submit order directly with image URL
 */
export async function executeCreateShirtWorkflow(
  input: TCreateShirt,
  jobId: string,
  options: {
    imageProvider?: "google" | "openai";
    skipPublish?: boolean;
    variantId?: number;
  } = {},
): Promise<ShirtWorkflowResult> {
  const { imageProvider = "google", skipPublish = true, variantId } = options;

  try {
    const { imageUrl, title } = await generateShirtDesign(
      input.prompt,
      imageProvider,
    );

    let productId: string | undefined;
    let order: any;

    if (skipPublish) {
      // Direct order: Skip product creation, order with image URL directly
      order = await createDirectPrintifyOrder({
        imageUrl,
        size: input.size,
        color: input.color,
        variantId,
        quantity: 1,
        addressTo: input.address_to,
      });
    } else {
      // Traditional flow: Create product, publish, then order
      const product = await createPrintifyProduct({
        imageUrl,
        title,
        description: input.prompt,
      });

      productId = product.id;

      order = await createPrintifyOrder({
        productId: product.id,
        variantId: product.variants[0].id,
        quantity: 1,
        addressTo: input.address_to,
      });
    }

    return {
      success: true,
      jobId,
      imageUrl,
      productId,
      orderId: order.id,
      trackingInfo: null,
    };
  } catch (error) {
    console.error(`[Workflow] Error for job ${jobId}:`, error);

    return {
      success: false,
      jobId,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Queue the workflow for background processing
 * In production, this would use a queue system like BullMQ, Inngest, etc.
 */
export async function queueCreateShirtWorkflow(
  input: TCreateShirt,
  jobId: string,
): Promise<void> {
  // TODO: Implement with proper queue system
  // Example with BullMQ:
  // await shirtQueue.add('create-shirt', { input, jobId }, {
  //   attempts: 3,
  //   backoff: { type: 'exponential', delay: 2000 },
  // });

  // For now, execute immediately in the background
  // In production, you'd want a proper queue worker
  console.log(`📋 Queuing workflow for job ${jobId}`);

  // Execute asynchronously (fire and forget for now)
  executeCreateShirtWorkflow(input, jobId)
    .then((result) => {
      // TODO: Update job status in database
      console.log("Workflow result:", result);
    })
    .catch((error) => {
      console.error("Workflow error:", error);
    });
}

// Workflow result types
export interface ShirtWorkflowResult {
  success: boolean;
  jobId: string;
  imageUrl?: string;
  productId?: string;
  orderId?: string;
  trackingInfo?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
  } | null;
  error?: string;
}

/**
 * Get workflow status (for future status endpoint)
 */
export async function getWorkflowStatus(
  jobId: string,
): Promise<WorkflowStatus> {
  // TODO: Implement status retrieval from database/queue
  return {
    jobId,
    status: "processing",
    steps: [
      { name: "generate_image", status: "completed", completedAt: new Date() },
      { name: "create_product", status: "processing", completedAt: null },
      { name: "create_order", status: "pending", completedAt: null },
    ],
  };
}

export interface WorkflowStatus {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  steps: WorkflowStep[];
  result?: ShirtWorkflowResult;
}

export interface WorkflowStep {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  completedAt: Date | null;
  error?: string;
}
