const BASE_URL = "https://localhost:5001/auth_service";
const BASE_URL_PAYMENT = "https://localhost:5001/payment_service";

const CERT_OPTIONS = { rejectUnauthorized: false }; // Gestione certificati autofirmati

// Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("logged_username", username);
      document.getElementById("login-result").textContent = "Login successful!";
      showMenuSection(); // Mostra il menu dei servizi
    } else {
      document.getElementById("login-result").textContent = data.Error || "Login failed";
    }
  } catch (error) {
    document.getElementById("login-result").textContent = "Error: " + error.message;
  }
});

// Signup
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  const email = document.getElementById("signup-email").value;

  try {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);
    body.append("email", email);

    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById("signup-result").textContent = "Signup successful!";
    } else {
      document.getElementById("signup-result").textContent = data.Error || "Signup failed";
    }
  } catch (error) {
    document.getElementById("signup-result").textContent = "Error: " + error.message;
  }
});

// Show Menu Section
function showMenuSection() {
  document.getElementById("menu-section").style.display = "block";
  document.getElementById("login-section").style.display = "none";
  document.getElementById("signup-section").style.display = "none";
}
function hideMenuSection() {
  document.getElementById("menu-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
  document.getElementById("signup-section").style.display = "block";
}

// Logout
document.getElementById("logout-button").addEventListener("click", async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.ok) {
      document.getElementById("logout-result").textContent = "Logout successful!";
      localStorage.clear();
      hideMenuSection();
    } else {
      const data = await response.json();
      document.getElementById("logout-result").textContent = data.Error || "Logout failed";
    }
  } catch (error) {
    document.getElementById("logout-result").textContent = "Error: " + error.message;
  }
});

// Buy Currency
document.getElementById("buy-currency-button").addEventListener("click", async () => {
  const accessToken = localStorage.getItem("access_token");
  const username = localStorage.getItem("logged_username"); // Usa l'username salvato al login
  const amount = prompt("Enter amount to buy:");
  const method = prompt("Enter payment method:");

  if (!username) {
    document.getElementById("service-result").textContent = "Error: Username not found. Please log in again.";
    return;
  }

  try {
    // Crea il body della richiesta come application/x-www-form-urlencoded
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("amount", amount);
    body.append("payment_method", method);

    const response = await fetch(`${BASE_URL_PAYMENT}/buycurrency`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // Cambia il Content-Type
        Authorization: `Bearer ${accessToken}`,
      },
      body: body.toString(), // Invia i dati codificati
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById("service-result").textContent = `Currency purchased! Balance: ${data.balance}`;
    } else {
      document.getElementById("service-result").textContent = data.Error || "Failed to purchase currency";
    }
  } catch (error) {
    document.getElementById("service-result").textContent = "Error: " + error.message;
  }
});

// View Transactions
document.getElementById("view-transactions-button").addEventListener("click", async () => {
  const accessToken = localStorage.getItem("access_token");
  const username = localStorage.getItem("logged_username"); // Usa l'username salvato al login

  if (!username) {
    document.getElementById("service-result").textContent = "Error: Username not found. Please log in again.";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL_PAYMENT}/viewTrans?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      const transactions = data.map(
        (t) =>
          `ID: ${t.id}, Payer: ${t.payer_us}, Receiver: ${t.receiver_us}, Amount: ${t.amount}, Date: ${new Date(
            t.date
          ).toLocaleString()}`
      );
      document.getElementById("service-result").innerHTML = transactions.join("<br>");
    } else {
      document.getElementById("service-result").textContent = data.Error || "Failed to fetch transactions";
    }
  } catch (error) {
    document.getElementById("service-result").textContent = "Error: " + error.message;
  }
});

