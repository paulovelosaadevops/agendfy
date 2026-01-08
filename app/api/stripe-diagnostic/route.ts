import { type NextRequest, NextResponse } from "next/server"
import { getStripe, STRIPE_PRICE_ID } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    let stripe
    try {
      stripe = getStripe()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.",
          environment: {
            hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
            hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
            hasPriceId: !!process.env.STRIPE_PRICE_ID,
            configuredPriceId: process.env.STRIPE_PRICE_ID || "NOT SET",
          },
        },
        { status: 500 },
      )
    }

    // Get configured Price ID
    const configuredPriceId = STRIPE_PRICE_ID

    console.log("[v0] Configured STRIPE_PRICE_ID:", configuredPriceId)

    // Test the connection by listing prices
    let prices
    try {
      prices = await stripe.prices.list({
        limit: 100,
        active: true,
      })
      console.log("[v0] Found", prices.data.length, "active prices")
    } catch (stripeError: unknown) {
      console.error("[v0] Stripe API error:", stripeError)

      const errorMessage = stripeError instanceof Error ? stripeError.message : "Unknown Stripe error"

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          hint: "Please verify your STRIPE_SECRET_KEY is correct and not revoked.",
          environment: {
            hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
            secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8) + "...",
            hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
            hasPriceId: !!process.env.STRIPE_PRICE_ID,
            configuredPriceId: configuredPriceId || "NOT SET",
          },
        },
        { status: 500 },
      )
    }

    // Try to retrieve the configured price
    let configuredPrice = null
    if (configuredPriceId) {
      try {
        configuredPrice = await stripe.prices.retrieve(configuredPriceId)
        console.log("[v0] Configured price found:", configuredPrice.id)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("[v0] Configured price NOT found:", errorMessage)
      }
    }

    return NextResponse.json(
      {
        success: true,
        environment: {
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
          hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
          hasPriceId: !!process.env.STRIPE_PRICE_ID,
          configuredPriceId: configuredPriceId || "NOT SET",
        },
        configuredPrice: configuredPrice
          ? {
              id: configuredPrice.id,
              active: configuredPrice.active,
              currency: configuredPrice.currency,
              unit_amount: configuredPrice.unit_amount,
              recurring: configuredPrice.recurring,
              product: configuredPrice.product,
            }
          : null,
        allActivePrices: prices.data
          .map((p) => ({
            id: p.id,
            active: p.active,
            currency: p.currency,
            unit_amount: p.unit_amount,
            recurring: p.recurring,
            product: p.product,
            created: new Date(p.created * 1000).toISOString(),
          }))
          .sort((a, b) => b.created.localeCompare(a.created)),
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error("[v0] Stripe diagnostic error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
