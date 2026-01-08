import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { adminDb } from "@/lib/firebase-admin"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Buscando assinaturas do Stripe para:", email)

    // Buscar cliente no Stripe pelo email
    const customers = await stripe.customers.list({
      email,
      limit: 10,
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: "Nenhum cliente encontrado no Stripe com este email" }, { status: 404 })
    }

    console.log("[v0] Clientes encontrados:", customers.data.length)

    // Buscar todas as assinaturas ativas desses clientes
    const allSubscriptions: Stripe.Subscription[] = []
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 10,
      })
      allSubscriptions.push(...subscriptions.data)
    }

    console.log("[v0] Assinaturas ativas encontradas:", allSubscriptions.length)

    if (allSubscriptions.length === 0) {
      return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada" }, { status: 404 })
    }

    // Se houver múltiplas assinaturas, cancelar as duplicadas (manter apenas a mais recente)
    if (allSubscriptions.length > 1) {
      console.log("[v0] AVISO: Múltiplas assinaturas encontradas. Cancelando duplicadas...")

      // Ordenar por data de criação (mais recente primeiro)
      allSubscriptions.sort((a, b) => b.created - a.created)

      // Manter a primeira (mais recente) e cancelar o resto
      const toKeep = allSubscriptions[0]
      const toCancel = allSubscriptions.slice(1)

      for (const sub of toCancel) {
        console.log("[v0] Cancelando assinatura duplicada:", sub.id)
        await stripe.subscriptions.cancel(sub.id)
      }

      console.log("[v0] Mantida assinatura:", toKeep.id)
    }

    const activeSubscription = allSubscriptions[0]

    // Buscar usuário no Firestore pelo email
    const usersSnapshot = await adminDb.collection("users").where("email", "==", email).limit(1).get()

    if (usersSnapshot.empty) {
      return NextResponse.json({ error: "Usuário não encontrado no Firebase" }, { status: 404 })
    }

    const userDoc = usersSnapshot.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data()

    console.log("[v0] Usuário encontrado no Firebase:", userId)
    console.log("[v0] Status atual:", userData.subscriptionStatus)

    // Atualizar o usuário no Firestore
    await adminDb
      .collection("users")
      .doc(userId)
      .update({
        subscriptionStatus: "premium",
        stripeCustomerId: activeSubscription.customer as string,
        stripeSubscriptionId: activeSubscription.id,
        subscriptionStartDate: new Date(activeSubscription.created * 1000),
        subscriptionCurrentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
      })

    console.log("[v0] ✅ Usuário atualizado com sucesso para Premium!")

    return NextResponse.json({
      success: true,
      message: "Assinatura sincronizada com sucesso!",
      userId,
      subscriptionId: activeSubscription.id,
      status: "premium",
      canceledDuplicates: allSubscriptions.length - 1,
    })
  } catch (error) {
    console.error("[v0] Erro ao sincronizar assinatura:", error)
    return NextResponse.json(
      {
        error: "Erro ao sincronizar assinatura",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
