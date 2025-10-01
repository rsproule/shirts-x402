import z, { ZodObject, ZodRawShape } from "zod";
import { HTTPRequestStructure } from "x402/types";

export function inputSchemaToX402(inputSchema: ZodObject<ZodRawShape>): HTTPRequestStructure {
  const jsonSchema = z.toJSONSchema(inputSchema);

  return {
    type: "http" as const,
    method: "POST" as const,
    bodyType: "json" as const,
    bodyFields: jsonSchema.properties,
  };
}
