import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "User is not logged in" },
        { status: 401 }
      )
    }

    const { priceId } = await request.json()

    if (!priceId || !(priceId in STRIPE_PRICE_IDS)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: session.userId } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_IDS[priceId as keyof typeof STRIPE_PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: user.id,
        priceId,
      },
    })
    console.log(checkoutSession.url)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session: ", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
