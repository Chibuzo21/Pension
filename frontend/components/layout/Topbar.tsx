"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const routeLabels: Record<string, string> = {
  "/dashboard/admin": "Pension Administration System",
  "/dashboard/admin/pensioners": "Pensioner Registry",
  "/dashboard/admin/pensioners/new": "Register New Pensioner",
  "/dashboard/admin/reports": "Reports & Analytics",
  "/dashboard/admin/audit": "Audit Logs",
  "/dashboard/admin/users": "User Accounts",
  "/dashboard/portal": "Pensioner Self-Service Portal",
  "/dashboard/portal/verify": "Biometric Verification",
  "/dashboard/portal/documents": "My Documents",
};

function getLabel(pathname: string) {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.includes("/verify")) return "Multi-Modal Biometric Verification";
  if (pathname.includes("/edit")) return "Edit Pensioner";
  if (pathname.includes("/pensioners/")) return "Pensioner Detail";
  return "BPMLVS v2.0";
}

interface TopBarProps {
  role?: string | null;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export function TopBar({
  role,
  subtitle,
  backHref,
  backLabel,
  action,
}: TopBarProps) {
  const pathname = usePathname();
  const label = getLabel(pathname);
  const sub = subtitle ?? "BPMLVS v2.0 · Abia State Government";
  const { user } = useUser();

  return (
    // h-12 = 48px, a real Tailwind value. shrink-0 prevents it from being squished.
    <header className='h-12 shrink-0 sticky top-0 z-30 bg-[#001a08] flex items-center justify-between px-5 border-b-2 border-[#c8960c]'>
      <div className='flex items-center gap-2'>
        <div className='text-white'>
          <div className='text-xs font-bold leading-tight'>{label}</div>
          <span className='text-[7px] text-white/35 font-normal block tracking-wide uppercase'>
            {sub}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {action}
        {backHref && (
          <Link href={backHref}>
            <button className='px-3 py-1.5 text-xs font-semibold bg-transparent border border-white/30 text-white rounded hover:bg-white/10 transition-colors'>
              ← {backLabel ?? "Back"}
            </button>
          </Link>
        )}
        <div className='flex items-center gap-2 pl-3 border-l border-white/10'>
          <div className='min-w-0 hidden sm:block'>
            <div className='text-white text-xs font-semibold truncate leading-tight'>
              {user?.fullName ?? user?.username ?? "User"}
            </div>
            <div className='text-white/35 text-[8px] uppercase tracking-wider font-normal'>
              {role ?? "Officer"}
            </div>
          </div>
          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
        </div>
      </div>
    </header>
  );
}
