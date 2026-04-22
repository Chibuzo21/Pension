"use client";

import { useEffect, useRef } from "react";

interface Props {
  data: { l3: number; l1l2: number; l0: number };
}

const COLORS = ["#166534", "#6d28d9", "#0f766e", "#1d4ed8"];
const LABELS = ["L3 All Three", "L1/L2 Partial", "L0 None"];

export function BiometricLevelChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const values = [data.l3, data.l1l2, data.l0];

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const p = cv.parentElement;
    if (!p) return;
    cv.width = Math.max(p.clientWidth || 260, 160);
    cv.height = Math.max(p.clientHeight || 160, 100);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width,
      H = cv.height;
    ctx.clearRect(0, 0, W, H);

    const LW = Math.min(W * 0.42, 140);
    const cW = W - LW;
    const cx = cW / 2,
      cy = H / 2;
    const R = Math.min(cW, H) / 2 - 9,
      iR = R * 0.54;
    const tot = values.reduce((a, b) => a + b, 0) || 1;
    let startA = -Math.PI / 2;

    values.forEach((v, i) => {
      const ang = (v / tot) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startA, startA + ang);
      ctx.closePath();
      ctx.fillStyle = COLORS[i];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      startA += ang;
    });

    // Hole
    ctx.beginPath();
    ctx.arc(cx, cy, iR, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Center text
    ctx.fillStyle = COLORS[0];
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round((data.l3 / tot) * 100)}%`, cx, cy - 4);
    ctx.fillStyle = "#768876";
    ctx.font = "8px sans-serif";
    ctx.fillText("L3", cx, cy + 10);

    // Legend
    const lx = cW + 6,
      lh = 16,
      sy = (H - values.length * lh) / 2 + lh;
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    values.forEach((v, j) => {
      const ly = sy + j * lh;
      ctx.fillStyle = COLORS[j];
      ctx.fillRect(lx, ly - 9, 10, 10);
      ctx.fillStyle = "#444";
      ctx.fillText(
        `${LABELS[j]} (${Math.round((v / tot) * 100)}%)`,
        lx + 13,
        ly,
      );
    });
  }, [data]);

  return (
    <div className='bg-white border border-mist rounded-[11px] shadow-sm overflow-hidden'>
      <div className='flex items-center px-4 py-2.5 border-b border-smoke'>
        <div className='text-xs font-bold text-ink'>
          🔐 Biometric Assurance Levels
        </div>
      </div>
      <div className='h-40 p-3.5'>
        <canvas ref={canvasRef} className='w-full h-full block' />
      </div>
    </div>
  );
}
