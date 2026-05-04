"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import path from "path";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

function NavDivider() {
  return <div className='w-px h-3.5 bg-white/10 shrink-0' />;
}

export default function NavPills() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string | undefined;

  const isAdmin = role === "admin";
  const isOfficer = role === "officer";
  const isStaff = isAdmin || isOfficer;
  const isPensioner = role === "pensioner";

  const dashboardPath = isStaff ? "admin" : isPensioner ? "portal" : null;

  // Public routes — everyone sees these
  const publicScreens: NavItem[] = [
    { label: "Overview", href: "/overview", icon: "🏛️" },
    { label: "Crisis", href: "/crisis", icon: "📊" },
    { label: "ROI", href: "/roi", icon: "💰" },
    { label: "Partner", href: "/partner", icon: "🤝" },
    { label: "Report Death", href: "/report-death", icon: "⚰️" },
  ];

  // Role-gated routes

  const authItem: NavItem | null = !user
    ? { label: "Sign In", href: "/sign-in", icon: "🔑" }
    : null;
  const roleScreens: NavItem[] = [
    ...(dashboardPath
      ? [
          {
            label: "Dashboard",
            href: `/dashboard/${dashboardPath}`,
            icon: "📑",
          },
        ]
      : []),

    ...(isStaff
      ? [
          {
            label: "Registry",
            href: "/dashboard/admin/pensioners",
            icon: "👥",
          },
          { label: "Reports", href: "/dashboard/admin/reports", icon: "📈" },
        ]
      : []),

    // Pensioner only
    ...(isPensioner
      ? [{ label: "Verify", href: "/dashboard/portal/verify", icon: "🔐" }]
      : []),
  ];

  const screens: NavItem[] = [
    ...publicScreens,
    ...roleScreens,
    ...(authItem ? [authItem] : []),
  ];

  const isActive = (href: string): boolean => {
    return pathname === href;
  };

  const activeItem = screens.find((s) => isActive(s.href));

  return (
    <div className='fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex justify-center px-4 w-full pointer-events-none'>
      {/* Desktop pill */}
      <nav className='hidden md:flex items-center gap-0.5 bg-[#001400]/96 backdrop-blur-md border border-[#c8960c]/25 rounded-full px-2.5 py-1 shadow-[0_8px_28px_rgba(0,0,0,0.4)] pointer-events-auto'>
        {screens.map((screen, i) => (
          <div key={screen.href} className='flex items-center gap-0.5'>
            <Link
              href={screen.href}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap ${
                isActive(screen.href)
                  ? "bg-[#c8960c] text-black shadow-md"
                  : "text-white/50 hover:text-white hover:bg-white/8"
              }`}>
              <span>{screen.icon}</span>
              {screen.label}
            </Link>
            {i < screens.length - 1 && <NavDivider />}
          </div>
        ))}
      </nav>

      {/* Mobile pill */}
      <div className='flex md:hidden items-center gap-2 pointer-events-auto'>
        <div className='flex items-center gap-2 bg-[#001400]/96 backdrop-blur-md border border-[#c8960c]/25 rounded-full px-4 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.4)]'>
          <span className='text-[11px]'>{activeItem?.icon}</span>
          <span className='text-[11px] font-semibold text-[#e6ad0e]'>
            {activeItem?.label ?? "Menu"}
          </span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className='flex items-center justify-center w-9 h-9 rounded-full bg-[#001400]/96 backdrop-blur-md border border-[#c8960c]/25 shadow-[0_8px_28px_rgba(0,0,0,0.4)] text-white/70 hover:text-white transition-colors'>
              <Menu size={15} />
            </button>
          </SheetTrigger>

          <SheetContent
            side='bottom'
            className='bg-[#001a08] border-t border-[#c8960c]/25 rounded-t-2xl px-5 py-6'>
            <VisuallyHidden>
              <DialogTitle>Navigation Menu</DialogTitle>
              <DialogDescription>
                Main Navigation menu with links to Crisis, Dashboard, ROI
              </DialogDescription>
            </VisuallyHidden>
            <div className='w-10 h-1 bg-white/15 rounded-full mx-auto mb-6' />

            <p className='text-[8.5px] font-bold text-white/25 uppercase tracking-[1.8px] mb-3 px-1'>
              BPMLVS v2.0 — Navigation
            </p>

            <div className='grid grid-cols-2 gap-2'>
              {screens.map((screen) => (
                <Link
                  key={screen.href}
                  href={screen.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-semibold transition-all ${
                    isActive(screen.href)
                      ? "bg-[#c8960c] text-black"
                      : "bg-white/6 border border-white/8 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}>
                  <span className='text-base'>{screen.icon}</span>
                  {screen.label}
                </Link>
              ))}
            </div>

            <p className='text-[9px] text-white/20 text-center mt-5'>
              Proprietary &amp; Confidential — Government Evaluation Only
            </p>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
