import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  if (!session || !session.isLoggedIn || session.role !== "admin") {
    redirect("/signin")
  }

  return <div>{children}</div>
}
