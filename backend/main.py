import os
import io
import base64
import asyncio
import numpy as np
import torch
import torchaudio
import torch.nn.functional as F
import soundfile as sf
import cv2
import inflect

from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from speechbrain.inference.speaker import EncoderClassifier
from insightface.app import FaceAnalysis
from faster_whisper import WhisperModel
import onnxruntime as ort

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# ── Thread pool for CPU-bound ML inference ─────────────────────────────────
# Each worker gets its own thread so inference never blocks the event loop
_executor = ThreadPoolExecutor(max_workers=int(os.getenv("INFERENCE_WORKERS", "4")))

# ── Global model holders ───────────────────────────────────────────────────
classifier     = None
whisper        = None
face_app       = None
antispoof_session = None
_asp_h = _asp_w = _asp_name = _asp_shape = None


# ═══════════════════════════════════════════════════════════════════════════
# LIFESPAN — load models once at startup
# ═══════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    global classifier, whisper, face_app, antispoof_session
    global _asp_h, _asp_w, _asp_name, _asp_shape

    loop = asyncio.get_event_loop()

    def _load_models():
        global classifier, whisper, face_app, antispoof_session
        global _asp_h, _asp_w, _asp_name, _asp_shape

        print("Loading ECAPA-TDNN voice model...")
        MODEL_DIR = os.path.join(os.path.expanduser("~"), "ecapa_model")
        classifier = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir=MODEL_DIR,
        )
        print("Voice model loaded.")

        print("Loading Whisper model...")
        device      = "cuda" if torch.cuda.is_available() else "cpu"
        compute     = "float16" if device == "cuda" else "int8"
        whisper     = WhisperModel("medium", device=device, compute_type=compute)
        print(f"Whisper model loaded on {device}.")

        print("Loading InsightFace model...")
        FACE_MODEL_DIR = os.path.join(os.path.expanduser("~"), "insightface_models")
        face_app       = FaceAnalysis(name="buffalo_l", root=FACE_MODEL_DIR)
        face_app.prepare(ctx_id=0 if torch.cuda.is_available() else -1, det_size=(640, 640))
        print("Face model loaded.")

        print("Loading anti-spoof model...")
        BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
        ANTISPOOF_MODEL = os.path.join(BASE_DIR, "antispoof.onnx")

        providers = (
            ["CUDAExecutionProvider", "CPUExecutionProvider"]
            if torch.cuda.is_available()
            else ["CPUExecutionProvider"]
        )
        antispoof_session = ort.InferenceSession(ANTISPOOF_MODEL, providers=providers)

        _input      = antispoof_session.get_inputs()[0]
        _shape      = _input.shape
        _asp_shape  = _shape
        _asp_h      = _shape[2] if isinstance(_shape[2], int) else 80
        _asp_w      = _shape[3] if isinstance(_shape[3], int) else 80
        _asp_name   = _input.name
        print(f"Anti-spoof loaded. Input={_asp_name} shape={_shape} resize={_asp_w}x{_asp_h}")

    # Load in thread so startup doesn't block the event loop
    await loop.run_in_executor(_executor, _load_models)
    print("✅ All models loaded — server ready.")
    yield
    # Shutdown
    _executor.shutdown(wait=False)
    print("Server shutdown complete.")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════
# THRESHOLDS
# ═══════════════════════════════════════════════════════════════════════════

VOICE_THRESHOLD     = 0.68
FACE_THRESHOLD      = 0.65
ANTISPOOF_THRESHOLD = 0.40
VARIANCE_FLOOR      = 0.003

_LEFT_LID_TOP  = 40
_LEFT_LID_BOT  = 39
_LEFT_EYE_W_L  = 33
_LEFT_EYE_W_R  = 35
_RIGHT_LID_TOP = 94
_RIGHT_LID_BOT = 93
_RIGHT_EYE_W_L = 87
_RIGHT_EYE_W_R = 89

_p = inflect.engine()

VERIFY_PHRASES = [
    "my name is verified",
    "pension approved today",
    "i am present",
    "confirm my identity",
]
PHRASE_OVERLAP_THRESHOLD = 0.5


# ═══════════════════════════════════════════════════════════════════════════
# ANTI-SPOOF UTILITY
# ═══════════════════════════════════════════════════════════════════════════

def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - x.max())
    return e / e.sum()


def predict_spoof(img_bgr: np.ndarray, bbox) -> float:
    x1, y1, x2, y2 = [int(v) for v in bbox]
    h, w = img_bgr.shape[:2]
    pad  = 20
    x1, y1 = max(0, x1 - pad), max(0, y1 - pad)
    x2, y2 = min(w, x2 + pad), min(h, y2 + pad)

    face_crop = img_bgr[y1:y2, x1:x2]
    if face_crop.size == 0:
        return 0.0

    face_crop = cv2.resize(face_crop, (_asp_w, _asp_h))
    rgb_norm  = (cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0 - 0.5) / 0.5
    tensor    = np.transpose(rgb_norm, (2, 0, 1))[np.newaxis]

    logits = antispoof_session.run(None, {_asp_name: tensor})[0][0]
    probs  = _softmax(logits)
    real_p = float(probs[2]) if len(probs) > 2 else float(probs[-1])
    return real_p


# ═══════════════════════════════════════════════════════════════════════════
# LIVENESS SIGNALS
# ═══════════════════════════════════════════════════════════════════════════

def _ear(landmarks, top_idx, bot_idx, w_l_idx, w_r_idx) -> float:
    top        = landmarks[top_idx]
    bot        = landmarks[bot_idx]
    wl         = landmarks[w_l_idx]
    wr         = landmarks[w_r_idx]
    vertical   = float(np.linalg.norm(top - bot))
    horizontal = float(np.linalg.norm(wl - wr))
    if horizontal < 1e-3:
        return float("nan")
    return vertical / horizontal


def _head_pose_yaw(landmarks) -> float:
    nose    = landmarks[86]
    l_eye   = landmarks[33]
    r_eye   = landmarks[87]
    eye_cx  = (l_eye[0] + r_eye[0]) / 2.0
    eye_span = float(np.linalg.norm(l_eye - r_eye))
    if eye_span < 1e-3:
        return 0.0
    return float((nose[0] - eye_cx) / eye_span)


def analyse_liveness(landmarks_seq: list) -> dict:
    ears = []
    yaws = []
    for lm in landmarks_seq:
        if lm is None:
            continue
        l_ear = _ear(lm, _LEFT_LID_TOP,  _LEFT_LID_BOT,  _LEFT_EYE_W_L,  _LEFT_EYE_W_R)
        r_ear = _ear(lm, _RIGHT_LID_TOP, _RIGHT_LID_BOT, _RIGHT_EYE_W_L, _RIGHT_EYE_W_R)
        valid = [v for v in (l_ear, r_ear) if not np.isnan(v)]
        if valid:
            ears.append(float(np.mean(valid)))
        yaws.append(_head_pose_yaw(lm))

    blink_detected = any(e < 0.20 for e in ears) if ears else False
    pose_variation = float(np.std(yaws)) if len(yaws) >= 2 else 0.0

    return {
        "blink_detected": blink_detected,
        "pose_variation": round(pose_variation, 4),
        "ear_min":        round(min(ears), 4) if ears else None,
        "ear_values":     [round(e, 4) for e in ears],
        "yaw_values":     [round(y, 4) for y in yaws],
    }


# ═══════════════════════════════════════════════════════════════════════════
# SHARED UTILITIES
# ═══════════════════════════════════════════════════════════════════════════

def base64_to_tensor(audio_b64: str) -> torch.Tensor:
    audio_bytes = base64.b64decode(audio_b64)
    data, sample_rate = sf.read(io.BytesIO(audio_bytes))
    if data.ndim > 1:
        data = data.mean(axis=1)
    waveform = torch.tensor(data, dtype=torch.float32).unsqueeze(0)
    if sample_rate != 16000:
        waveform = torchaudio.functional.resample(waveform, sample_rate, 16000)
    return waveform


def check_audio_quality(waveform: torch.Tensor) -> tuple[bool, str]:
    rms      = waveform.pow(2).mean().sqrt().item()
    duration = waveform.shape[-1] / 16000
    if duration < 2.0:
        return False, "Recording too short — please speak for at least 3 seconds"
    if rms < 0.005:
        return False, "Audio too quiet — please speak louder or move closer to the mic"
    if rms > 0.95:
        return False, "Audio clipping — please move the mic slightly away"
    return True, "ok"


def base64_to_image(image_b64: str) -> np.ndarray:
    if "," in image_b64:
        image_b64 = image_b64.split(",", 1)[1]
    image_bytes = base64.b64decode(image_b64)
    np_arr      = np.frombuffer(image_bytes, np.uint8)
    img         = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image — may be corrupt or wrong format")
    return img


def _transcribe_sync(waveform: torch.Tensor) -> str:
    audio_np = waveform.squeeze().numpy()
    if audio_np.ndim > 1:
        audio_np = audio_np[0]
    max_val = np.abs(audio_np).max()
    if max_val > 0:
        audio_np = audio_np / max_val * 0.95
    buffer = io.BytesIO()
    sf.write(buffer, audio_np, 16000, format="WAV")
    buffer.seek(0)
    segments, _ = whisper.transcribe(
        buffer,
        beam_size=5,
        language="en",
        condition_on_previous_text=False,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=300, speech_pad_ms=200),
        word_timestamps=False,
    )
    text = " ".join(seg.text for seg in segments).lower().strip()
    return text.replace("-", " ")


async def transcribe_audio(waveform: torch.Tensor) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _transcribe_sync, waveform)


def phrase_match(transcript: str, phrase: str) -> tuple[bool, float]:
    phrase_words     = set(phrase.lower().split())
    transcript_words = set(transcript.lower().split())
    if not phrase_words:
        return False, 0.0
    overlap = len(phrase_words & transcript_words) / len(phrase_words)
    return overlap >= PHRASE_OVERLAP_THRESHOLD, round(overlap, 3)


# ═══════════════════════════════════════════════════════════════════════════
# FACE LIVENESS CHECK (sync — called via executor)
# ═══════════════════════════════════════════════════════════════════════════

def _face_liveness_check_sync(frames_b64: list[str]):
    embeddings:       list[np.ndarray] = []
    detection_scores: list[float]      = []
    spoof_scores:     list[float]      = []
    landmarks_seq:    list             = []

    for idx, frame_b64 in enumerate(frames_b64):
        try:
            img = base64_to_image(frame_b64)
        except Exception as e:
            return False, f"Frame {idx + 1}: {e}", [], [], {}

        h, w = img.shape[:2]
        if w < 320 or h < 320:
            scale = max(320 / w, 320 / h)
            img   = cv2.resize(img, (int(w * scale), int(h * scale)))

        faces = face_app.get(img)
        if not faces:
            continue
        if len(faces) > 1:
            return False, "multiple_faces_detected", [], [], {}

        face      = faces[0]
        real_prob = predict_spoof(img, face.bbox)
        spoof_scores.append(real_prob)

        emb = face.embedding.astype(np.float32)
        emb = emb / np.linalg.norm(emb)
        embeddings.append(emb)
        detection_scores.append(float(face.det_score))

        lm = getattr(face, "landmark_2d_106", None)
        landmarks_seq.append(lm)

    if len(embeddings) < 3:
        return False, "insufficient_faces_detected", [], [], {}

    avg_real_prob = float(np.mean(spoof_scores))
    if avg_real_prob < ANTISPOOF_THRESHOLD:
        return False, f"spoof_detected (score={avg_real_prob:.3f})", [], [], {}

    variance = float(np.std(embeddings))
    if variance < VARIANCE_FLOOR:
        return False, "spoof_detected_static_image", [], [], {}

    valid_lm      = [lm for lm in landmarks_seq if lm is not None]
    liveness_info = {"blink_detected": False, "pose_variation": 0.0}

    if valid_lm:
        liveness_info      = analyse_liveness(valid_lm)
        POSE_VAR_THRESHOLD = 0.010
        has_motion = (
            liveness_info["blink_detected"]
            or liveness_info["pose_variation"] >= POSE_VAR_THRESHOLD
        )
        if not has_motion:
            return False, "spoof_detected_no_liveness", [], [], liveness_info

    return True, "ok", embeddings, detection_scores, liveness_info


async def face_liveness_check(frames_b64: list[str]):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _face_liveness_check_sync, frames_b64)


# ═══════════════════════════════════════════════════════════════════════════
# VOICE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

class EnrolRequest(BaseModel):
    audio_list: List[str]


class VerifyVoiceRequest(BaseModel):
    audio_base64: str
    embedding: List[float]
    phrase_index: int = 0


def _encode_voice_sync(audio_list: list[str]):
    embeddings = []
    for idx, audio_b64 in enumerate(audio_list):
        try:
            waveform = base64_to_tensor(audio_b64)
        except Exception as e:
            raise ValueError(f"Recording {idx + 1}: could not decode audio — {e}")
        ok, reason = check_audio_quality(waveform)
        if not ok:
            raise ValueError(f"Recording {idx + 1}: {reason}")
        with torch.no_grad():
            emb = classifier.encode_batch(waveform)
            emb = F.normalize(emb, dim=-1).squeeze()
        embeddings.append(emb)
    return embeddings


@app.post("/enrol/voice")
async def enrol_voice(req: EnrolRequest):
    if not req.audio_list:
        raise HTTPException(status_code=400, detail="No audio provided")
    if len(req.audio_list) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 recordings")

    loop = asyncio.get_event_loop()
    try:
        embeddings = await loop.run_in_executor(_executor, _encode_voice_sync, req.audio_list)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    avg = torch.stack(embeddings).mean(dim=0)
    avg = F.normalize(avg, dim=-1)
    return {"embedding": avg.tolist(), "samples_used": len(embeddings)}


@app.post("/verify/voice")
async def verify_voice(req: VerifyVoiceRequest):
    if req.phrase_index < 0 or req.phrase_index >= len(VERIFY_PHRASES):
        raise HTTPException(status_code=400, detail="Invalid phrase_index")

    expected_phrase = VERIFY_PHRASES[req.phrase_index]

    try:
        waveform = base64_to_tensor(req.audio_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Decode error: {e}")

    ok, reason = check_audio_quality(waveform)
    if not ok:
        raise HTTPException(status_code=422, detail=reason)

    loop = asyncio.get_event_loop()

    def _verify_sync():
        with torch.no_grad():
            live_emb = classifier.encode_batch(waveform)
            return F.normalize(live_emb, dim=-1).squeeze()

    live_emb = await loop.run_in_executor(_executor, _verify_sync)

    ref_emb  = F.normalize(torch.tensor(req.embedding, dtype=torch.float32), dim=-1)
    score    = float(torch.dot(live_emb, ref_emb).item())
    score_norm = round((score + 1) / 2, 3)

    spoken_text      = await transcribe_audio(waveform)
    matched, overlap = phrase_match(spoken_text, expected_phrase)

    if not matched:
        return {
            "score":           score_norm,
            "passed":          False,
            "reason":          "speech_mismatch",
            "transcript":      spoken_text,
            "expected_phrase": expected_phrase,
            "overlap":         overlap,
            "threshold":       VOICE_THRESHOLD,
        }

    if waveform.abs().mean().item() < 0.01:
        raise HTTPException(status_code=422, detail="Suspicious audio pattern")

    return {
        "score":      score_norm,
        "passed":     score_norm >= VOICE_THRESHOLD,
        "threshold":  VOICE_THRESHOLD,
        "transcript": spoken_text,
        "overlap":    overlap,
    }


@app.get("/phrases")
async def get_phrases():
    return {"phrases": [{"index": i, "text": p} for i, p in enumerate(VERIFY_PHRASES)]}


# ═══════════════════════════════════════════════════════════════════════════
# FACE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

class EnrolFaceRequest(BaseModel):
    image_list: List[str]


class VerifyFaceRequest(BaseModel):
    frames: List[str]
    reference_embedding: List[float]


def _enrol_face_sync(image_list: list[str]):
    embeddings = []
    for idx, img_b64 in enumerate(image_list):
        try:
            img = base64_to_image(img_b64)
        except Exception as e:
            raise ValueError(f"Image {idx + 1}: {e}")

        faces = face_app.get(img)
        if not faces:
            raise ValueError(
                f"Image {idx + 1}: no face detected — ensure good lighting and face the camera directly"
            )
        if len(faces) > 1:
            raise ValueError(
                f"Image {idx + 1}: multiple faces detected — only the pensioner should be in frame"
            )

        emb = faces[0].embedding.astype(np.float32)
        emb = emb / np.linalg.norm(emb)
        embeddings.append(emb)
    return embeddings


@app.post("/enrol/face")
async def enrol_face(req: EnrolFaceRequest):
    if not req.image_list:
        raise HTTPException(status_code=400, detail="No images provided")

    loop = asyncio.get_event_loop()
    try:
        embeddings = await loop.run_in_executor(_executor, _enrol_face_sync, req.image_list)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    avg = np.mean(embeddings, axis=0)
    avg = avg / np.linalg.norm(avg)
    return {"embedding": avg.tolist(), "samples_used": len(embeddings)}


@app.post("/verify/face")
async def verify_face(req: VerifyFaceRequest):
    if not req.frames or len(req.frames) < 5:
        raise HTTPException(status_code=400, detail="At least 5 frames required")

    ref_arr  = np.array(req.reference_embedding, dtype=np.float32)
    ref_norm = np.linalg.norm(ref_arr)
    if ref_norm < 1e-6:
        raise HTTPException(status_code=400, detail="reference_embedding is zero vector — enrol first")

    ok, reason, embeddings, detection_scores, liveness_info = await face_liveness_check(req.frames)
    if not ok:
        return {"passed": False, "score": 0.0, "reason": reason}

    avg_emb = np.mean(embeddings, axis=0)
    avg_emb = avg_emb / np.linalg.norm(avg_emb)

    if avg_emb.shape[0] != ref_arr.shape[0]:
        raise HTTPException(
            status_code=409,
            detail=f"embedding_dimension_mismatch:live={avg_emb.shape[0]},stored={ref_arr.shape[0]}"
        )

    ref_emb    = ref_arr / ref_norm
    score      = float(np.dot(avg_emb, ref_emb))
    score_norm = round((score + 1) / 2, 3)

    return {
        "passed":               score_norm >= FACE_THRESHOLD,
        "score":                score_norm,
        "threshold":            FACE_THRESHOLD,
        "detection_confidence": round(float(np.mean(detection_scores)), 3),
        "variance":             round(float(np.std(embeddings)), 5),
        "frames_used":          len(embeddings),
        "frames_submitted":     len(req.frames),
        "liveness":             liveness_info,
    }


# ═══════════════════════════════════════════════════════════════════════════
# DEBUG ENDPOINTS — remove before production
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/debug/face")
async def debug_face(req: VerifyFaceRequest):
    results       = []
    all_landmarks = []

    for idx, frame_b64 in enumerate(req.frames[:10]):
        try:
            img   = base64_to_image(frame_b64)
            faces = face_app.get(img)

            if not faces:
                results.append({"frame": idx + 1, "faces_found": 0})
                all_landmarks.append(None)
                continue

            face     = faces[0]
            lm       = getattr(face, "landmark_2d_106", None)
            ear_info = {}
            yaw      = None

            all_landmarks.append(lm)

            if lm is not None:
                l = _ear(lm, _LEFT_LID_TOP,  _LEFT_LID_BOT,  _LEFT_EYE_W_L,  _LEFT_EYE_W_R)
                r = _ear(lm, _RIGHT_LID_TOP, _RIGHT_LID_BOT, _RIGHT_EYE_W_L, _RIGHT_EYE_W_R)
                ear_info = {
                    "left_ear":  round(l, 4) if not np.isnan(l) else None,
                    "right_ear": round(r, 4) if not np.isnan(r) else None,
                    "avg_ear":   round(float(np.nanmean([l, r])), 4),
                }
                yaw = round(_head_pose_yaw(lm), 4)

            real_prob = predict_spoof(img, face.bbox)
            results.append({
                "frame":     idx + 1,
                "shape":     f"{img.shape[1]}x{img.shape[0]}",
                "det_score": round(float(face.det_score), 3),
                "real_prob": round(real_prob, 4),
                "ear":       ear_info,
                "yaw":       yaw,
            })
        except Exception as e:
            results.append({"frame": idx + 1, "error": str(e)})
            all_landmarks.append(None)

    valid_lm         = [lm for lm in all_landmarks if lm is not None]
    liveness_summary = analyse_liveness(valid_lm) if valid_lm else {}

    return {
        "model_input_shape":   str(_asp_shape),
        "antispoof_threshold": ANTISPOOF_THRESHOLD,
        "liveness_summary":    liveness_summary,
        "frames":              results,
    }


@app.post("/debug/landmarks")
async def debug_landmarks(req: VerifyFaceRequest):
    img   = base64_to_image(req.frames[0])
    faces = face_app.get(img)
    if not faces:
        return {"error": "no face"}
    lm = getattr(faces[0], "landmark_2d_106", None)
    if lm is None:
        return {"error": "no 2d106 landmarks"}
    return {
        "landmarks": {
            str(i): {"x": round(float(lm[i][0]), 1), "y": round(float(lm[i][1]), 1)}
            for i in range(len(lm))
        },
        "image_shape": f"{img.shape[1]}x{img.shape[0]}",
    }


# ═══════════════════════════════════════════════════════════════════════════
# HEALTH
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health():
    return {
        "status":                "ok",
        "device":                "cuda" if torch.cuda.is_available() else "cpu",
        "voice_model":           "ECAPA-TDNN",
        "face_model":            "InsightFace buffalo_l",
        "voice_threshold":       VOICE_THRESHOLD,
        "face_threshold":        FACE_THRESHOLD,
        "antispoof_threshold":   ANTISPOOF_THRESHOLD,
        "antispoof_input_shape": str(_asp_shape),
        "verify_phrases":        VERIFY_PHRASES,
        "inference_workers":     int(os.getenv("INFERENCE_WORKERS", "4")),
    }