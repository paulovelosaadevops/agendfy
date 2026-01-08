import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getAdminDb, serverTimestamp } from "@/lib/firebase-admin"

export async function POST(req: Request) {
  try {
    const { subscriptionId, userId } = await req.json()

    if (!subscriptionId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Cancel subscription at period end (not immediately)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    const db = getAdminDb()
    const userRef = db.collection("users").doc(userId)

    await userRef.update({
      "subscription.cancelAtPeriodEnd": true,
      "subscription.cancelAt": new Date(subscription.cancel_at! * 1000),
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
      cancelAt: subscription.cancel_at,
    })
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao cancelar assinatura" },
      { status: 500 },
    )
  }
}
