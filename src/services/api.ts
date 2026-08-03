/**
 * Centralized API Service Layer
 * Encapsulates fetch requests, standard headers, and response parsing.
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
  code?: string;
  status: number;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    const res = await fetch(endpoint, config);
    let payload: any = {};

    try {
      payload = await res.json();
    } catch {
      payload = {};
    }

    if (!res.ok) {
      return {
        status: res.status,
        error: payload.error || "An unexpected error occurred",
        details: payload.details,
        code: payload.code,
      };
    }

    return {
      status: res.status,
      data: payload as T,
    };
  } catch (err: any) {
    return {
      status: 500,
      error: err.message || "Network request failed",
    };
  }
}


export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getMe: () => request("/api/auth/me", { method: "GET" }),

  logout: () => request("/api/auth/logout", { method: "POST" }),

  verifyEmail: (token: string) =>
    request("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email: string) =>
    request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { token: string; password: string }) =>
    request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const companyApi = {
  setup: (companyData: {
    name: string;
    phone: string;
    email?: string;
    website?: string;
    industry?: string;
    logoUrl?: string;
    logoName?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    currency: string;
    timezone: string;
    gstNumber?: string;
    pan?: string;
  }) =>
    request("/api/company/setup", {
      method: "POST",
      body: JSON.stringify(companyData),
    }),
};
