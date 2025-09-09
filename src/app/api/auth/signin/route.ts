import { getSession, signIn } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email or password are required" },
        { status: 400 }
      )
    }

    const result = await signIn(email, password)

    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const session = await getSession()
    session.userId = result.user.id
    session.email = result.user.email
    session.role = result.user.role
    session.isLoggedIn = true

    await session.save()

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
    })
  } catch (error) {
    console.error("sign in error: ", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
