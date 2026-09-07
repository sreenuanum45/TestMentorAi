import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markDailyChallengeComplete } from "@/lib/repo";
import { todayDateString } from "@/lib/dailyChallenge";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await markDailyChallengeComplete(user.sub, todayDateString());
  return NextResponse.json({ ok: true });
}
