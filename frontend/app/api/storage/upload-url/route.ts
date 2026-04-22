import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/errors";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await convex.mutation(api.storage.generateUploadUrl);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[storage/upload-url]", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to generate upload URL") },
      { status: 500 },
    );
  }
}
