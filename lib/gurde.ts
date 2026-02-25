import { redirect } from "next/navigation";
import { getUserFromRequest } from "./auth";

/**
 * Ensures the user is authenticated and optionally has a specific role.
 * Should be used in Server Components (Pages, Layouts).
 */
export async function requireRole(allowedRoles: string | string[] = ["USER", "ADMIN"]) {
  const user = await getUserFromRequest();

  if (!user) {
    redirect("/login");
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    console.warn(`Access denied for ${user.email}: Role ${user.role} not in [${roles.join(", ")}]`);

    // If a USER tries to access an ADMIN-only route
    if (user.role === "USER" && roles.includes("ADMIN") && !roles.includes("USER")) {
      redirect("/dashboard");
    }

    redirect("/login");
  }

  return user;
}
