// app/api/onboarding/validate-nin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nin } = await req.json();

  if (!nin || !/^[A-Z0-9]{11}$/.test(nin)) {
    return NextResponse.json({ error: "Invalid NIN format" }, { status: 400 });
  }

  const pensioner = await convex.query(api.pensioners.getByNin, { nin });

  if (!pensioner) {
    return NextResponse.json(
      {
        error:
          "No pension record found for this NIN. Please contact your pension office.",
        code: "NIN_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  // After confirming the pensioner exists...

  const existingUser = await convex.query(api.users.getByClerkId, {
    clerkId: userId,
  });

  if (existingUser?.pensionerId) {
    return NextResponse.json(
      {
        error: "Your account is already linked to a pension record.",
        code: "ALREADY_LINKED",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    name: pensioner.fullName,
    pensionId: pensioner.pensionId,
  });
}
