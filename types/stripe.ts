export interface StripeSubscription {
  active: boolean
  stripeCustomerId: string
  stripeSubscriptionId: string
  plan: "premium"
  startedAt: Date
  cancelAtPeriodEnd?: boolean
}

export interface StripeCheckoutSession {
  sessionId: string
  url: string
}

export interface StripeWebhookEvent {
  type: string
  data: {
    object: any
  }
}
