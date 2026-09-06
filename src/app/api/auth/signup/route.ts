import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { countUsers, createUser, getUserByEmail } from "@/lib/repo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    // Bootstrap: the very first account on a fresh install becomes the admin.
    const role = (await countUsers()) === 0 ? "ADMIN" : "STUDENT";
    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash, role);

    const token = await createSessionToken({ sub: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({ email: user.email, role: user.role });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
