"use client";

import { useEffect, useRef } from "react";

interface MonthData {
  month: string;
  year: number;
  verified: number;
  failed: number;
}

export function ComplianceTrendChart({ data }: { data: MonthData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !data.length) return;
    const p = cv.parentElement;
    if (!p) return;
    cv.width = Math.max(p.clientWidth || 400, 200);
    cv.height = Math.max(p.clientHeight || 175, 100);

    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width,
      H = cv.height;
    ctx.clearRect(0, 0, W, H);

    const labels = data.map((d) => d.month);
    const verified = data.map((d) => d.verified);
    const failed = data.map((d) => d.failed);
    const allValues = [...verified, ...failed];
    const mn = 0,
      mx = Math.max(...allValues, 1) * 1.1;
    const rng = mx - mn || 1;
    const P = { t: 11, r: 11, b: 24, l: 38 };
    const cW = W - P.l - P.r,
      cH = H - P.t - P.b;

    // Grid
    ctx.strokeStyle = "#e8ece8";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = P.t + (cH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(P.l, y);
      ctx.lineTo(P.l + cW, y);
      ctx.stroke();
      ctx.fillStyle = "#888";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round(mx - (rng * i) / 4)), P.l - 2, y + 3);
    }

    // Draw line helper
    function drawLine(dataset: number[], color: string, fill: string) {
      if (dataset.length < 2) return;
      ctx!.beginPath();
      for (let j = 0; j < dataset.length; j++) {
        const x = P.l + (j / (dataset.length - 1)) * cW;
        const y = P.t + (1 - (dataset[j] - mn) / rng) * cH;
        j === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.lineTo(P.l + cW, P.t + cH);
      ctx!.lineTo(P.l, P.t + cH);
      ctx!.closePath();
      ctx!.fillStyle = fill;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 2.5;
      ctx!.lineJoin = "round";
      for (let k = 0; k < dataset.length; k++) {
        const x = P.l + (k / (dataset.length - 1)) * cW;
        const y = P.t + (1 - (dataset[k] - mn) / rng) * cH;
        k === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.stroke();
      for (let m = 0; m < dataset.length; m++) {
        const x = P.l + (m / (dataset.length - 1)) * cW;
        const y = P.t + (1 - (dataset[m] - mn) / rng) * cH;
        ctx!.beginPath();
        ctx!.arc(x, y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.fill();
      }
    }

    drawLine(failed, "#b91c1c", "rgba(185,28,28,.08)");
    drawLine(verified, "#005c1a", "rgba(0,92,26,.10)");

    // X labels
    ctx.fillStyle = "#888";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    for (let n = 0; n < labels.length; n++) {
      ctx.fillText(labels[n], P.l + (n / (labels.length - 1)) * cW, H - 4);
    }

    // Legend
    const legItems = [
      { color: "#005c1a", label: "Verified" },
      { color: "#b91c1c", label: "Failed" },
    ];
    let lx = P.l;
    legItems.forEach(({ color, label }) => {
      ctx.fillStyle = color;
      ctx.fillRect(lx, 2, 8, 8);
      ctx.fillStyle = "#555";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, lx + 10, 10);
      lx += 50;
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
    />
  );
}
