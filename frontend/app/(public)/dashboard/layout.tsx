"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/Topbar";
import { UserRole } from "@/types/global";
import { useConvexUser } from "@/lib/useConvexUser"; // ← add this

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const { pensionerId, isLoaded: convexLoaded } = useConvexUser(); // ← add this
  const router = useRouter();

  const role = (user?.publicMetadata?.role ?? "officer") as UserRole;
  const isStaff = role === "admin" || role === "officer";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !convexLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (!isStaff && !pensionerId) router.replace("/onboarding");
  }, [isLoaded, convexLoaded, user, isStaff, pensionerId, router]);

  // Wait for both Clerk AND Convex to load before deciding
  if (!isLoaded || !convexLoaded || !user) return null;
  if (!isStaff && !pensionerId) return null;

  return (
    <div className='flex flex-col bg-background'>
      <TopBar role={role} onMenuClick={() => setSidebarOpen(true)} />
      <div className='flex flex-1'>
        <Sidebar role={role} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className='md:ml-64 mt-12 flex-1 p-4 md:p-6 space-y-5 min-w-0 md:pb-24 pb-12'>
          {children}
        </main>
      </div>
    </div>
  );
}
