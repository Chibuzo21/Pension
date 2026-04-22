import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_WEBHOOK_URL;

  if (!convexUrl) {
    return NextResponse.json(
      { error: "Convex URL not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(`${convexUrl}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    },
    body,
  });

  return NextResponse.json({ ok: res.ok }, { status: res.status });
}
