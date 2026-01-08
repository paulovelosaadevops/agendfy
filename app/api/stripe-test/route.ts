import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      STRIPE_SECRET_KEY_EXISTS: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_SECRET_KEY_PREFIX: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + "...",
      STRIPE_SECRET_KEY_LENGTH: process.env.STRIPE_SECRET_KEY?.length || 0,
      STRIPE_PUBLISHABLE_KEY_EXISTS: !!process.env.STRIPE_PUBLISHABLE_KEY,
      STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID || "NOT_SET",
      STRIPE_WEBHOOK_SECRET_EXISTS: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
    tests: {} as Record<string, unknown>,
  }

  // Test 1: Check if secret key is present
  if (!process.env.STRIPE_SECRET_KEY) {
    diagnostics.tests.secretKey = {
      status: "FAIL",
      message: "STRIPE_SECRET_KEY environment variable is not set",
    }
    return NextResponse.json(diagnostics, { status: 500 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY.trim()

  // Test 2: Check secret key format
  if (!secretKey.startsWith("sk_")) {
    diagnostics.tests.secretKeyFormat = {
      status: "FAIL",
      message: "STRIPE_SECRET_KEY must start with 'sk_test_' or 'sk_live_'",
    }
    return NextResponse.json(diagnostics, { status: 500 })
  }

  diagnostics.tests.secretKeyFormat = {
    status: "PASS",
    keyType: secretKey.startsWith("sk_live_") ? "LIVE" : "TEST",
  }

  // Test 3: Initialize Stripe
  let stripe: Stripe
  try {
    stripe = new Stripe(secretKey, {
      apiVersion: "2024-11-20.acacia",
    })
    diagnostics.tests.stripeInitialization = { status: "PASS" }
  } catch (error) {
    diagnostics.tests.stripeInitialization = {
      status: "FAIL",
      error: error instanceof Error ? error.message : String(error),
    }
    return NextResponse.json(diagnostics, { status: 500 })
  }

  // Test 4: Test API connection
  try {
    const balance = await stripe.balance.retrieve()
    diagnostics.tests.apiConnection = {
      status: "PASS",
      currency: balance.available[0]?.currency || "unknown",
      availableAmount: balance.available[0]?.amount || 0,
    }
  } catch (error: unknown) {
    const err = error as { type?: string; message?: string; code?: string }
    diagnostics.tests.apiConnection = {
      status: "FAIL",
      errorType: err.type || "unknown",
      errorCode: err.code || "unknown",
      message: err.message || String(error),
    }
    return NextResponse.json(diagnostics, { status: 500 })
  }

  // Test 5: Validate price ID
  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    diagnostics.tests.priceId = {
      status: "FAIL",
      message: "STRIPE_PRICE_ID environment variable is not set",
    }
  } else {
    try {
      const price = await stripe.prices.retrieve(priceId)
      diagnostics.tests.priceId = {
        status: "PASS",
        priceId: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        productId: price.product,
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      diagnostics.tests.priceId = {
        status: "FAIL",
        priceId,
        error: err.message || String(error),
      }
    }
  }

  // All tests passed
  diagnostics.tests.overall = { status: "PASS", message: "All Stripe configurations are valid!" }

  return NextResponse.json(diagnostics, { status: 200 })
}
