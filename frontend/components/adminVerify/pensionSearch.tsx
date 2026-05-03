"use client";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { ChevronRight, Search, ShieldAlert, UserX } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "../ui/badge";

export function PensionerSearch({
  onSelect,
}: {
  onSelect: (p: Doc<"pensioners">) => void;
}) {
  const [query, setQuery] = useState("");

  // debounce via convex skip — only fires when query.length >= 2
  const results = useQuery(
    api.pensioners.search,
    query.trim().length >= 2
      ? { query: query.trim(), status: "active" }
      : "skip",
  );

  return (
    <div className='space-y-4'>
      {/* Callout */}
      <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-primary px-4 py-3 dark:border-amber-800/40 dark:bg-primary-950/30'>
        <ShieldAlert className='mt-0.5 h-4 w-4 shrink-0 text-[#c8960c]' />
        <p className='text-sm text-white/80'>
          <span className='font-semibold'>Assisted verification</span> — use
          this only when a pensioner is physically present and unable to
          self-verify. Your officer ID will be recorded on the audit log.
        </p>
      </div>

      {/* Search input */}
      <div className='relative'>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder='Pension ID or full name…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Results */}
      {query.trim().length >= 2 && (
        <div className='overflow-hidden rounded-xl border'>
          {results === undefined ? (
            <div className='space-y-px p-1'>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className='h-14 rounded-lg' />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-10 text-center text-muted-foreground'>
              <UserX className='h-8 w-8 opacity-40' />
              <p className='text-sm'>No active pensioners found</p>
            </div>
          ) : (
            <ul className='divide-y'>
              {results.map((p) => (
                <li key={p._id}>
                  <button
                    className='flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60'
                    onClick={() => onSelect(p)}>
                    {/* Avatar placeholder */}
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                      {p.fullName
                        .split(" ")
                        .slice(0, 2)
                        .map((w: string) => w[0])
                        .join("")}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {p.fullName}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {p.pensionId}{" "}
                        <span className='font-mono'>· {p.biometricLevel}</span>
                      </p>
                    </div>

                    <div className='flex items-center gap-2'>
                      {!p.faceEncoding && (
                        <Badge variant='destructive' className='text-[10px] '>
                          No face
                        </Badge>
                      )}
                      {p.voiceEncoding && (
                        <Badge variant='secondary' className='text-[10px]'>
                          Voice enrolled
                        </Badge>
                      )}
                      <ChevronRight className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
