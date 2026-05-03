import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

type OnboardingStep = "personal" | "face" | "voice" | "docs" | "complete";

const STEP_ORDER: OnboardingStep[] = [
  "personal",
  "face",
  "voice",
  "docs",
  "complete",
];

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { step, role } = body as { step: OnboardingStep; role?: string };

  if (!STEP_ORDER.includes(step))
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });

  // Only allow advancing forward — idempotent if already at or past this step
  const currentStep = (sessionClaims?.metadata?.onboardingStep ??
    "personal") as OnboardingStep;
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const newIdx = STEP_ORDER.indexOf(step);

  if (newIdx <= currentIdx)
    return NextResponse.json({ ok: true, step: currentStep });

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...sessionClaims?.metadata,
      onboardingStep: step,
      // Set role when transitioning out of personal step (step 1 → face)
      ...(role ? { role } : {}),
    },
  });

  return NextResponse.json({ ok: true, step });
}
