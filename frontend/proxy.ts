// middleware.ts
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
  // 👆 /onboarding removed from here
]);
const isHomeRoute = createRouteMatcher(["/"]);

const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isPortalRoute = createRouteMatcher(["/dashboard/portal(.*)"]);
const isDashboard = createRouteMatcher(["/dashboard"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();
  if (isHomeRoute(request))
    return NextResponse.redirect(new URL("/overview", request.url));

  const { userId, sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as UserRole | undefined;

  // 1. Unauthenticated — send to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  const isStaff = role === "admin" || role === "officer";
  const hasNin = !!sessionClaims?.unsafeMetadata?.nin;

  // 2. Onboarding route — let through always if authenticated
  if (isOnboardingRoute(request)) return NextResponse.next();

  // 3. Non-staff without NIN → force onboarding
  // if (!isStaff && !hasNin) {
  //   return NextResponse.redirect(new URL("/onboarding", request.url));
  // }

  // 4. Admin/Officer protection
  if (isAdminRoute(request) && !isStaff) {
    return NextResponse.redirect(new URL("/dashboard/portal", request.url));
  }
  if (isPortalRoute(request) && isStaff) {
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  }
  // 5. /dashboard → redirect to role-specific dashboard
  if (isDashboard(request)) {
    if (isStaff) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (role === "pensioner") {
      return NextResponse.redirect(new URL("/dashboard/portal", request.url));
    }
    // Authenticated but no role yet → onboarding or fallback
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // 5. Portal protection
  const allowedPortalRoles = ["pensioner", "admin", "officer"];
  if (isPortalRoute(request) && (!role || !allowedPortalRoles.includes(role))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
