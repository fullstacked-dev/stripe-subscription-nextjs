import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!

export const STRIPE_PRICE_IDS = {
  premium: "price_1S59rEAQ8LO0b8GGageAqzMu",
  pro: "price_1S59rZAQ8LO0b8GG7EngHjNX",
} as const

export type StripePriceId = keyof typeof STRIPE_PRICE_IDS
