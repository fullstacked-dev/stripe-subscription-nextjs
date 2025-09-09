import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import React from "react"

const page = async () => {
  const session = await getSession()
  if (!session || !session.isLoggedIn) {
    redirect("/signin")
  }

  const user = await db.user.findUnique({ where: { id: session.userId } })

  if (!user) {
    redirect("/signin")
  }

  if (user.plan !== "premium" && user.plan !== "pro") {
    redirect("/pricing")
  }
  return (
    <div className="p-20 flex justify-center">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Premium Page
        </h3>
        <p className="text-lg text-gray-600">
          Only premium and pro users can access this page
        </p>
      </div>
    </div>
  )
}

export default page
