// app/api/onboarding/confirm-nin/route.ts  (new endpoint)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { clerkClient } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nin } = await req.json();

  // Re-validate NIN (never trust client)
  const pensioner = await convex.query(api.pensioners.getByNin, {
    nin: nin.trim().toUpperCase(),
  });
  if (!pensioner)
    return NextResponse.json({ error: "NIN not found" }, { status: 404 });

  // Block if NIN already claimed by another user
  const existingOwner = await convex.query(api.users.getByPensionerId, {
    pensionerId: pensioner._id,
  });
  if (existingOwner && existingOwner.clerkId !== userId) {
    return NextResponse.json(
      {
        error: "This NIN is already linked to another account.",
        code: "NIN_ALREADY_CLAIMED",
      },
      { status: 409 },
    );
  }

  // Get the Convex user
  const convexUser = await convex.query(api.users.getByClerkId, {
    clerkId: userId,
  });
  if (!convexUser)
    return NextResponse.json(
      { error: "User record not found" },
      { status: 404 },
    );

  // Do the Convex link first
  await convex.mutation(api.users.linkToPensioner, {
    userId: convexUser._id,
    pensionerId: pensioner._id,
    updatedByUserId: convexUser._id,
  });

  // Sync role to Clerk public metadata
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { role: "pensioner" },
    unsafeMetadata: {
      nin: nin.trim().toUpperCase(),
      onboardingComplete: true,
    },
  });

  return NextResponse.json({ ok: true });
}
