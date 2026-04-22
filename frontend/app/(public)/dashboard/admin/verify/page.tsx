"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function AdminVerifyHubPage() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const results = useQuery(
    api.pensioners.search,
    q.length > 1 ? { query: q } : "skip",
  );

  return (
    <div className=' overflow-y-auto h-[calc(100vh-50px)]'>
      <div className='bg-white border-b border-mist p-4'>
        <h2 className='text-lg font-semibold'>🔐 Multi-Modal Verify</h2>
        <p className='text-[10px] text-muted-foreground mt-0.5'>
          Search for a pensioner to begin their biometric verification session
        </p>
      </div>

      <div className='max-w-md mx-auto p-5'>
        {/* Search */}
        <div className='bg-white border border-mist rounded-lg p-4 shadow-sm shadow-green-50'>
          <label className='block mb-8 font-medium text-slate uppercase tracking-wide text-[11px]'>
            Search Pensioner
          </label>
          <input
            className='srch w-full rounded-md border border-mist bg-offwhite px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-g1 focus:border-g1'
            type='text'
            placeholder='🔍 Name, Pension ID, NIN, BVN…'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />

          {/* Results */}
          {results !== undefined && results.length > 0 && (
            <div className='mt-10 flex flex-col gap-4'>
              {results.map((p) => (
                <button
                  key={p._id}
                  className='border border-mist rounded-lg text-left flex items-center gap-10 p-3 bg-offwhite cursor-pointer transition-colors transition-duration-150 font-inherit'
                  onClick={() =>
                    router.push(`/dashboard/admin/pensioners/${p._id}/verify`)
                  }
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#f0faf0";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--g1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--offwhite)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--mist)";
                  }}>
                  <div className='flex h-32 w-32 items-center justify-center text-white text-[11px] shrink-0 bg-g1 font-semibold rounded-[50%]'>
                    {p.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-[12px] font-semibold'>
                      {p.fullName}
                    </div>
                    <div className='flex gap-2 mt-2'>
                      <code className='text-[9px] text-g1'>{p.pensionId}</code>
                      <span
                        className={`text-[8px] blvl l${p.biometricLevel?.slice(1) ?? "0"}`}>
                        {p.biometricLevel}
                      </span>
                      <span
                        className={`badge text-[8px] bg- ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <span className='text-[11px] font-medium text-g1 '>
                    Verify →
                  </span>
                </button>
              ))}
            </div>
          )}

          {results !== undefined && q.length > 1 && results.length === 0 && (
            <p className='text-center mt-4 text-[12px] text-muted-foreground'>
              No pensioners found matching "{q}"
            </p>
          )}

          {q.length <= 1 && (
            <p className='text-center mt-4 text-[10px] text-muted-foreground'>
              Type at least 2 characters to search
            </p>
          )}
        </div>

        {/* Info box */}
        <div className='mt-4 border text-[11px]  p-4 text-center text-slate rounded-lg leading-[1.6] bg-[rgba(0,77,25,.06)] border-[rgba(0,77,25,.15)]'>
          <strong className='text-g1'>🔐 Multi-Modal Verification</strong>{" "}
          requires the pensioner to already have at least a face reference photo
          enrolled (L1). The system will then run whichever modalities are
          enrolled:
          <ul style={{ margin: "8px 0 0 16px", color: "var(--muted)" }}>
            <li>
              <strong>L2</strong> — Face liveness only
            </li>

            <li>
              <strong>L3</strong> — All Two modalities fused
            </li>
          </ul>
          <p className='mt-2 text-(--muted)'>
            To enrol a new pensioner's biometrics for the first time, use the{" "}
            <strong>Face / FP / Voice Enrol</strong> links in the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
