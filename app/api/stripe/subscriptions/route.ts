import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY

export async function GET() {
  if (!stripeKey) {
    return NextResponse.json({
      metrics: {
        mrr: 0,
        arr: 0,
        activeSubscriptions: 0,
        trialingSubscriptions: 0,
        canceledSubscriptions: 0,
        monthRevenue: 0,
        churnRate: "0.0",
      },
      revenueByMonth: [],
      subscribers: [],
      trials: [],
      error: "Stripe não configurado",
    })
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-12-18.acacia",
  })

  try {
    const [activeResult, canceledResult, trialingResult, chargesResult] = await Promise.allSettled([
      stripe.subscriptions.list({
        status: "active",
        limit: 100,
        expand: ["data.customer"],
      }),
      stripe.subscriptions.list({
        status: "canceled",
        limit: 50,
      }),
      stripe.subscriptions.list({
        status: "trialing",
        limit: 50,
        expand: ["data.customer"],
      }),
      stripe.charges.list({
        created: {
          gte: Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000),
        },
        limit: 100,
      }),
    ])

    // Extract results with fallbacks
    const activeSubscriptions = activeResult.status === "fulfilled" ? activeResult.value.data : []
    const canceledSubscriptions = canceledResult.status === "fulfilled" ? canceledResult.value.data : []
    const trialingSubscriptions = trialingResult.status === "fulfilled" ? trialingResult.value.data : []
    const charges = chargesResult.status === "fulfilled" ? chargesResult.value.data : []

    // Calcular MRR (Monthly Recurring Revenue)
    const mrr =
      activeSubscriptions.reduce((sum, sub) => {
        const amount = sub.items.data.reduce((itemSum, item) => {
          const unitAmount = item.price.unit_amount || 0
          const quantity = item.quantity || 1
          const interval = item.price.recurring?.interval || "month"
          const intervalCount = item.price.recurring?.interval_count || 1

          let monthlyAmount = unitAmount * quantity
          if (interval === "year") {
            monthlyAmount = monthlyAmount / 12
          } else if (interval === "week") {
            monthlyAmount = monthlyAmount * 4.33
          } else if (interval === "day") {
            monthlyAmount = monthlyAmount * 30
          } else {
            monthlyAmount = monthlyAmount / intervalCount
          }

          return itemSum + monthlyAmount
        }, 0)
        return sum + amount
      }, 0) / 100

    const monthRevenue =
      charges.filter((charge) => charge.paid && !charge.refunded).reduce((sum, charge) => sum + charge.amount, 0) / 100

    const now = new Date()
    const revenueByMonth = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      revenueByMonth.push({
        month: monthDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        revenue: i === 0 ? monthRevenue : 0, // Only show current month revenue
        subscriptions: activeSubscriptions.length,
      })
    }

    // Formatar assinantes ativos
    const subscribers = activeSubscriptions.map((sub) => {
      const customer = sub.customer as Stripe.Customer
      return {
        id: sub.id,
        customerId: customer?.id || "",
        customerName: customer?.name || customer?.email || "Cliente",
        customerEmail: customer?.email || "",
        status: sub.status,
        plan: sub.items.data[0]?.price.nickname || "Premium",
        amount: (sub.items.data[0]?.price.unit_amount || 0) / 100,
        currency: sub.items.data[0]?.price.currency || "brl",
        interval: sub.items.data[0]?.price.recurring?.interval || "month",
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        createdAt: new Date(sub.created * 1000).toISOString(),
      }
    })

    // Formatar assinantes em trial
    const trials = trialingSubscriptions.map((sub) => {
      const customer = sub.customer as Stripe.Customer
      return {
        id: sub.id,
        customerId: customer?.id || "",
        customerName: customer?.name || customer?.email || "Cliente",
        customerEmail: customer?.email || "",
        status: sub.status,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        createdAt: new Date(sub.created * 1000).toISOString(),
      }
    })

    return NextResponse.json({
      metrics: {
        mrr,
        arr: mrr * 12,
        activeSubscriptions: activeSubscriptions.length,
        trialingSubscriptions: trialingSubscriptions.length,
        canceledSubscriptions: canceledSubscriptions.length,
        monthRevenue,
        churnRate:
          activeSubscriptions.length > 0
            ? (
                (canceledSubscriptions.length / (activeSubscriptions.length + canceledSubscriptions.length)) *
                100
              ).toFixed(1)
            : "0.0",
      },
      revenueByMonth,
      subscribers,
      trials,
    })
  } catch (error) {
    console.error("Erro ao buscar dados do Stripe:", error)
    return NextResponse.json({
      metrics: {
        mrr: 0,
        arr: 0,
        activeSubscriptions: 0,
        trialingSubscriptions: 0,
        canceledSubscriptions: 0,
        monthRevenue: 0,
        churnRate: "0.0",
      },
      revenueByMonth: [],
      subscribers: [],
      trials: [],
      error: "Erro ao conectar com Stripe",
    })
  }
}
