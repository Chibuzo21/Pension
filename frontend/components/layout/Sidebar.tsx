"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  Skull,
  BarChart3,
  ScrollText,
  KeyRound,
  ShieldCheck,
  FileText,
  CheckCircle,
  UserCog,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { DialogDescription, DialogTitle } from "../ui/dialog";

const adminNav = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Pensioners",
    items: [
      {
        href: "/dashboard/admin/pensioners",
        label: "All Pensioners",
        icon: Users,
      },
      {
        href: "/dashboard/admin/pensioners/new",
        label: "Register New",
        icon: UserPlus,
      },
      {
        href: "/dashboard/admin/verify",
        label: "Verify",
        icon: CheckCircle,
      },
      {
        href: "/dashboard/admin/corrections",
        label: "Data Corrections",
        icon: UserCog,
      },
      {
        href: "/dashboard/admin/deaths",
        label: "Deaths & Dormancy",
        icon: Skull,
      },
    ],
  },
  {
    section: "Reports",
    items: [
      {
        href: "/dashboard/admin/reports",
        label: "Monthly Reports",
        icon: BarChart3,
      },
      { href: "/dashboard/admin/audit", label: "Audit Logs", icon: ScrollText },
    ],
  },
  {
    section: "Admin",
    items: [
      {
        href: "/dashboard/admin/users",
        label: "User Accounts",
        icon: KeyRound,
      },
    ],
  },
];

const pensionerNav = [
  {
    section: "My Account",
    items: [
      {
        href: "/dashboard/portal",
        label: "My Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/portal/verify",
        label: "Verify Liveness",
        icon: CheckCircle,
      },
      {
        href: "/dashboard/portal/documents",
        label: "My Documents",
        icon: FileText,
      },
      {
        href: "/dashboard/portal/edit",
        label: "Edit Profile",
        icon: UserCog,
      },
    ],
  },
];

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

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") ?? "U";

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      {/* Brand */}
      <div className='px-4 py-4 border-b border-white/8 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-[#c8960c]/20 border border-[#c8960c]/30 flex items-center justify-center shrink-0'>
            <ShieldCheck className='w-4 h-4 text-[#c8960c]' />
          </div>
          <div className='min-w-0'>
            <p className='text-white text-[11px] font-bold leading-tight tracking-wide'>
              BPMLVS
            </p>
            <p className='text-white/30 text-[8px] uppercase tracking-[1px] truncate'>
              {role === "pensioner" ? "Pensioner Portal" : "Admin Console"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex-1 overflow-y-auto py-2 px-2'>
        {nav.map(({ section, items }) => (
          <div key={section} className='mb-1'>
            <p className='px-2.5 pt-3 pb-1 text-[8.5px] text-white/20 font-bold uppercase tracking-[1.8px]'>
              {section}
            </p>
            {items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onLinkClick}
                  className={`
                    group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11.5px] font-medium
                    transition-all duration-150 mb-0.5
                    ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/45 hover:bg-white/6 hover:text-white/80"
                    }
                  `}>
                  <div
                    className={`
                    w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all
                    ${
                      active
                        ? "bg-[#c8960c] text-white"
                        : "bg-white/6 text-white/30 group-hover:bg-white/10 group-hover:text-white/60"
                    }
                  `}>
                    <Icon className='w-3 h-3' />
                  </div>
                  {label}
                  {active && (
                    <div className='ml-auto w-1 h-1 rounded-full bg-[#c8960c]' />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className='px-3 py-3 border-t border-white/8 shrink-0'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-lg bg-[#c8960c]/20 border border-[#c8960c]/25 flex items-center justify-center shrink-0'>
            <span className='text-[9px] font-bold text-[#c8960c]'>
              {initials}
            </span>
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-white text-[11px] font-semibold truncate leading-tight'>
              {user?.fullName ?? "Loading…"}
            </p>
            <p className='text-white/30 text-[8.5px] uppercase tracking-[0.7px]'>
              {role === "pensioner" ? "Pensioner" : "Administrator"}
            </p>
          </div>
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
      {/* Desktop */}
      <aside className='hidden md:flex fixed top-12 left-0 w-56 bg-[#003311] flex-col shrink-0 overflow-hidden h-[calc(100vh-3rem)] border-r border-white/6'>
        <NavContent role={role} />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side='left'
          className='w-56 p-0 bg-[#003311] border-r border-white/8'>
          <VisuallyHidden>
            <DialogTitle>Sidebar Menu</DialogTitle>
            <DialogDescription>Navigation menu</DialogDescription>
          </VisuallyHidden>
          <SheetClose className='absolute right-3 top-3 z-10 flex items-center justify-center w-6 h-6 rounded-md bg-white/8 text-white/40 hover:text-white transition-colors'>
            <X size={12} />
          </SheetClose>
          <NavContent role={role} onLinkClick={() => onOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
