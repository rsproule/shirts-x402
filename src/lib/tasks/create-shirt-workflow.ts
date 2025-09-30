import type { TCreateShirt } from "@/lib/contracts/shirt";
import { generateShirtDesign } from "@/lib/services/image-generation";
import {
  createPrintifyOrder,
  submitPrintifyOrder,
} from "@/lib/services/printify-order";
import { createPrintifyProduct } from "@/lib/services/printify-product";

/**
 * Complete workflow for creating a shirt
 * 1. Generate image and title from prompt using LLM
 * 2. Create product in Printify
 * 3. Create order for the product
 */
export async function executeCreateShirtWorkflow(
  input: TCreateShirt,
  jobId: string,
): Promise<ShirtWorkflowResult> {
  console.log(`🎯 Starting shirt workflow for job ${jobId}`);

  try {
    // Step 1: Generate image and title using AI
    console.log("Step 1/3: Generating image and title...");
    const { imageUrl, title } = await generateShirtDesign(input.prompt);

    // Step 2: Create product in Printify
    console.log("Step 2/3: Creating Printify product...");
    const product = await createPrintifyProduct({
      imageUrl,
      title, // LLM-generated title
      description: input.prompt, // Original prompt as description
    });

    // Step 3: Create and submit order
    console.log("Step 3/3: Creating order...");
    const order = await createPrintifyOrder({
      productId: product.id,
      variantId: product.variants[0].id,
      quantity: 1,
      addressTo: input.address_to,
    });

    // Submit to production
    await submitPrintifyOrder(order.id);

    console.log(`✅ Workflow completed successfully for job ${jobId}`);

    return {
      success: true,
      jobId,
      imageUrl,
      productId: product.id,
      orderId: order.id,
      trackingInfo: null, // Will be updated later
    };
  } catch (error) {
    console.error(`❌ Workflow failed for job ${jobId}:`, error);

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
