"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexUser } from "@/lib/useConvexUser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";

const DOC_TYPES = [
  "Retirement Notice",
  "Authorization Letter",
  "ID Card",
  "Clearance Form",
  "Verification Certificate",
  "Death Certificate",
] as const;
type DocType = (typeof DOC_TYPES)[number];

export function DocumentsTab({
  pensionerId,
}: {
  pensionerId: Id<"pensioners">;
}) {
  const { convexUserId } = useConvexUser();
  const docs = useQuery(api.documents.getForPensioner, { pensionerId });
  const genUrl = useMutation(api.documents.generateUploadUrl);
  const save = useMutation(api.documents.saveDocument);
  const del = useMutation(api.documents.deleteDocument);
  const [type, setType] = useState<DocType | "">("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!type) {
      toast.error("Select document type first");
      return;
    }
    if (!convexUserId) {
      toast.error("Not authenticated");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Max 16 MB");
      return;
    }
    setUploading(true);
    try {
      const url = await genUrl();
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!r.ok) throw new Error();
      const { storageId } = await r.json();
      await save({
        pensionerId,
        documentType: type as DocType,
        storageId,
        filename: file.name,
        mimeType: file.type,
        uploadedBy: convexUserId,
      });
      toast.success("Document uploaded");
      setType("");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: Id<"documents">) {
    if (!convexUserId) return;
    setDeletingId(id);
    try {
      await del({ documentId: id, deletedBy: convexUserId });
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className='space-y-4'>
      <Card className='border-dashed'>
        <CardContent className='px-4 py-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <Select value={type} onValueChange={(v) => setType(v as DocType)}>
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder='Select document type...' />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              onClick={() => ref.current?.click()}
              disabled={uploading || !type || !convexUserId}>
              {uploading ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                <Upload className='h-4 w-4 mr-2' />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            <input
              ref={ref}
              type='file'
              className='hidden'
              accept='.pdf,.png,.jpg,.jpeg,.webp,.docx'
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
          </div>
          <p className='text-[10px] text-(--muted-foreground) mt-2'>
            PDF, PNG, JPG, WEBP, DOCX · Max 16 MB
          </p>
        </CardContent>
      </Card>
      {docs === undefined ? (
        <div className='text-center py-8 text-sm text-(--muted-foreground)'>
          <Loader2 className='h-5 w-5 animate-spin mx-auto mb-2' />
          Loading…
        </div>
      ) : docs.length === 0 ? (
        <div className='text-center py-10 text-sm text-(--muted-foreground) border-2 border-dashed rounded-xl'>
          <FileText className='h-8 w-8 mx-auto mb-2 opacity-30' />
          No documents uploaded yet
        </div>
      ) : (
        docs.map((d) => (
          <div
            key={d._id}
            className='flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-(--muted)/20 transition-colors'>
            <FileText className='h-5 w-5 text-(--muted-foreground) shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{d.filename}</p>
              <p className='text-xs text-(--muted-foreground)'>
                {d.documentType} ·{" "}
                {format(new Date(d._creationTime), "dd MMM yyyy")}
              </p>
            </div>
            <div className='flex items-center gap-1 shrink-0'>
              {d.url && (
                <Button variant='ghost' size='icon' className='h-7 w-7' asChild>
                  <a href={d.url} target='_blank' rel='noopener noreferrer'>
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-(--destructive) hover:text-(--destructive)'
                onClick={() => handleDelete(d._id)}
                disabled={deletingId === d._id}>
                {deletingId === d._id ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Trash2 className='h-3.5 w-3.5' />
                )}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
