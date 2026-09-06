import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteUser, getUserById, updateUserRole, type Role } from "@/lib/repo";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id === admin.sub) {
    return NextResponse.json(
      { error: "Use Settings to manage your own account" },
      { status: 400 }
    );
  }

  const { role } = (await req.json()) as { role?: Role };
  if (role !== "STUDENT" && role !== "ADMIN") {
    return NextResponse.json({ error: "role must be STUDENT or ADMIN" }, { status: 400 });
  }

  const target = await getUserById(id);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await updateUserRole(id, role);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id === admin.sub) {
    return NextResponse.json(
      { error: "Use Settings to manage your own account" },
      { status: 400 }
    );
  }

  const target = await getUserById(id);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
