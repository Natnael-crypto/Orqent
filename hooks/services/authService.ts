// /services/authService.ts
import { api } from "@/lib/api";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  verified: boolean;
}

export interface RegisterResponse {
  user: User;
  error?: string;
}

export interface LoginResponse {
  user: User;
  error?: string;
}

export interface GetUserResponse {
  user: User | null;
  error?: string;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  companyName?: string;
}): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/auth/register", data);
  return res.data;
}

// Login user
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function getUserServer(
  cookieHeader: string
): Promise<GetUserResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/auth/me`,
    {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      credentials: "include",
    }
  );

  if (!res.ok) {
    return { user: null, error: "Unauthorized" };
  }

  return res.json();
}
