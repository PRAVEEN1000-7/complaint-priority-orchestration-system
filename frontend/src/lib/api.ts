export const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:8000/api" : "/api";

const TOKEN_KEY = "complaint_os_token";
const USER_KEY = "complaint_os_user";

export type Role = "admin" | "domain_head" | "user";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Complaint = {
  id: string;
  title: string;
  description: string;
  user_selected_domain: string;
  status: string;
  priority: string;
  explanation: string;
  created_at: string;
  updated_at: string;
  domain_name?: string;
  domain_head_name?: string;
  remarks?: string;
};

export type Domain = {
  id: string;
  domain_name: string;
  created_at: string;
};

export type DashboardStats = {
  total_complaints: number;
  pending_complaints: number;
  resolved_complaints: number;
  critical_complaints: number;
  recent_activity: Complaint[];
};

export type AdminStats = {
  total_users: number;
  total_complaints: number;
  total_domain_heads: number;
  total_domains: number;
  resolved_complaints: number;
  pending_complaints: number;
  high_priority_complaints: number;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  complaint_id?: string;
};

export type DomainHead = {
  id: string;
  user_id: string;
  domain_id: string;
  user_name?: string;
  user_email?: string;
  domain_name?: string;
};

export function getAuthToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthData(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getUser(): User | null {
  const user = window.localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user) as User;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const currentToken = token || getAuthToken();
  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 || response.status === 403) {
      if(currentToken) {
          clearAuthData();
          window.location.href = "/login";
      }
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const parsed = (await response.json()) as { detail?: string | any[] };
      if (parsed.detail) {
        if (Array.isArray(parsed.detail)) {
          errorMessage = parsed.detail.map(d => d.msg || "Validation error").join(", ");
        } else {
          errorMessage = parsed.detail as string;
        }
      }
    } catch {
      // ignore parse errors and use default message
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await request<AuthResponse>("/login", {
    method: "POST",
    body: { email, password },
  });
  setAuthToken(res.access_token);
  setUser(res.user);
  return res;
}

export async function register(
  email: string,
  name: string,
  password: string,
  confirm_password: string
): Promise<User> {
  return request<User>("/register", {
    method: "POST",
    body: { email, name, password, confirm_password },
  });
}

export async function getComplaints(): Promise<Complaint[]> {
  return request<Complaint[]>("/complaints");
}

export async function getComplaint(id: string): Promise<Complaint> {
  return request<Complaint>(`/complaints/${id}`);
}

export async function submitComplaint(
  title: string,
  description: string,
  domain_id: string
): Promise<Complaint> {
  return request<Complaint>("/complaints", {
    method: "POST",
    body: { title, description, domain_id: domain_id || null },
  });
}

export async function updateComplaint(
  id: string,
  status: string,
  remarks?: string
): Promise<Complaint> {
  return request<Complaint>(`/complaints/${id}`, {
    method: "PUT",
    body: { status, remarks },
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/dashboard");
}

export async function getAdminStatistics(): Promise<AdminStats> {
  return request<AdminStats>("/admin/statistics");
}

export async function getAdminUsers(): Promise<User[]> {
  return request<User[]>("/admin/users");
}

export async function getAdminDomainHeads(): Promise<DomainHead[]> {
  return request<DomainHead[]>("/admin/domain-heads");
}

export async function createDomainHead(user_id: string, domain_id: string): Promise<DomainHead> {
  return request<DomainHead>("/admin/domain-heads", {
    method: "POST",
    body: { user_id, domain_id }
  });
}

export async function deleteDomainHead(id: string): Promise<void> {
  return request<void>(`/admin/domain-heads/${id}`, { method: "DELETE" });
}

export async function getDomains(): Promise<Domain[]> {
  return request<Domain[]>("/domains");
}

export async function createDomain(domain_name: string): Promise<Domain> {
  return request<Domain>("/domains", {
    method: "POST",
    body: { domain_name }
  });
}

export async function createAdminUser(userData: { name: string, email: string, password: string, role: string }): Promise<User> {
  return request<User>("/admin/users", {
    method: "POST",
    body: userData
  });
}

export async function getNotifications(): Promise<Notification[]> {
  return request<Notification[]>("/notifications");
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return request<Notification>(`/notifications/${id}/read`, { method: "PUT" });
}

export async function getUnreadNotificationCount(): Promise<{ unread_count: number }> {
  return request<{ unread_count: number }>("/notifications/unread-count");
}
