export type AccountRole = "owner" | "admin" | "member";

export function canManageApiKeys(role: AccountRole) {
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: AccountRole) {
  return role === "owner" || role === "admin";
}
