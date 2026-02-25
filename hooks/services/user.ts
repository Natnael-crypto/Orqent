import { api } from "@/lib/api";

// TODO: Move this to a proper types file
interface AppUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export async function getAuthenticatedUser(): Promise<AppUser> {
  const { data } = await api.get<{ user: AppUser }>("/user");
  return data.user;
}

export const userService = {
  async updateProfile(payload: {
    first_name: string;
    last_name: string;
    email: string;
    company_name: string;
  }) {
    const res = await api.post("/user/update", payload);
    return res.data;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }) {
    const res = await api.post("/user/change-password", payload);
    return res.data;
  },

  async deleteAccount() {
    const res = await api.delete("/user/delete");
    return res.data;
  },
};
