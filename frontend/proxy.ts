import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "./types/global";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/overview",
  "/roi",
  "/crisis",
  "/partner",
  "/api/clerk-webhook(.*)",
  "/api/onboarding/(.*)",
]);

const isHomeRoute = createRouteMatcher(["/"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isPortalRoute = createRouteMatcher(["/dashboard/portal(.*)"]);
const isDashboardRoot = createRouteMatcher(["/dashboard"]);

export default clerkMiddleware(async (auth, request) => {
  // 1. Home → overview
  if (isHomeRoute(request))
    return NextResponse.redirect(new URL("/overview", request.url));

  // 2. Public routes — no auth needed
  if (isPublicRoute(request)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as UserRole | undefined;
  const isStaff = role === "admin" || role === "officer";
  const isPensioner = role === "pensioner";

  // 3. Unauthenticated → sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 4. Onboarding gate
  if (isOnboardingRoute(request)) {
    // Staff should never be on onboarding
    if (isStaff)
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    // Pensioners who've been linked (have a role) are done with onboarding
    if (isPensioner)
      return NextResponse.redirect(new URL("/dashboard/portal", request.url));
    // No role yet → let them through to complete onboarding
    return NextResponse.next();
  }

  // 5. Force unlinked users (no role) to onboarding
  if (!role) return NextResponse.redirect(new URL("/onboarding", request.url));

  // 6. /dashboard root → role-based redirect
  if (isDashboardRoot(request)) {
    if (isStaff)
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    if (isPensioner)
      return NextResponse.redirect(new URL("/dashboard/portal", request.url));
  }

  // 7. Cross-role protection
  if (isAdminRoute(request) && !isStaff)
    return NextResponse.redirect(new URL("/dashboard/portal", request.url));
  if (isPortalRoute(request) && !isPensioner)
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
