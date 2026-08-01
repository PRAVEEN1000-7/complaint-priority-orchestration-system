const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("access_token");
}

function setToken(token) {
  localStorage.setItem("access_token", token);
}

function removeToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    if (response.status === 401) {
      removeToken();
      window.location.href = "/static/login.html";
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || data.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error("Unable to connect to the server. Please try again.");
    }
    throw error;
  }
}

const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
  post: (endpoint, body) =>
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
};
