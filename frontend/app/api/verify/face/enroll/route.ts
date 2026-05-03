import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errors";

// api/verify/face/enroll
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pensionerId, encoding, referencePhotoStorageId, force } =
    (await req.json()) as {
      pensionerId: string;
      encoding: string;
      referencePhotoStorageId?: string;
      force?: boolean;
    };

  if (!pensionerId)
    return NextResponse.json({ error: "Missing pensionerId" }, { status: 400 });
  if (!encoding)
    return NextResponse.json({ error: "Missing encoding" }, { status: 400 });

  try {
    const parsed = JSON.parse(encoding) as number[];
    if (!Array.isArray(parsed) || parsed.length !== 512)
      return NextResponse.json(
        { error: "Invalid encoding: expected 512-float array" },
        { status: 400 },
      );

    const pensioner = await convex.query(api.pensioners.getById, {
      id: pensionerId as Id<"pensioners">,
    });

    if (!pensioner)
      return NextResponse.json(
        { error: "Pensioner not found" },
        { status: 404 },
      );

    const convexUser = await convex.query(api.users.getByClerkId, {
      clerkId: userId,
    });

    if (!convexUser)
      return NextResponse.json(
        { error: "User not found in Convex" },
        { status: 404 },
      );

    // Guard against silent overwrite
    if (pensioner.faceEncoding && !force) {
      return NextResponse.json(
        {
          error: "Face already enrolled. Pass force=true to re-enrol.",
          alreadyEnrolled: true,
        },
        { status: 409 },
      );
    }

    const hasVoice = !!pensioner.voiceEncoding;
    const newLevel = hasVoice ? "L3" : "L1";

    await convex.mutation(api.pensioners.updateBiometric, {
      id: pensionerId as Id<"pensioners">,
      faceEncoding: encoding,
      biometricLevel: newLevel,
      updatedByUserId: convexUser._id,
      ...(referencePhotoStorageId ? { referencePhotoStorageId } : {}),
    });

    // ── Advance onboarding step if pensioner is still in onboarding ──────
    const currentStep = sessionClaims?.metadata?.onboardingStep as
      | string
      | undefined;
    if (currentStep === "face" || !currentStep) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...sessionClaims?.metadata,
          onboardingStep: "voice",
          biometricLevel: newLevel,
        },
      });
    } else {
      // Already past onboarding — just update biometricLevel
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...sessionClaims?.metadata,
          biometricLevel: newLevel,
        },
      });
    }

    return NextResponse.json({ ok: true, level: newLevel });
  } catch (err) {
    console.error("[Face enrol]", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Enrolment failed") },
      { status: 500 },
    );
  }
}
