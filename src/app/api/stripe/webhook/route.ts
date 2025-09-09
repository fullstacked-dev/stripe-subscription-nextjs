import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed: ", error)
    return NextResponse.json({ error: "Invalid Signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const priceId = session.metadata?.priceId

        if (userId && priceId) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await db.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000
              ),
              plan: priceId === "premium" ? "premium" : "pro",
            },
          })
        }
        break
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              stripeCurrentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000
              ),
              plan:
                subscription.status === "active"
                  ? user.stripePriceId === "premium"
                    ? "premium"
                    : "pro"
                  : "free",
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
              plan: "free",
            },
          })
        }
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error("Error processing webhook: ", error)
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    )
  }
}
