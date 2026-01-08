import { type NextRequest, NextResponse } from "next/server"
import { getStripe, STRIPE_PRICE_ID } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Creating checkout session...")

    let stripe
    try {
      stripe = getStripe()
    } catch (error) {
      console.error("[v0] Stripe not configured:", error)
      return NextResponse.json({ error: "Stripe is not configured. Please contact support." }, { status: 500 })
    }

    const { userId, email, businessName, role } = await req.json()

    if (!userId || !email) {
      console.log("[v0] Error: Missing required fields")
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 })
    }

    console.log("[v0] User ID:", userId)
    console.log("[v0] User role:", role)

    // Verify user is a professional
    if (role !== "professional") {
      console.log("[v0] Error: User is not a professional")
      return NextResponse.json({ error: "Only professionals can subscribe" }, { status: 403 })
    }

    const priceId = STRIPE_PRICE_ID
    if (!priceId) {
      console.log("[v0] Error: STRIPE_PRICE_ID not configured")
      return NextResponse.json(
        { error: "Stripe Price ID not configured. Please set STRIPE_PRICE_ID environment variable." },
        { status: 500 },
      )
    }

    const getBaseUrl = () => {
      // Try origin header first
      const origin = req.headers.get("origin")
      if (origin && origin !== "null") return origin

      // Try referer header
      const referer = req.headers.get("referer")
      if (referer) {
        try {
          const url = new URL(referer)
          return url.origin
        } catch {}
      }

      // Try x-forwarded-host
      const forwardedHost = req.headers.get("x-forwarded-host")
      const forwardedProto = req.headers.get("x-forwarded-proto") || "https"
      if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`
      }

      // Try host header
      const host = req.headers.get("host")
      if (host) {
        const proto = host.includes("localhost") ? "http" : "https"
        return `${proto}://${host}`
      }

      // Final fallback
      return "https://v0-app-agendfy.vercel.app"
    }

    const baseUrl = getBaseUrl()
    console.log("[v0] Base URL for redirects:", baseUrl)

    console.log("[v0] Creating Stripe session with price:", priceId)

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard/subscription`,
        customer_email: email,
        locale: "pt-BR",
        billing_address_collection: "auto",
        payment_method_options: {
          card: {
            request_three_d_secure: "automatic",
          },
        },
        metadata: {
          professionalId: userId,
          businessName: businessName || "",
          email: email,
        },
        subscription_data: {
          metadata: {
            professionalId: userId,
            email: email,
          },
        },
      })

      console.log("[v0] Checkout session created:", session.id)
      console.log("[v0] Checkout URL:", session.url)

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      })
    } catch (stripeError: unknown) {
      console.error("[v0] Stripe API error:", stripeError)

      if (stripeError && typeof stripeError === "object" && "type" in stripeError) {
        const err = stripeError as { type: string; message: string; code?: string }
        if (err.type === "StripeAuthenticationError") {
          return NextResponse.json(
            { error: "Invalid Stripe API key. Please check your STRIPE_SECRET_KEY configuration." },
            { status: 500 },
          )
        }
        if (err.type === "StripeInvalidRequestError") {
          return NextResponse.json({ error: `Stripe configuration error: ${err.message}` }, { status: 500 })
        }
      }

      throw stripeError
    }
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
