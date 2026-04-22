"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";

export function useConvexUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const upsert = useMutation(api.users.upsertFromClerk);

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkLoaded && clerkUser?.id ? { clerkId: clerkUser.id } : "skip",
  );

  // Fallback: if Clerk webhook hasn't created the Convex user yet, upsert now.
  // undefined = query still loading; null = query ran but found no document → upsert.
  useEffect(() => {
    if (!clerkLoaded || !clerkUser) return;
    if (convexUser === undefined) return; // still loading, wait
    if (convexUser !== null) return; // record exists, skip upsert

    const email = clerkUser.primaryEmailAddress?.emailAddress ?? "";
    const username =
      (clerkUser.username ??
        `${clerkUser.firstName ?? ""}${clerkUser.lastName ?? ""}`.toLowerCase()) ||
      email.split("@")[0];

    const role = (
      clerkUser.publicMetadata as { role?: "admin" | "officer" | "pensioner" }
    )?.role;

    upsert({ clerkId: clerkUser.id, email, username, role }).catch(() => {});
  }, [clerkLoaded, clerkUser, convexUser, upsert]);

  // Derive role: prefer Convex DB value, fall back to Clerk public metadata
  const role =
    convexUser?.role ??
    ((clerkUser?.publicMetadata as { role?: string })?.role as
      | "admin"
      | "officer"
      | "pensioner"
      | undefined) ??
    null;

  const isAdmin = role === "admin";
  const isOfficer = role === "admin" || role === "officer";
  const isPensioner = role === "pensioner";

  return {
    convexUserId: (convexUser?._id ?? null) as Id<"users"> | null,
    convexUser: convexUser ?? null,
    clerkUser,
    pensionerId: (convexUser?.pensionerId ?? null) as Id<"pensioners"> | null,
    role,
    isLoaded: clerkLoaded && convexUser !== undefined,
    isAdmin,
    isOfficer,
    isPensioner,
  };
}
