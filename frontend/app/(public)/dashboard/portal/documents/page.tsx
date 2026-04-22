"use client";

import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function PortalDocumentsPage() {
  const { pensioner, isLoaded, isLinked } = useCurrentPensioner();

  const docs = useQuery(
    api.documents.getForPensioner,
    pensioner?._id ? { pensionerId: pensioner._id } : "skip",
  );

  return (
    <div className='max-w-2xl mx-auto space-y-5'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
          <Link href='/dashboard/portal'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h2 className='text-lg font-semibold'>My Documents</h2>
          <p className='text-sm text-(--muted-foreground) mt-0.5'>
            Documents on file with your pension office
          </p>
        </div>
      </div>

      {!isLoaded ? (
        <div className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-16 rounded-xl' />
          ))}
        </div>
      ) : !isLinked ? (
        <Card className='border-amber-200 bg-amber-50'>
          <CardContent className='py-8 text-center space-y-2'>
            <AlertTriangle className='h-10 w-10 text-amber-500 mx-auto' />
            <p className='text-sm font-medium text-amber-800'>
              Account not linked
            </p>
            <p className='text-xs text-amber-700'>
              Contact your pension office to link your account.
            </p>
          </CardContent>
        </Card>
      ) : docs === undefined ? (
        <div className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-16 rounded-xl' />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='py-10 text-center'>
            <FileText className='h-10 w-10 text-(--muted-foreground)/40 mx-auto mb-3' />
            <p className='text-sm text-(--muted-foreground)'>
              No documents on file yet
            </p>
            <p className='text-xs text-(--muted-foreground) mt-1'>
              Documents uploaded by your pension officer will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-2'>
          {docs.map((doc) => (
            <div
              key={doc._id}
              className='flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-(--muted)/20 transition-colors'>
              <div className='w-9 h-9 rounded-lg bg-(--primary)/10 text-(--primary) flex items-center justify-center shrink-0'>
                <FileText className='h-4 w-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{doc.filename}</p>
                <p className='text-xs text-(--muted-foreground)'>
                  {doc.documentType} ·{" "}
                  {format(new Date(doc._creationTime), "dd MMM yyyy")}
                </p>
              </div>
              {doc.url && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='shrink-0 gap-1.5'
                  asChild>
                  <a href={doc.url} target='_blank' rel='noopener noreferrer'>
                    <ExternalLink className='h-3.5 w-3.5' />
                    View
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
