"use client"

const ManageSubscriptionButton = () => {
  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const { url } = await response.json()
      console.log(url)

      if (url) {
        window.location.href = url
      } else {
        throw new Error("No portal URL received")
      }
    } catch (error) {
      console.error("Error creating portal session:", error)
      alert("Something went wrong. Please try again.")
    }
  }

  return (
    <button
      onClick={handleManageSubscription}
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
    >
      Manage Subscription
    </button>
  )
}

export default ManageSubscriptionButton
