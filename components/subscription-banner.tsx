const handleUpgrade = async () => {
  try {
    console.log("[v0] Starting checkout process...")
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
      }),
    })
    // Ensure the response is checked for success
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText)
    }
    const session = await response.json()
    // Redirect to Stripe Checkout
    window.location.href = session.url
  } catch (error) {
    console.error("Error starting checkout process:", error)
  }
}

// Declare the user variable or import it from the appropriate source
const user = {
  uid: "exampleUid",
  email: "example@example.com",
  businessName: "Example Business",
  role: "admin",
}
