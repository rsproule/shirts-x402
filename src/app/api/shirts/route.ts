import { CreateShirtBody, type TCreateShirt } from "@/lib/contracts/shirt";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Example: business validators that go beyond Zod
function validateAddressBusinessRules(addr: { country: string; zip: string }) {
  // Add country-specific ZIP heuristics as needed; keep minimal for now.
  if (addr.country === "US" && !/^\d{5}(-\d{4})?$/.test(addr.zip)) {
    return {
      ok: false as const,
      code: "INVALID_ADDRESS",
      message: "Invalid US ZIP format",
    };
  }
  return { ok: true as const };
}

// Example: idempotency (optional but recommended)
function idempotencyKey(req: NextRequest) {
  return req.headers.get("Idempotency-Key") ?? null;
}

// Example: stub to queue work (image gen + Printify order creation)
async function queueCreateShirtJob(input: {
  prompt: string;
  address_to: TCreateShirt["address_to"];
  idemKey: string | null;
}) {
  // TODO: persist job to DB/queue; return job id
  const id = randomUUID();
  // push to your queue here
  return { id, status: "queued" as const };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate with Zod
    const validation = CreateShirtBody.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid request body",
            details: validation.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const validatedBody = validation.data;

    // Business checks in addition to Zod
    const biz = validateAddressBusinessRules({
      country: validatedBody.address_to.country,
      zip: validatedBody.address_to.zip,
    });
    if (!biz.ok) {
      return NextResponse.json(
        { ok: false, error: { code: biz.code, message: biz.message } },
        { status: 422 },
      );
    }

    const idem = idempotencyKey(req);
    const job = await queueCreateShirtJob({
      prompt: validatedBody.prompt,
      address_to: validatedBody.address_to,
      idemKey: idem,
    });

    // Validate the response shape at runtime (defensive)
    // If you want, re-use ShirtJob.safeParse(job) here.

    return NextResponse.json(job, { status: 202 });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to queue job" },
      },
      { status: 500 },
    );
  }
}
