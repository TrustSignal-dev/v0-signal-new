import { type NextRequest, NextResponse } from "next/server";
import {
  createPartnerAccessToken,
  getPartnerCookieName,
  isPartnerSlug,
  verifyPartnerPassword,
} from "@/lib/partner-access";

function buildRedirectUrl(request: NextRequest, path: string) {
  const origin =
    request.headers.get("origin") ??
    `${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`;

  return new URL(path, origin);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const partner = formData.get("partner");
  const password = formData.get("password");

  if (
    typeof partner !== "string" ||
    typeof password !== "string" ||
    !isPartnerSlug(partner)
  ) {
    return NextResponse.redirect(buildRedirectUrl(request, "/partner-access?error=invalid"), 303);
  }

  if (!(await verifyPartnerPassword(partner, password))) {
    return NextResponse.redirect(
      buildRedirectUrl(request, `/partner-access?partner=${partner}&error=invalid`),
      303,
    );
  }

  const token = await createPartnerAccessToken(partner);
  if (!token) {
    return NextResponse.redirect(
      buildRedirectUrl(request, `/partner-access?partner=${partner}&error=config`),
      303,
    );
  }

  const response = NextResponse.redirect(buildRedirectUrl(request, `/partner/${partner}`), 303);
  response.cookies.set({
    name: getPartnerCookieName(partner),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
