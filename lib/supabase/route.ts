import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * Creates a request-scoped Supabase client for route handlers.
 *
 * Supabase's PKCE verifier and the resulting session cookies must be attached
 * to the exact redirect response returned by the route. The accompanying
 * no-cache headers are equally important because auth responses must never be
 * cached by a shared intermediary.
 */
export function createSupabaseRouteClient(request: NextRequest) {
  const pendingCookies = new Map<string, PendingCookie>();
  const pendingHeaders = new Map<string, string>();

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const cookie of cookiesToSet) {
          pendingCookies.set(cookie.name, cookie);
        }
        for (const [name, value] of Object.entries(headers)) {
          pendingHeaders.set(name, value);
        }
      },
    },
  });

  function applyAuthCookies<T extends NextResponse>(response: T): T {
    for (const { name, value, options } of pendingCookies.values()) {
      response.cookies.set(name, value, options);
    }
    for (const [name, value] of pendingHeaders) {
      response.headers.set(name, value);
    }
    return response;
  }

  return { supabase, applyAuthCookies };
}
