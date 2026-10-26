const API_BASE_URL = "http://127.0.0.1:8000";


// =========================
// AUTH TOKEN
// =========================

function getAuthHeaders() {
  const token = localStorage.getItem("mockmarket_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}


// =========================
// MARKET DATA
// =========================

export async function getMarketData(symbol) {
  const response = await fetch(
    `${API_BASE_URL}/market/${symbol}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch market data");
  }

  return response.json();
}


// =========================
// PORTFOLIO
// =========================

export async function getPortfolio() {
  const response = await fetch(
    `${API_BASE_URL}/portfolio`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio");
  }

  return response.json();
}


// =========================
// ML PREDICTION
// =========================

export async function getPrediction(symbol) {
  const response = await fetch(
    `${API_BASE_URL}/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol: symbol,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch prediction");
  }

  return response.json();
}


// =========================
// NEWS
// =========================

export async function getNews(symbol) {
  const response = await fetch(
    `${API_BASE_URL}/news/${symbol}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  return response.json();
}


// =========================
// LOGIN
// =========================

export async function loginUser(username, password) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    );
  }

  return data;
}


// =========================
// REGISTER
// =========================

export async function registerUser(
  name,
  username,
  email,
  password
) {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    );
  }

  return data;
}


// =========================
// BUY STOCK
// =========================

export async function buyStock(
  symbol,
  quantity
) {
  const response = await fetch(
    `${API_BASE_URL}/trade/buy?symbol=${symbol}&quantity=${quantity}`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "BUY failed"
    );
  }

  return data;
}


// =========================
// SELL STOCK
// =========================

export async function sellStock(
  symbol,
  quantity
) {
  const response = await fetch(
    `${API_BASE_URL}/trade/sell?symbol=${symbol}&quantity=${quantity}`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "SELL failed"
    );
  }

  return data;
}


// =========================
// TRADE HISTORY
// =========================

export async function getTrades() {
  const response = await fetch(
    `${API_BASE_URL}/trades`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch trades"
    );
  }

  return response.json();
}

// =========================
// PORTFOLIO RISK
// =========================

export async function getPortfolioRisk() {
  const response = await fetch(
    `${API_BASE_URL}/portfolio-risk`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch portfolio risk"
    );
  }

  return data;
}