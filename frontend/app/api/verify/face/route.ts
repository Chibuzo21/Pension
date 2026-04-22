import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// api/verify/face/route
const SPEAKER_SERVICE =
  process.env.SPEAKER_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    imageBase64,
    imageList,
    frames, // multi-frame array for verify mode (≥5 required)
    referenceEmbedding,
    mode = "verify",
  } = body;

  // ── Enrol mode ────────────────────────────────────────────────────────────
  if (mode === "enrol") {
    const list: string[] = imageList ?? (imageBase64 ? [imageBase64] : []);

    if (list.length === 0)
      return NextResponse.json({ error: "Missing image" }, { status: 400 });

    const res = await fetch(`${SPEAKER_SERVICE}/enrol/face`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_list: list }),
    });

    const data = await res.json();
    if (!res.ok)
      return NextResponse.json(
        { error: data.detail ?? "Face enrolment failed" },
        { status: res.status },
      );

    return NextResponse.json({
      embedding: data.embedding,
      samples_used: data.samples_used,
    });
  }

  // ── Verify mode ───────────────────────────────────────────────────────────
  // Prefer multi-frame array for liveness. Fall back to single image wrapped
  // in an array so old callers keep working (but liveness check will be weak).
  const frameList: string[] = (() => {
    if (Array.isArray(frames) && frames.length > 0) return frames;
    if (imageBase64) {
      const clean = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      return [clean];
    }
    return [];
  })();

  if (frameList.length === 0)
    return NextResponse.json(
      { error: "Missing image or frames" },
      { status: 400 },
    );

  if (!referenceEmbedding || !Array.isArray(referenceEmbedding))
    return NextResponse.json(
      { error: "No face reference — pensioner must re-enrol" },
      { status: 422 },
    );

  const res = await fetch(`${SPEAKER_SERVICE}/verify/face`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      frames: frameList,
      reference_embedding: referenceEmbedding,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    // Stale enrolment — tell the frontend clearly
    if (
      res.status === 409 &&
      data.detail?.includes("embedding_dimension_mismatch")
    ) {
      return NextResponse.json(
        { error: "Face data is outdated — please re-enrol at the admin desk" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: data.detail ?? "Face verification failed" },
      { status: res.status },
    );
  }

  return NextResponse.json({
    passed: data.passed,
    score: data.score,
    threshold: data.threshold,
    detection_confidence: data.detection_confidence,
    reason: data.reason,
    variance: data.variance,
  });
}
