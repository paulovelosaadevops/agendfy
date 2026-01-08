import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

// Endpoint para recuperar assinaturas que foram pagas mas não ativadas
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Iniciando recuperação de assinatura para:", email)

    // Buscar cliente no Stripe pelo email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado no Stripe" }, { status: 404 })
    }

    const customer = customers.data[0]
    console.log("[v0] Cliente encontrado:", customer.id)

    // Buscar assinaturas do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "Nenhuma assinatura encontrada" }, { status: 404 })
    }

    const subscription = subscriptions.data[0]
    console.log("[v0] Assinatura encontrada:", subscription.id)
    console.log("[v0] Status:", subscription.status)
    console.log("[v0] Metadata:", subscription.metadata)

    const professionalId = subscription.metadata?.professionalId

    if (!professionalId) {
      return NextResponse.json(
        {
          error: "professionalId não encontrado nos metadados da assinatura",
          subscriptionId: subscription.id,
        },
        { status: 400 },
      )
    }

    // Verificar se o usuário existe no Firestore
    const userRef = doc(db, "users", professionalId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "Usuário não encontrado no Firestore" }, { status: 404 })
    }

    const userData = userDoc.data()
    console.log("[v0] Status atual do usuário:", userData.subscriptionStatus)

    // Atualizar o status da assinatura
    if (subscription.status === "active" || subscription.status === "trialing") {
      await updateDoc(userRef, {
        subscriptionStatus: "premium",
        subscription: {
          active: true,
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          plan: "premium",
          startedAt: new Date(subscription.created * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        trial: {
          active: false,
          endDate: null,
        },
      })

      console.log("[v0] ✅ Assinatura recuperada com sucesso para:", professionalId)

      return NextResponse.json({
        success: true,
        message: "Assinatura ativada com sucesso!",
        data: {
          professionalId,
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      })
    } else {
      return NextResponse.json(
        {
          error: "Assinatura não está ativa",
          subscriptionStatus: subscription.status,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Erro ao recuperar assinatura:", error)
    return NextResponse.json({ error: error.message || "Erro ao processar recuperação" }, { status: 500 })
  }
}
