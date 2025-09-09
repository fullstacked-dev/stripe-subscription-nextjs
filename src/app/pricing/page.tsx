import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import React from "react"
import PricingCards from "../components/PricingCards"

const tiers = [
  {
    name: "Free",
    price: "$0",
    priceId: null,
    features: ["Basic features", "Limited usage", "Community support"],
    buttonText: "Get Started",
  },
  {
    name: "Premium",
    price: "$10/mo",
    priceId: "premium",
    features: [
      "All basic features",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
    ],
    buttonText: "Upgrade to Premium",
  },
  {
    name: "Pro",
    price: "$20/mo",
    priceId: "pro",
    features: [
      "All premium features",
      "Unlimited usage",
      "24/7 support",
      "White-label options",
      "API access",
    ],
    buttonText: "Go Pro",
  },
]

const PricingPage = async () => {
  const session = await getSession()

  if (!session || !session.isLoggedIn) {
    redirect("/signin")
  }

  const user = await db.user.findUnique({ where: { id: session.userId } })

  if (!user) {
    redirect("/signin")
  }

  const hasActiveSubscription = Boolean(
    user.stripeSubscriptionId && user.plan !== null && user.plan !== "free"
  )
  return (
    <div className="min-h-screen by-gray-50 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Our Pricing Plans</h1>
      <PricingCards
        tiers={tiers}
        userPlan={user.plan}
        hasActiveSubscription={hasActiveSubscription}
      />
    </div>
  )
}

export default PricingPage
