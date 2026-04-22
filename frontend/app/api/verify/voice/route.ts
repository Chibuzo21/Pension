import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const SPEAKER_SERVICE =
  process.env.SPEAKER_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    audioBase64,
    audioList,
    referenceEmbedding,
    phraseIndex,
    mode = "verify",
  } = await req.json();

  // ── Enrol ──────────────────────────────────────────────────────────────
  if (mode === "enrol") {
    const list: string[] = audioList ?? (audioBase64 ? [audioBase64] : []);
    if (!list.length)
      return NextResponse.json({ error: "Missing audio" }, { status: 400 });

    const res = await fetch(`${SPEAKER_SERVICE}/enrol/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_list: list }),
    });
    const data = await res.json();
    if (!res.ok)
      return NextResponse.json(
        { error: data.detail ?? "Enrolment failed" },
        { status: res.status },
      );
    return NextResponse.json({
      embedding: data.embedding,
      samples_used: data.samples_used,
    });
  }

  // ── Verify ─────────────────────────────────────────────────────────────
  if (!audioBase64)
    return NextResponse.json({ error: "Missing audio" }, { status: 400 });
  if (!referenceEmbedding || !Array.isArray(referenceEmbedding))
    return NextResponse.json(
      { error: "No voice reference — re-enrol" },
      { status: 422 },
    );
  if (phraseIndex === undefined || phraseIndex === null)
    return NextResponse.json({ error: "Missing phraseIndex" }, { status: 400 });

  const res = await fetch(`${SPEAKER_SERVICE}/verify/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audio_base64: audioBase64,
      embedding: referenceEmbedding,
      phrase_index: phraseIndex, // ← matches backend VerifyVoiceRequest
    }),
  });
  const data = await res.json();
  if (!res.ok)
    return NextResponse.json(
      { error: data.detail ?? "Verification failed" },
      { status: res.status },
    );

  return NextResponse.json({
    score: data.score,
    passed: data.passed,
    threshold: data.threshold,
    reason: data.reason,
    transcript: data.transcript,
    overlap: data.overlap,
    expected_phrase: data.expected_phrase,
  });
}
