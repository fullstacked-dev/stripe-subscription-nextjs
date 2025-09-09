import { promisify } from "util"
import { db } from "./db"
import crypto from "crypto"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"

export async function signUp(email: string, password: string) {
  try {
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return { success: false, error: "User already exists" }

    const { salt, hash } = await hashPassword(password)

    const userCount = await db.user.count()
    const role = userCount === 0 ? "admin" : "user"

    const user = await db.user.create({
      data: {
        email,
        password: hash,
        salt,
        role,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error("Sign up error: ", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    const isValid = await verifyPassword(password, user.password, user.salt)

    if (!isValid) return { success: false, error: "Invalid credentials" }

    return { success: true, user }
  } catch (error) {
    console.error("Sign in error: ", error)
    return { success: false, error: "Failed to sign in" }
  }
}

const scryptAsync = promisify(crypto.scrypt)
const KEY_LENGTH = 64

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
) {
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey)
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return { salt, hash: derivedKey.toString("hex") }
}

export type SessionData = {
  userId?: string
  email?: string
  role?: string
  isLoggedIn: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "auth-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }

  return session
}

export async function signOut() {
  const session = await getSession()
  session.destroy()
}
