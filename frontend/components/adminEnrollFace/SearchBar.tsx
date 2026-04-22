"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type SearchType = {
  selectedId: Id<"pensioners"> | null;
  setSelectedId: React.Dispatch<React.SetStateAction<Id<"pensioners"> | null>>;
  openCamera(): Promise<void>;
};
export default function SearchBar({
  selectedId,
  setSelectedId,
  openCamera,
}: SearchType) {
  const [search, setSearch] = useState("");
  const searchResults = useQuery(
    api.pensioners.search,
    search.length > 1 ? { query: search } : "skip",
  );
  return (
    <div>
      {!selectedId && (
        <Card>
          <CardHeader className='pb-3 pt-4 px-4'>
            <CardTitle className='text-sm flex items-center gap-2'>
              <Search className='h-4 w-4' />
              Step 1 — Select Pensioner
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pb-4 space-y-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                className='pl-9'
                placeholder='Search by name or Pension ID…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className='space-y-1.5'>
              {searchResults?.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    setSelectedId(p._id);
                    setSearch("");
                    openCamera();
                  }}
                  className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all text-left'>
                  <div className='w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0'>
                    {p.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{p.fullName}</p>
                    <p className='text-xs text-muted-foreground font-mono'>
                      {p.pensionId}
                    </p>
                  </div>
                  <Badge variant='outline' className='shrink-0 text-[10px]'>
                    {p.biometricLevel}
                  </Badge>
                </button>
              ))}
              {search.length > 1 && searchResults?.length === 0 && (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  No results for "{search}"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
