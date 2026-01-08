import { type NextRequest, NextResponse } from "next/server"
import { STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  const checks = {
    webhookSecretConfigured: !!STRIPE_WEBHOOK_SECRET,
    webhookSecretValue: STRIPE_WEBHOOK_SECRET ? `${STRIPE_WEBHOOK_SECRET.slice(0, 10)}...` : "NOT SET",
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(checks, { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    return NextResponse.json({
      success: true,
      message: "Webhook endpoint is reachable",
      bodyLength: body.length,
      hasSignature: !!req.headers.get("stripe-signature"),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process test request" }, { status: 500 })
  }
}
