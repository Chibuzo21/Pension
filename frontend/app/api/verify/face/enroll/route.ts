import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errors";

// api/verify/face/enroll
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
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
        { error: "Invalid encoding: expected 128-float array" },
        { status: 400 },
      );

    const [pensioner, convexUser] = await Promise.all([
      convex.query(api.pensioners.getById, {
        id: pensionerId as Id<"pensioners">,
      }),
      convex.query(api.users.getByClerkId, { clerkId: userId }),
    ]);

    if (!pensioner)
      return NextResponse.json(
        { error: "Pensioner not found" },
        { status: 404 },
      );
    if (!convexUser)
      return NextResponse.json(
        { error: "User not found in Convex" },
        { status: 404 },
      );

    // Guard against silent overwrite — require explicit force=true to re-enrol.
    // The verify page never passes force, so it receives 409 and ignores it.
    // The enrolment page passes force=true, so it always succeeds.
    if (pensioner.faceEncoding && !force) {
      return NextResponse.json(
        {
          error:
            "Face already enrolled for this pensioner. Pass force=true to re-enrol.",
          alreadyEnrolled: true,
        },
        { status: 409 },
      );
    }

    const hasVoice = !!pensioner.voiceEncoding;
    const newLevel = hasVoice ? "L3" : "L2";

    await convex.mutation(api.pensioners.updateBiometric, {
      id: pensionerId as Id<"pensioners">,
      faceEncoding: encoding,
      biometricLevel: newLevel,
      updatedByUserId: convexUser._id,
      ...(referencePhotoStorageId ? { referencePhotoStorageId } : {}),
    });

    return NextResponse.json({ ok: true, level: newLevel });
  } catch (err) {
    console.error("[Face enrol]", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Enrolment failed") },
      { status: 500 },
    );
  }
}
