import { initContract } from "@ts-rest/core";
import { z } from "zod";

// --- Shared primitives
const CountryISO2 = z
  .string()
  .regex(/^[A-Z]{2}$/, "Use ISO-3166-1 alpha-2 (e.g. US, BE)")
  .transform((s) => s.toUpperCase());

export const AddressTo = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3).max(32).optional().or(z.literal("")).optional(), // Printify tolerates many formats
  country: CountryISO2,
  region: z.string().optional().default(""),
  address1: z.string().min(1),
  address2: z.string().optional().default(""),
  city: z.string().min(1),
  zip: z.string().min(1),
});

export const CreateShirtBody = z.object({
  prompt: z.string().min(10, "Prompt too short").max(4000, "Prompt too long"),
  address_to: AddressTo,
});

export const ShirtJob = z.object({
  id: z.string().uuid(),
  status: z.enum(["queued", "processing", "failed", "completed"]),
  // You can extend later with preview_url, order_id, etc.
});

export const ErrorShape = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(), // e.g. "BAD_REQUEST" | "INVALID_ADDRESS" | "PRINT_PROVIDER_ERROR"
    message: z.string(),
    details: z.any().optional(),
  }),
});

// --- API contract
const c = initContract();

export const shirtRouter = c.router({
  createShirt: {
    method: "POST",
    path: "/shirts",
    summary: "Create a shirt from an LLM prompt and queue fulfillment",
    body: CreateShirtBody,
    responses: {
      202: ShirtJob, // job queued
      400: ErrorShape,
      422: ErrorShape, // schema valid but business invalid (e.g. address rejected by provider)
      500: ErrorShape,
    },
  },
});

export type ShirtApi = typeof shirtRouter;
export type TCreateShirt = z.infer<typeof CreateShirtBody>;
export type TAddressTo = z.infer<typeof AddressTo>;
export type TShirtJob = z.infer<typeof ShirtJob>;
