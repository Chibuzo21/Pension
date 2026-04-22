"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    faceapi: {
      nets: {
        tinyFaceDetector: { loadFromUri(url: string): Promise<void> };
        faceLandmark68TinyNet: { loadFromUri(url: string): Promise<void> };
        faceRecognitionNet: { loadFromUri(url: string): Promise<void> };
      };
      TinyFaceDetectorOptions: new (opts: {
        inputSize: number;
        scoreThreshold: number;
      }) => unknown;
      detectSingleFace(
        input: HTMLCanvasElement,
        opts: unknown,
      ): {
        withFaceLandmarks(useTiny: boolean): {
          withFaceDescriptor(): Promise<{
            landmarks: { positions: { x: number; y: number }[] };
            descriptor: Float32Array;
          } | null>;
        };
      };
      euclideanDistance?(a: Float32Array, b: Float32Array): number;
    };
  }
}
// jsdelivr is on the CSP allowlist
const CDN_SCRIPT =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.js";

// Model weights — also served from jsdelivr
const MODEL_URL =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model";

export type FaceApiState = "idle" | "loading" | "ready" | "error";

// Module-level cache so models only load once
let _modelsLoaded = false;
let _loadPromise: Promise<void> | null = null;

function ensureModels(): Promise<void> {
  if (_modelsLoaded) return Promise.resolve();
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    const fa = window.faceapi;
    if (!fa) throw new Error("face-api.js not on window yet");
    await Promise.all([
      fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      fa.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    _modelsLoaded = true;
  })();

  return _loadPromise;
}

export interface DetectResult {
  faceFound: boolean;
  bothEyesFound: boolean;
  /** 128-float descriptor for match comparison — null when no face detected */
  descriptor: Float32Array | null;
}

export interface FaceApiHook {
  state: FaceApiState;
  detectFace: (canvas: HTMLCanvasElement) => Promise<DetectResult>;
  compareFaces: (a: Float32Array, b: Float32Array) => number;
}

export function useFaceApi(): FaceApiHook {
  const [state, setState] = useState<FaceApiState>("idle");

  useEffect(() => {
    // If models already loaded in a previous render cycle, skip straight to ready
    if (_modelsLoaded) {
      ensureModels().then(() => setState("ready"));

      return;
    }

    function initModels() {
      setState("loading");
      ensureModels()
        .then(() => setState("ready"))
        .catch(() => setState("error"));
    }

    // Inject the CDN script tag if not already present
    if (!document.getElementById("bpmlvs-faceapi")) {
      const script = document.createElement("script");
      script.id = "bpmlvs-faceapi";
      script.src = CDN_SCRIPT;
      script.async = true;
      script.onload = initModels;
      script.onerror = () => setState("error");
      document.head.appendChild(script);
    } else {
      // Script tag exists — window.faceapi may or may not be ready yet
      if (window.faceapi) initModels();
      else {
        const existing = document.getElementById(
          "bpmlvs-faceapi",
        ) as HTMLScriptElement;
        existing.addEventListener("load", initModels, { once: true });
        existing.addEventListener("error", () => setState("error"), {
          once: true,
        });
      }
    }
  }, []);

  async function detectFace(canvas: HTMLCanvasElement): Promise<DetectResult> {
    const fa = window.faceapi;
    if (!fa) throw new Error("face-api not loaded");
    if (!_modelsLoaded) throw new Error("Face models not ready");

    try {
      const opts = new fa.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.3,
      });
      const result = await fa
        .detectSingleFace(canvas, opts)
        .withFaceLandmarks(true) // true → use tiny 68-point model
        .withFaceDescriptor();

      if (!result)
        return { faceFound: false, bothEyesFound: false, descriptor: null };

      // 68-point landmarks: indices 36-41 = left eye, 42-47 = right eye
      const pts = result.landmarks.positions as { x: number; y: number }[];
      const leftEye = pts.slice(36, 42);
      const rightEye = pts.slice(42, 48);

      return {
        faceFound: true,
        bothEyesFound: leftEye.length > 0 && rightEye.length > 0,
        descriptor: result.descriptor as Float32Array,
      };
    } catch {
      return { faceFound: false, bothEyesFound: false, descriptor: null };
    }
  }

  function compareFaces(a: Float32Array, b: Float32Array): number {
    const fa = window.faceapi;
    if (fa?.euclideanDistance) return fa.euclideanDistance(a, b) as number;
    // Fallback manual implementation
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
    return Math.sqrt(sum);
  }

  return { state, detectFace, compareFaces };
}
