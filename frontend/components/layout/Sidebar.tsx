"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { useState } from "react";

const adminNav = [
  {
    section: "Overview",
    items: [{ href: "/dashboard/admin", label: "📊 Dashboard" }],
  },
  {
    section: "Pensioners",
    items: [
      { href: "/dashboard/admin/pensioners", label: "👥 All Pensioners" },
      { href: "/dashboard/admin/pensioners/new", label: "➕ Register New" },
      { href: "/dashboard/admin/deaths", label: "⚰️ Report Deaths" },
    ],
  },
  {
    section: "Biometrics",
    items: [
      { href: "/dashboard/admin/enroll/face", label: "📷 Enrol Face" },
      { href: "/dashboard/admin/enroll/voice", label: "🎙️ Enrol Voice" },
    ],
  },
  {
    section: "Reports",
    items: [
      { href: "/dashboard/admin/reports", label: "📈 Monthly Reports" },
      { href: "/dashboard/admin/audit", label: "📜 Audit Logs" },
    ],
  },
  {
    section: "Admin",
    items: [{ href: "/dashboard/admin/users", label: "🔑 User Accounts" }],
  },
];

const pensionerNav = [
  {
    section: "My Account",
    items: [
      { href: "/dashboard/portal", label: "📊 My Dashboard" },
      { href: "/dashboard/portal/verify", label: "🔐 Verify Liveness" },
      { href: "/dashboard/portal/documents", label: "📄 My Documents" },
    ],
  },
];

// ── Shared nav content (used in both desktop sidebar + mobile sheet) ──────────
function NavContent({
  role,
  onLinkClick,
}: {
  role?: string;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const nav = role === "pensioner" ? pensionerNav : adminNav;

  function isActive(href: string) {
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
    if (href === "/dashboard/portal") return pathname === "/dashboard/portal";
    return pathname === href;
  }

  return (
    <div className='flex flex-col overflow-y-auto shrink-0 h-full'>
      {/* Brand header */}
      <div className='px-4 py-4 border-b border-white/8'>
        <div className='flex items-center gap-2.5'>
          <span className='text-xl'>🇳🇬</span>
          <div>
            <p className='text-white text-[11px] font-bold leading-tight'>
              BPMLVS
            </p>
            <p className='text-white/30 text-[8px] uppercase tracking-[0.8px]'>
              {role === "pensioner" ? "Pensioner Portal" : "Admin Console"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className='flex-1 '>
        {nav.map(({ section, items }) => (
          <div key={section}>
            <p className='px-3.5 pt-3 pb-0.5 text-[9px] text-white/25 font-bold uppercase tracking-[1.6px]'>
              {section}
            </p>
            {items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={onLinkClick}
                className={`flex items-center gap-1.5 px-3.5 py-1.75 text-[11px] transition-all border-l-[3px] ${
                  isActive(href)
                    ? "bg-white/[0.07] text-white border-l-[#c8960c]"
                    : "text-white/50 border-l-transparent hover:bg-white/6 hover:text-white"
                }`}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className='px-3.5 py-3 border-t border-white/8 flex items-center gap-2.5'>
        <div className='min-w-0'>
          <p className='text-white text-[11px] font-semibold truncate'>
            {user?.fullName ?? "Loading…"}
          </p>
          <p className='text-white/35 text-[8.5px] uppercase tracking-[0.7px] truncate'>
            {role === "pensioner" ? "Pensioner" : "Administrator"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  role?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ role, open = false, onOpenChange }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — unchanged */}
      <aside className='hidden fixed top-12 left-0 md:flex w-47.5 bg-[#003311] flex-col shrink-0  overflow-y-auto md:w-64 h-full'>
        <NavContent role={role} />
      </aside>

      {/* Mobile sheet — no trigger inside, controlled externally */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side='left'
          className='w-55 p-0 bg-[#003311] border-r border-white/8'>
          <VisuallyHidden>
            <DialogTitle>Sidebar Menu</DialogTitle>
            <DialogDescription>
              Sidebar menu for admins and pensioners
            </DialogDescription>
          </VisuallyHidden>
          <SheetClose className='absolute right-3 top-3 z-10 flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.07] text-white/50 hover:text-white transition-colors cursor-pointer'>
            <X size={13} />
          </SheetClose>
          <NavContent role={role} onLinkClick={() => onOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
