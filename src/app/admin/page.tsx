import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import React from "react"
import SignOutButton from "../components/SignOutButton"
import { db } from "@/lib/db"

const page = async () => {
  const session = await getSession()
  const user = await db.user.findUnique({ where: { id: session.userId } })

  if (!user) {
    redirect("/signin")
  }
  return (
    <div className="min-h-screen bg-gray-50 p-20">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              User Information
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
