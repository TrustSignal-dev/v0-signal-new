import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/get-your-api-key",
    "/api/auth/:path*",
    "/api/keys/:path*",
    "/api/billing/:path*",
  ],
};
