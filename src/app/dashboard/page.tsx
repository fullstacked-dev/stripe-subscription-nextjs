import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import React from "react"
import SignOutButton from "../components/SignOutButton"
import ManageSubscriptionButton from "../components/ManageSubscriptionButton"

const page = async () => {
  const session = await getSession()

  if (!session || !session.isLoggedIn) {
    redirect("/signin")
  }

  const user = await db.user.findUnique({ where: { id: session.userId } })

  if (!user) {
    redirect("/signin")
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }
  return (
    <div className="min-h-screen bg-gray-50 p-20">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to your Dashboard!
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

          <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Subscription Information
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Current Plan:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    user.plan === "free"
                      ? "bg-gray-100 text-gray-800"
                      : user.plan === "premium"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </span>
              </p>
              {user.stripeSubscriptionId && (
                <>
                  <p>
                    <strong>Subscription ID:</strong>{" "}
                    {user.stripeSubscriptionId}
                  </p>
                  <p>
                    <strong>Current Period End:</strong>{" "}
                    {formatDate(user.stripeCurrentPeriodEnd)}
                  </p>
                  <ManageSubscriptionButton />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
