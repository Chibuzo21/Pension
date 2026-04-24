"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/Topbar";
import { UserRole } from "@/types/global";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const role = (user?.publicMetadata?.role ?? "officer") as UserRole;
  const nin = user?.unsafeMetadata?.nin as string | undefined;
  const isStaff = role === "admin" || role === "officer";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (!isStaff && !nin) router.replace("/onboarding");
  }, [isLoaded, user, isStaff, nin, router]);

  if (!isLoaded || !user) return null;
  if (!isStaff && !nin) return null;

  return (
    // h-screen + flex-col: topbar takes its natural h-12, rest fills remaining
    <div className=' flex flex-col bg-background'>
      <TopBar role={role} onMenuClick={() => setSidebarOpen(true)} />

      {/* This row must be overflow-hidden so only <main> scrolls */}
      <div className='flex flex-1 '>
        {/* Desktop sidebar — full height of this row */}
        <Sidebar role={role} open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* Scrollable content area */}
        <main className='md:ml-64 mt-12 flex-1 p-4 md:p-6 space-y-5 min-w-0 md:pb-24 pb-12'>
          {children}
        </main>
      </div>
    </div>
  );
}
