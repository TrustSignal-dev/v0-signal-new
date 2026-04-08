import { cookies } from "next/headers";

import { AdminConsole, AdminLogin } from "./admin-console";
import { adminCookieName, verifyAdminSessionValue } from "@/lib/admin-auth";
import { listAdminApiKeys } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(adminCookieName)?.value;
  const isAuthenticated = verifyAdminSessionValue(sessionValue);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const keys = await listAdminApiKeys();
  return <AdminConsole initialKeys={keys} />;
}
