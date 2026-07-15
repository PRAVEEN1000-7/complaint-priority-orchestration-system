function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "/static/login.html";
    return false;
  }
  return true;
}

function requireRole(...roles) {
  const user = getUser();
  if (!user || !roles.includes(user.role)) {
    window.location.href = "/static/dashboard.html";
    return false;
  }
  return true;
}

function logout() {
  removeToken();
  window.location.href = "/static/login.html";
}

function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function priorityBadgeClass(priority) {
  const map = {
    P1: "badge-p1",
    P2: "badge-p2",
    P3: "badge-p3",
    P4: "badge-p4",
  };
  return map[priority] || "badge-p4";
}

function statusBadgeClass(status) {
  const map = {
    Submitted: "badge-submitted",
    "Under Review": "badge-under-review",
    "In Progress": "badge-in-progress",
    Resolved: "badge-resolved",
    Closed: "badge-closed",
  };
  return map[status] || "badge-submitted";
}

function priorityLabel(priority) {
  const map = { P1: "Critical", P2: "High", P3: "Medium", P4: "Low" };
  return `${priority} ${map[priority] || "Unknown"}`;
}

function renderNavbar() {
  const user = getUser();
  if (!user) return;

  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  let navLinks = "";
  if (user.role === "user") {
    navLinks = `
            <a href="/static/dashboard.html" id="nav-dashboard">Dashboard</a>
            <a href="/static/submit-complaint.html" id="nav-submit">Submit Complaint</a>
            <a href="/static/complaint-history.html" id="nav-history">My Complaints</a>
        `;
  } else if (user.role === "domain_head") {
    navLinks = `
            <a href="/static/dashboard.html" id="nav-dashboard">Dashboard</a>
            <a href="/static/notifications.html" id="nav-notifications">Notifications</a>
            <a href="/static/complaint-history.html" id="nav-complaints">Complaints</a>
        `;
  } else if (user.role === "admin") {
    navLinks = `
            <a href="/static/admin.html" id="nav-admin">Admin Panel</a>
        `;
  }

  navbar.innerHTML = `
        <div class="brand">ComplaintOS</div>
        <ul>${navLinks}</ul>
        <div class="user-info">
            <span>${user.name} (${user.role.replace("_", " ")})</span>
            <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
    `;
  const currentPage = window.location.pathname.split("/").pop();
  const links = navbar.querySelectorAll("ul a");
  links.forEach((link) => {
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML =
      '<div class="loading-spinner"><div class="spinner"></div></div>';
  }
}

function showEmpty(containerId, message = "No data available") {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                <h3>${message}</h3>
            </div>
        `;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("navbar")) {
    renderNavbar();
  }
});
