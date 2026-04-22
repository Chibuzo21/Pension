import { format } from "date-fns";
import { Activity, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LevelChip } from "./ui-primitives";
import { Doc } from "@/convex/_generated/dataModel";

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const fillClass =
    pct >= 80 ? "bg-[#004d19]" : pct >= 60 ? "bg-[#c8960c]" : "bg-[#b91c1c]";
  return (
    <div className='flex items-center gap-2'>
      <div className='w-10 h-1.5 bg-[#dce6dc] rounded-full overflow-hidden'>
        <div
          className={cn("h-full rounded-full", fillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-[11px] font-mono font-semibold text-[#0c190c] tabular-nums'>
        {pct}%
      </span>
    </div>
  );
}

export function VerificationHistoryTab({
  verifications,
}: {
  verifications: Doc<"verifications">[];
}) {
  if (verifications.length === 0) {
    return (
      <div className='rounded-2xl border-2 border-dashed border-[#dce6dc] py-14 text-center space-y-3'>
        <div className='h-10 w-10 rounded-full bg-[#f5f7f5] border border-[#dce6dc] flex items-center justify-center mx-auto'>
          <Activity className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='text-[13px] font-medium text-[#4a5e4a]'>
          No verification sessions recorded
        </p>
        <p className='text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed'>
          Sessions will appear here after the pensioner's first monthly
          verification.
        </p>
      </div>
    );
  }

  const passCount = verifications.filter((v) => v.status === "VERIFIED").length;
  const passRate = Math.round((passCount / verifications.length) * 100);

  return (
    <div className='rounded-2xl border border-[#dce6dc] overflow-hidden shadow-sm'>
      {/* dark header with stats */}
      <div className='bg-[#001a08] px-4 py-3 flex items-center gap-3'>
        <TrendingUp className='h-3.5 w-3.5 text-[#c8960c]' />
        <span className='text-[10px] font-bold uppercase tracking-widest text-white/40'>
          Session log
        </span>
        <div className='ml-auto flex gap-6'>
          {[
            {
              label: "Total",
              value: verifications.length,
              color: "text-white",
            },
            { label: "Passed", value: passCount, color: "text-[#4ade80]" },
            {
              label: "Pass rate",
              value: `${passRate}%`,
              color: passRate >= 80 ? "text-[#4ade80]" : "text-[#facc15]",
            },
          ].map((s) => (
            <div key={s.label} className='text-right'>
              <div className='text-[9px] font-bold uppercase tracking-wider text-white/30'>
                {s.label}
              </div>
              <div
                className={cn(
                  "text-[16px] font-black leading-tight tabular-nums",
                  s.color,
                )}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* table */}
      <table className='w-full border-collapse text-[11.5px]'>
        <thead>
          <tr className='bg-[#f5f7f5] border-b border-[#dce6dc]'>
            {[
              "Date & Time",
              "Result",
              "Fused score",
              "Face",
              "Voice",
              "Level",
            ].map((h, i) => (
              <th
                key={h}
                className={cn(
                  "py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground",
                  i >= 4 ? "text-center" : "text-left",
                )}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {verifications.map((v, i) => (
            <tr
              key={v._id}
              className={cn(
                "border-b border-[#dce6dc] last:border-0 transition-colors",
                i % 2 === 0 ? "bg-white" : "bg-[#f5f7f5]",
                "hover:bg-[#f0faf0]",
              )}>
              <td className='py-2.5 px-3 font-mono text-[11px] text-[#4a5e4a] whitespace-nowrap'>
                {v._creationTime
                  ? format(new Date(v._creationTime), "d MMM yyyy, HH:mm")
                  : "—"}
              </td>
              <td className='py-2.5 px-3'>
                {v.status === "VERIFIED" ? (
                  <span className='inline-flex items-center gap-1 text-[10px] font-bold text-[#166534] bg-[#dcfce7] border border-[#86efac] px-2 py-0.5 rounded-full whitespace-nowrap'>
                    <CheckCircle2 className='h-2.5 w-2.5' /> Verified
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 text-[10px] font-bold text-[#991b1b] bg-[#fee2e2] border border-[#fca5a5] px-2 py-0.5 rounded-full whitespace-nowrap'>
                    <XCircle className='h-2.5 w-2.5' /> Failed
                  </span>
                )}
              </td>
              <td className='py-2.5 px-3'>
                {v.fusedScore != null ? (
                  <ScoreBar value={v.fusedScore} />
                ) : (
                  <span className='text-muted-foreground'>—</span>
                )}
              </td>
              <td className='py-2.5 px-3 font-mono text-[11px] text-muted-foreground tabular-nums'>
                {v.faceMatchScore != null
                  ? `${(v.faceMatchScore * 100).toFixed(0)}%`
                  : "—"}
              </td>
              <td className='py-2.5 px-3 font-mono text-[11px] text-muted-foreground tabular-nums text-center'>
                {v.voiceScore != null
                  ? `${(v.voiceScore * 100).toFixed(0)}%`
                  : "—"}
              </td>
              <td className='py-2.5 px-3 text-center'>
                <LevelChip level={v.assuranceLevel ?? "L0"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
