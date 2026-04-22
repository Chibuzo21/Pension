import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { PensionerRow } from "@/types/pensioner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function statusBadge(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "badge-active",
    DECEASED: "badge-deceased",
    SUSPENDED: "badge-suspended",
    FLAGGED: "badge-flagged",
  };
  return map[status] ?? "bg-gray-100 text-gray-600 border border-gray-200";
}

export function biometricLevelBadge(level: string): string {
  const map: Record<string, string> = {
    L3: "badge-l4",
    L2: "badge-l3",
    L1: "badge-l2",
    L0: "badge-l1",
  };
  return map[level] ?? "badge-l0";
}

export function verificationStatusBadge(status: string): string {
  const map: Record<string, string> = {
    VERIFIED: "badge-verified",
    FAILED: "badge-failed",
    PENDING: "badge-pending",
    MANUAL_OVERRIDE: "badge-manual-override",
  };
  return map[status] ?? "badge-pending";
}
export function exportCSV(rows: PensionerRow[]) {
  const headers = [
    "Pension ID",
    "Full Name",
    "MDA",
    "Status",
    "Bio Level",
    "Last Verified",
    "Days Overdue",
  ];
  const escape = (v: string | number | undefined | null) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lines = rows.map((p) => {
    const days = p.lastVerification
      ? differenceInDays(
          new Date(),
          new Date(p.lastVerification.verificationDate),
        )
      : "never";

    return [
      p.pensionId,
      p.fullName,
      p.lastMda,
      p.status,
      p.biometricLevel,
      p.lastVerification?.verificationDate ?? "",
      days,
    ]
      .map(escape)
      .join(",");
  });

  const csv = [headers.join(","), ...lines].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `overdue-pensioners-${format(new Date(), "yyyy-MM")}.csv`;

  a.click();
  URL.revokeObjectURL(url);
}
