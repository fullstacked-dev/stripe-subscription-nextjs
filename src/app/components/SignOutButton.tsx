"use client"
import { useRouter } from "next/navigation"
import React from "react"

const SignOutButton = () => {
  const router = useRouter()
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      router.push("/signin")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }
  return (
    <button
      onClick={handleSignOut}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
    >
      Sign Out
    </button>
  )
}

export default SignOutButton
