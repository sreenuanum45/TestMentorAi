import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";

const ADMIN_PATHS = ["/admin"];
const PROTECTED_PATHS = [
  "/study",
  "/mock-interview",
  "/exam",
  "/exams",
  "/review",
  "/saved",
  "/notes",
  "/coding",
  "/daily-challenge",
  "/resume-review",
  "/cover-letter",
  "/dashboard",
  "/resume-questions",
  "/locator-sandbox",
  "/profile",
  "/settings",
  "/help",
  "/pro",
  ...ADMIN_PATHS,
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;

  let role: string | null = null;
  if (token && secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      role = typeof payload.role === "string" ? payload.role : null;
    } catch {
      role = null;
    }
  }

  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needsAdmin = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (needsAdmin && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/study/:path*",
    "/mock-interview/:path*",
    "/exam/:path*",
    "/exams/:path*",
    "/review/:path*",
    "/saved/:path*",
    "/notes/:path*",
    "/coding/:path*",
    "/daily-challenge/:path*",
    "/resume-review/:path*",
    "/cover-letter/:path*",
    "/dashboard/:path*",
    "/resume-questions/:path*",
    "/locator-sandbox/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/help/:path*",
    "/pro/:path*",
    "/admin/:path*",
  ],
};
