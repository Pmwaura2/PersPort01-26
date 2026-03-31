const form = document.getElementById("admin-login-form");
const statusLabel = document.getElementById("admin-login-status");
const usernameInput = document.getElementById("admin-username");
const passwordInput = document.getElementById("admin-password");
const params = new URLSearchParams(window.location.search);
const nextPath = params.get("next") || "/admin.html";
const inboundMessage = params.get("message");

if (inboundMessage) {
  statusLabel.textContent = inboundMessage;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusLabel.textContent = "Signing in...";

  try {
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Login failed.");
    }

    window.location.href = nextPath;
  } catch (error) {
    statusLabel.textContent = error.message;
  }
});
