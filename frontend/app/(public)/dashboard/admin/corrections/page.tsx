"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/useConvexUser";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  FilePen,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// ─── Types ──────────────────────────────────────────────────────────────────

type Status = "pending" | "approved" | "rejected";

const FIELD_LABELS: Record<string, string> = {
  fullName: "Legal Full Name",
  nin: "NIN",
  bvn: "BVN",
};

const STATUS_CFG: Record<
  Status,
  { label: string; badge: string; borderLeft: string; dot: string }
> = {
  pending: {
    label: "Pending",
    badge: "b-warn",
    borderLeft: "border-l-[#c8960c]",
    dot: "bg-[#c8960c]",
  },
  approved: {
    label: "Approved",
    badge: "b-ok",
    borderLeft: "border-l-[#004d19]",
    dot: "bg-[#004d19]",
  },
  rejected: {
    label: "Rejected",
    badge: "b-fail",
    borderLeft: "border-l-[#b91c1c]",
    dot: "bg-[#b91c1c]",
  },
};

const TABS: { value: Status | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

type RequestRow = {
  _id: string;
  _creationTime: number;
  pensionerId: string;
  field: string;
  currentValue?: string;
  requestedValue: string;
  supportingNote?: string;
  status: Status;
  reviewNote?: string;
  reviewedAt?: number;
  pensioner?: { fullName: string; pensionId: string } | null;
  reviewer?: { username: string } | null;
};

// ─── Review panel (inline, replaces sheet for design consistency) ────────────

function ReviewPanel({
  request,
  onClose,
}: {
  request: RequestRow;
  onClose: () => void;
}) {
  const { convexUserId } = useConvexUser();
  const approveReq = useMutation(api.correctionRequests.approve);
  const rejectReq = useMutation(api.correctionRequests.reject);

  const [note, setNote] = useState("");
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);

  const cfg = STATUS_CFG[request.status];
  const isPending = request.status === "pending";

  const initials = (request.pensioner?.fullName ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  async function handleApprove() {
    if (!convexUserId) return;
    setActing("approve");
    try {
      await approveReq({
        requestId: request._id as any,
        reviewedByUserId: convexUserId,
        reviewNote: note.trim() || undefined,
      });
      toast.success(
        `${FIELD_LABELS[request.field]} updated on pensioner record`,
      );
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Approval failed"));
    } finally {
      setActing(null);
    }
  }

  async function handleReject() {
    if (!convexUserId) return;
    if (!note.trim()) {
      toast.error("A reason is required for rejection");
      return;
    }
    setActing("reject");
    try {
      await rejectReq({
        requestId: request._id as any,
        reviewedByUserId: convexUserId,
        reviewNote: note.trim(),
      });
      toast.success("Request rejected");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Rejection failed"));
    } finally {
      setActing(null);
    }
  }

  return (
    <div className='tbl-card'>
      {/* Panel header */}
      <div className='rpt-hdr'>
        <div>
          <p className='rpt-title'>Correction Request</p>
          <p className='rpt-sub'>Review and approve or reject</p>
        </div>
        <button onClick={onClose} className='btn-sm boutline text-[10px]'>
          ← Back to list
        </button>
      </div>

      <div className='p-4 space-y-4'>
        {/* Pensioner identity */}
        <div className='sc flex items-center gap-3 !border-l-[#004d19]'>
          <div
            className='w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0'
            style={{ background: "var(--g1)" }}>
            {initials}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-[12px] font-bold text-[--ink]'>
              {request.pensioner?.fullName ?? "Unknown"}
            </p>
            <p className='text-[10px] text-[--muted-foreground]'>
              {request.pensioner?.pensionId ?? "—"}
            </p>
          </div>
          <span className={cn("badge", cfg.badge)}>{cfg.label}</span>
        </div>

        {/* Field diff */}
        <div>
          <p className='sb-sec !px-0 !pt-0 mb-1.5'>Requested change</p>
          <div className='tbl-card overflow-hidden'>
            <div className='bg-[--smoke] px-3 py-2 border-b border-[--mist]'>
              <p className='text-[9px] text-[--muted-foreground] uppercase tracking-wide font-bold mb-0.5'>
                Field
              </p>
              <p className='text-[12px] font-bold text-[--ink]'>
                {FIELD_LABELS[request.field]}
              </p>
            </div>
            <div className='grid grid-cols-2 divide-x divide-[--mist]'>
              <div className='px-3 py-2.5'>
                <p className='text-[9px] text-[--muted-foreground] uppercase tracking-wide font-bold mb-1'>
                  Current
                </p>
                <p className='font-mono text-[11px] text-[--muted-foreground]'>
                  {request.currentValue || "—"}
                </p>
              </div>
              <div className='px-3 py-2.5'>
                <p className='text-[9px] text-[--muted-foreground] uppercase tracking-wide font-bold mb-1'>
                  Requested
                </p>
                <p className='font-mono text-[11px] font-bold text-[--ink]'>
                  {request.requestedValue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pensioner note */}
        {request.supportingNote && (
          <div>
            <p className='sb-sec !px-0 !pt-0 mb-1'>Pensioner's note</p>
            <div className='rounded-lg border border-[--mist] bg-[--smoke] px-3 py-2.5 text-[11px] text-[--muted-foreground] italic'>
              "{request.supportingNote}"
            </div>
          </div>
        )}

        <p className='text-[10px] text-[--muted-foreground]'>
          Submitted{" "}
          {formatDistanceToNow(new Date(request._creationTime), {
            addSuffix: true,
          })}
        </p>

        {/* Already reviewed */}
        {!isPending && (
          <div
            className={cn(
              "rounded-lg border px-3 py-2.5",
              request.status === "approved"
                ? "border-[#bbf7d0] bg-[#dcfce7]"
                : "border-[#fecaca] bg-[#fee2e2]",
            )}>
            <p className='text-[11px] font-bold text-[--ink]'>
              {request.status === "approved" ? "Approved" : "Rejected"} by{" "}
              {request.reviewer?.username ?? "admin"}
              {request.reviewedAt &&
                ` · ${formatDistanceToNow(new Date(request.reviewedAt), { addSuffix: true })}`}
            </p>
            {request.reviewNote && (
              <p className='text-[10.5px] text-[--muted-foreground] mt-0.5'>
                {request.reviewNote}
              </p>
            )}
          </div>
        )}

        {/* Action area */}
        {isPending && (
          <div className='space-y-3 pt-1 border-t border-[--smoke]'>
            <div className='space-y-1'>
              <p className='sb-sec !px-0 !pt-2'>
                Admin note{" "}
                <span className='font-normal normal-case tracking-normal'>
                  — required for rejection
                </span>
              </p>
              <textarea
                rows={3}
                className='srch w-full resize-none bg-white'
                placeholder='Add a note (e.g. verified against NIN slip, or reason for rejection)…'
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Warning */}
            <div className='flex items-start gap-2 rounded-lg border border-[#fde047]/60 bg-[#fef9c3] px-3 py-2.5'>
              <AlertTriangle className='h-3 w-3 shrink-0 mt-0.5 text-[#854d0e]' />
              <p className='text-[9.5px] text-[#854d0e]'>
                Approving will immediately update the pensioner's{" "}
                <strong>{FIELD_LABELS[request.field]}</strong> on record. Ensure
                the requested value has been verified.
              </p>
            </div>

            <div className='flex gap-2'>
              <button
                className='btn-sm boutline flex-1 flex items-center justify-center gap-1.5 text-[#b91c1c] border-[#fecaca] hover:border-[#b91c1c]'
                disabled={!!acting}
                onClick={handleReject}>
                {acting === "reject" ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  <>
                    <XCircle className='h-3 w-3' /> Reject
                  </>
                )}
              </button>
              <button
                className='btn-sm bgreen flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50'
                disabled={!!acting}
                onClick={handleApprove}>
                {acting === "approve" ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  <>
                    <CheckCircle2 className='h-3 w-3' /> Approve &amp; apply
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function RequestItem({
  request,
  onClick,
}: {
  request: RequestRow;
  onClick: () => void;
}) {
  const cfg = STATUS_CFG[request.status];
  const initials = (request.pensioner?.fullName ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-3 px-4 py-3 border-l-2 transition-colors hover:bg-[--offwhite]",
        cfg.borderLeft,
      )}>
      <div
        className='w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0'
        style={{ background: "var(--g1)" }}>
        {initials}
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-baseline gap-2'>
          <p className='text-[11.5px] font-bold text-[--ink] truncate'>
            {request.pensioner?.fullName ?? "Unknown"}
          </p>
          <span className='text-[9.5px] text-[--muted-foreground] shrink-0'>
            {request.pensioner?.pensionId}
          </span>
        </div>
        <p className='text-[10.5px] text-[--muted-foreground] mt-0.5'>
          <span className='font-semibold text-[--ink]'>
            {FIELD_LABELS[request.field]}
          </span>{" "}
          →{" "}
          <span className='font-mono'>
            {request.requestedValue.length > 32
              ? request.requestedValue.slice(0, 32) + "…"
              : request.requestedValue}
          </span>
        </p>
      </div>

      <div className='shrink-0 flex flex-col items-end gap-1'>
        <span className={cn("badge", cfg.badge)}>{cfg.label}</span>
        <span className='text-[9px] text-[--muted-foreground]'>
          {formatDistanceToNow(new Date(request._creationTime), {
            addSuffix: true,
          })}
        </span>
      </div>

      <ChevronRight className='h-3.5 w-3.5 text-[--muted-foreground] shrink-0' />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCorrectionsPage() {
  const [tab, setTab] = useState<Status | "all">("pending");
  const [selected, setSelected] = useState<RequestRow | null>(null);

  const requests = useQuery(api.correctionRequests.list, {
    status: tab === "all" ? undefined : tab,
  }) as RequestRow[] | undefined;
  const pendingCount = useQuery(api.correctionRequests.pendingCount, {});

  return (
    <div className='max-w-3xl mx-auto space-y-4 p-4'>
      {/* Page header */}
      {!selected && (
        <div className='page-hdr'>
          <div>
            <h1 className='page-title'>
              Correction Requests
              {!!pendingCount && (
                <span
                  className='ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white align-middle'
                  style={{ background: "var(--gold)" }}>
                  {pendingCount}
                </span>
              )}
            </h1>
            <small>
              Review pensioner requests to correct legal name, NIN, or BVN
            </small>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected ? (
        <ReviewPanel request={selected} onClose={() => setSelected(null)} />
      ) : (
        <>
          {/* Filter tabs */}
          <div className='reg-bar !px-0 !py-0 !bg-transparent !border-0 gap-1 flex'>
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "fbtn flex items-center gap-1.5",
                  tab === t.value && "on",
                )}>
                {t.label}
                {t.value === "pending" && !!pendingCount && (
                  <span
                    className='inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold'
                    style={{
                      background:
                        tab === "pending"
                          ? "rgba(255,255,255,0.25)"
                          : "var(--gold)",
                      color: tab === "pending" ? "#fff" : "#000",
                    }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className='tbl-card'>
            {requests === undefined ? (
              <div className='divide-y divide-[--smoke]'>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='flex items-center gap-3 px-4 py-3'>
                    <Skeleton className='h-8 w-8 rounded-full bg-[--smoke]' />
                    <div className='flex-1 space-y-1.5'>
                      <Skeleton className='h-2.5 w-44 bg-[--smoke]' />
                      <Skeleton className='h-2.5 w-60 bg-[--smoke]' />
                    </div>
                    <Skeleton className='h-4 w-14 rounded-lg bg-[--smoke]' />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className='flex flex-col items-center gap-2 py-12 text-center'>
                <FilePen className='h-7 w-7 text-[--muted-foreground] opacity-30' />
                <p className='text-[12px] font-semibold text-[--muted-foreground]'>
                  No {tab === "all" ? "" : tab} requests
                </p>
                <p className='text-[10px] text-[--muted-foreground] opacity-60'>
                  {tab === "pending"
                    ? "All caught up — no pending corrections"
                    : "Nothing to show here"}
                </p>
              </div>
            ) : (
              <ul className='divide-y divide-[--smoke]'>
                {requests.map((r) => (
                  <li key={r._id}>
                    <RequestItem request={r} onClick={() => setSelected(r)} />
                  </li>
                ))}
              </ul>
            )}

            {requests && requests.length > 0 && (
              <div className='tbl-foot'>
                <span>
                  {requests.length} request{requests.length !== 1 ? "s" : ""}
                </span>
                {tab === "pending" && !!pendingCount && (
                  <span className='flex items-center gap-1.5'>
                    <Clock className='h-3 w-3 text-[#c8960c]' />
                    {pendingCount} awaiting review
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
