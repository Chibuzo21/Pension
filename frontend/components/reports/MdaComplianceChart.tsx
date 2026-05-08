// components/MdaComplianceChart.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getBarColor = (rate: number) => {
  if (rate >= 80) return "#10b981"; // emerald
  if (rate >= 50) return "#f59e0b"; // amber
  return "#ef4444"; // red
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className='bg-white border border-smoke rounded-xl shadow-md px-3 py-2.5 text-xs'>
      <p className='font-semibold text-ink mb-1'>{d.mda}</p>
      <p className='text-slate'>
        Total: <span className='font-semibold text-ink'>{d.total}</span>
      </p>
      <p className='text-slate'>
        Compliant:{" "}
        <span className='font-semibold text-emerald-600'>{d.compliant}</span>
      </p>
      <p className='text-slate'>
        Rate:{" "}
        <span className='font-semibold' style={{ color: getBarColor(d.rate) }}>
          {d.rate}%
        </span>
      </p>
    </div>
  );
};

export function MdaComplianceChart({
  daysThreshold = 37,
}: {
  daysThreshold?: number;
}) {
  const data = useQuery(api.pensioners.getMdaCompliance, { daysThreshold });
  const isLoading = data === undefined;

  return (
    <div className='bg-white border border-smoke rounded-xl overflow-hidden min-w-0'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-smoke flex items-center gap-2'>
        <Building2 className='h-4 w-4 text-g1 shrink-0' />
        <span className='text-sm font-semibold text-ink'>
          MDA Compliance Rate
        </span>
        <span className='text-[10px] text-slate ml-auto'>
          Verified within {daysThreshold} days
        </span>
      </div>

      {/* Legend */}
      <div className='px-4 pt-3 flex items-center gap-4'>
        {[
          { label: "≥ 80% compliant", color: "#10b981" },
          { label: "50–79%", color: "#f59e0b" },
          { label: "< 50%", color: "#ef4444" },
        ].map(({ label, color }) => (
          <div key={label} className='flex items-center gap-1.5'>
            <span
              className='w-2.5 h-2.5 rounded-sm shrink-0'
              style={{ background: color }}
            />
            <span className='text-[10px] text-slate'>{label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className='p-4'>
        {isLoading ? (
          <div className='flex flex-col gap-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-8 rounded-lg bg-smoke' />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className='text-center py-14 text-sm text-slate'>
            No MDA data available yet.
          </div>
        ) : (
          <ResponsiveContainer
            width='100%'
            height={Math.max(260, data.length * 44)}>
            <BarChart
              data={data}
              layout='vertical'
              margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
              barSize={18}>
              <CartesianGrid
                strokeDasharray='3 3'
                horizontal={false}
                stroke='#f1f5f9'
              />
              <XAxis
                type='number'
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type='category'
                dataKey='mda'
                width={140}
                tick={{ fontSize: 10, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey='rate' radius={[0, 6, 6, 0]}>
                <LabelList
                  dataKey='rate'
                  position='right'
                  formatter={(v) => `${v}%`}
                  style={{ fontSize: 10, fontWeight: 600, fill: "#475569" }}
                />
                {data.map((entry) => (
                  <Cell key={entry.mda} fill={getBarColor(entry.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
