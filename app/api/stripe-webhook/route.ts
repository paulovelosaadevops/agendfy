import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import { getAdminDb, serverTimestamp } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  console.log("[v0] 🔔 Webhook received at /api/stripe-webhook")

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    console.error("[v0] ❌ No signature in webhook request")
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[v0] ❌ STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe!.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    console.log("[v0] ✅ Webhook signature verified:", event.type)
  } catch (error) {
    console.error("[v0] ❌ Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  async function updateUserSubscription(professionalId: string, subscription: Stripe.Subscription) {
    const isActive = subscription.status === "active"

    console.log("[v0] 📝 Updating user:", professionalId)
    console.log("[v0] 📊 Subscription status:", subscription.status)
    console.log("[v0] 🎯 Is Active:", isActive)
    console.log("[v0] 🔍 Raw subscription.current_period_end:", subscription.current_period_end)
    console.log("[v0] 🔍 Raw subscription.created:", subscription.created)
    console.log("[v0] 🔍 Raw subscription.cancel_at:", subscription.cancel_at)

    const safeTimestamp = (unixSeconds: number | null | undefined): Timestamp | null => {
      if (!unixSeconds) {
        console.log("[v0] ⚠️ Timestamp is null or undefined")
        return null
      }
      if (typeof unixSeconds !== "number") {
        console.error("[v0] ❌ Timestamp is not a number:", unixSeconds)
        return null
      }
      if (unixSeconds <= 0) {
        console.error("[v0] ❌ Timestamp is negative or zero:", unixSeconds)
        return null
      }
      try {
        const timestamp = Timestamp.fromMillis(unixSeconds * 1000)
        console.log("[v0] ✅ Converted timestamp:", unixSeconds, "→", timestamp.toDate().toISOString())
        return timestamp
      } catch (error) {
        console.error("[v0] ❌ Timestamp conversion failed:", unixSeconds, error)
        return null
      }
    }

    const db = getAdminDb()
    const userRef = db.collection("users").doc(professionalId)

    const currentPeriodEnd = safeTimestamp(subscription.current_period_end)
    const startedAt = safeTimestamp(subscription.created)
    const cancelAt = safeTimestamp(subscription.cancel_at)

    console.log(
      "[v0] 📅 Timestamps - currentPeriodEnd:",
      currentPeriodEnd,
      "startedAt:",
      startedAt,
      "cancelAt:",
      cancelAt,
    )

    if (isActive && !currentPeriodEnd) {
      console.error("[v0] 🚨 CRITICAL: Active subscription has null currentPeriodEnd!")
      console.error("[v0] 🚨 Raw value:", subscription.current_period_end)
      throw new Error("Cannot create active subscription without currentPeriodEnd")
    }

    const updateData = {
      plan: isActive ? "premium" : "free",
      subscriptionStatus: isActive ? "premium" : "free",
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: currentPeriodEnd,
      subscription: {
        active: isActive,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        plan: "premium",
        startedAt: startedAt,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        cancelAt: cancelAt,
      },
      trial: {
        active: false,
        endedAt: isActive ? serverTimestamp() : null,
        endsAt: null,
      },
      updatedAt: serverTimestamp(),
    }

    console.log("[v0] 💾 Data to save:", JSON.stringify(updateData, null, 2))

    await userRef.set(updateData, { merge: true })

    console.log("[v0] ✅ User updated successfully:", professionalId)
    console.log("[v0] 🎉 Subscription status:", isActive ? "PREMIUM ACTIVATED" : "INACTIVE")
    console.log("[v0] 🚫 Trial status:", "ENDED")
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("[v0] 🛒 Processing checkout.session.completed")
        const session = event.data.object as Stripe.Checkout.Session
        const professionalId = session.metadata?.professionalId

        console.log("[v0] 👤 Professional ID:", professionalId)
        console.log("[v0] 🆔 Customer ID:", session.customer)
        console.log("[v0] 📋 Subscription ID:", session.subscription)

        if (!professionalId) {
          console.error("[v0] ❌ No professionalId in session metadata")
          return NextResponse.json({ error: "No professionalId in metadata" }, { status: 400 })
        }

        const subscriptionId = session.subscription as string

        if (subscriptionId) {
          const subscription = await stripe!.subscriptions.retrieve(subscriptionId)
          await updateUserSubscription(professionalId, subscription)
        } else {
          console.log("[v0] ⚠️ No subscription in checkout session")
        }
        break
      }

      case "customer.subscription.created": {
        console.log("[v0] 🆕 Processing customer.subscription.created")
        const subscription = event.data.object as Stripe.Subscription
        const professionalId = subscription.metadata?.professionalId

        console.log("[v0] 👤 Professional ID:", professionalId)
        console.log("[v0] 📋 Subscription ID:", subscription.id)

        if (!professionalId) {
          console.error("[v0] ❌ No professionalId in subscription metadata")
          return NextResponse.json({ error: "No professionalId in metadata" }, { status: 400 })
        }

        await updateUserSubscription(professionalId, subscription)
        break
      }

      case "customer.subscription.updated": {
        console.log("[v0] 🔄 Processing customer.subscription.updated")
        const subscription = event.data.object as Stripe.Subscription
        const professionalId = subscription.metadata?.professionalId

        if (!professionalId) {
          console.error("[v0] ❌ No professionalId in subscription metadata")
          return NextResponse.json({ error: "No professionalId in metadata" }, { status: 400 })
        }

        await updateUserSubscription(professionalId, subscription)
        break
      }

      case "invoice.payment_succeeded": {
        console.log("[v0] 💳 Processing invoice.payment_succeeded")
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) {
          console.log("[v0] ℹ️ No subscription in invoice - one-time payment")
          break
        }

        const subscription = await stripe!.subscriptions.retrieve(subscriptionId)
        const professionalId = subscription.metadata?.professionalId

        console.log("[v0] 👤 Professional ID:", professionalId)

        if (!professionalId) {
          console.error("[v0] ❌ No professionalId in subscription metadata")
          return NextResponse.json({ error: "No professionalId in metadata" }, { status: 400 })
        }

        await updateUserSubscription(professionalId, subscription)
        break
      }

      case "customer.subscription.deleted": {
        console.log("[v0] 🗑️ Processing customer.subscription.deleted")
        const subscription = event.data.object as Stripe.Subscription
        const professionalId = subscription.metadata?.professionalId

        if (!professionalId) {
          console.error("[v0] ❌ No professionalId in subscription metadata")
          return NextResponse.json({ error: "No professionalId in metadata" }, { status: 400 })
        }

        const db = getAdminDb()
        const userRef = db.collection("users").doc(professionalId)

        await userRef.set(
          {
            plan: "free",
            subscriptionStatus: "free",
            subscription: {
              active: false,
              cancelAtPeriodEnd: false,
              cancelAt: null,
            },
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        console.log("[v0] ✅ Subscription DELETED - user set to FREE:", professionalId)
        break
      }

      default:
        console.log("[v0] ℹ️ Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] ❌ Error processing webhook:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("[v0] 📋 Error details:", errorMessage)
    console.error("[v0] 📚 Error stack:", errorStack)
    return NextResponse.json({ error: "Webhook processing failed", details: errorMessage }, { status: 500 })
  }
}
