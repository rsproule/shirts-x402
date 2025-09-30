import { NextResponse } from "next/server"
import { generateOpenApi } from "@ts-rest/open-api"
import { shirtRouter } from "@/lib/contracts/shirt"

const doc = generateOpenApi(shirtRouter, {
  info: { title: "Merit Shirts API", version: "1.0.0" },
  servers: [{ url: "/api" }],
})

export function GET() {
  return NextResponse.json(doc)
}
