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
  "/report-death",
  "/api/onboarding/(.*)", // covers advance-step too
]);

const isHomeRoute = createRouteMatcher(["/"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isPortalRoute = createRouteMatcher(["/dashboard/portal(.*)"]);
const isDashboardRoot = createRouteMatcher(["/dashboard"]);

// Individual onboarding step routes — used to enforce forward-only navigation
const isStepPersonal = createRouteMatcher(["/onboarding"]);
const isStepFace = createRouteMatcher(["/onboarding/face"]);
const isStepVoice = createRouteMatcher(["/onboarding/voice"]);
const isStepDocs = createRouteMatcher(["/onboarding/docs"]);

type OnboardingStep = "personal" | "face" | "voice" | "docs" | "complete";

const STEP_ORDER: OnboardingStep[] = [
  "personal",
  "face",
  "voice",
  "docs",
  "complete",
];

function stepToPath(step: OnboardingStep): string {
  switch (step) {
    case "personal":
      return "/onboarding";
    case "face":
      return "/onboarding/face";
    case "voice":
      return "/onboarding/voice";
    case "docs":
      return "/onboarding/docs";
    case "complete":
      return "/dashboard/portal";
  }
}

function requestedStep(request: Request): OnboardingStep | null {
  if (isStepPersonal(request as any)) return "personal";
  if (isStepFace(request as any)) return "face";
  if (isStepVoice(request as any)) return "voice";
  if (isStepDocs(request as any)) return "docs";
  return null;
}

export default clerkMiddleware(async (auth, request) => {
  // 1. Home → overview
  if (isHomeRoute(request))
    return NextResponse.redirect(new URL("/overview", request.url));

  // 2. Fully public — no auth check
  if (isPublicRoute(request)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as UserRole | undefined;
  const isStaff = role === "admin" || role === "officer";
  const isPensioner = role === "pensioner";

  // 3. Not signed in → sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // ── Onboarding routes ──────────────────────────────────────────────────
  if (isOnboardingRoute(request)) {
    // Staff never onboard as pensioners
    if (isStaff)
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));

    const savedStep =
      (sessionClaims?.metadata?.onboardingStep as OnboardingStep | undefined) ??
      "personal";

    // Fully onboarded pensioner → kick to portal
    if (savedStep === "complete")
      return NextResponse.redirect(new URL("/dashboard/portal", request.url));

    // Prevent jumping ahead — redirect to the saved step
    const reqStep = requestedStep(request);
    if (reqStep) {
      const savedIdx = STEP_ORDER.indexOf(savedStep);
      const reqIdx = STEP_ORDER.indexOf(reqStep);
      if (reqIdx > savedIdx)
        return NextResponse.redirect(
          new URL(stepToPath(savedStep), request.url),
        );
    }

    return NextResponse.next();
  }

  // ── Unregistered user (no role yet) → start onboarding ────────────────
  if (!role) return NextResponse.redirect(new URL("/onboarding", request.url));

  // ── /dashboard root → role redirect ───────────────────────────────────
  if (isDashboardRoot(request)) {
    if (isStaff)
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    if (isPensioner)
      return NextResponse.redirect(new URL("/dashboard/portal", request.url));
  }

  // ── Pensioner trying to reach portal before completing onboarding ──────
  if (isPensioner && isPortalRoute(request)) {
    const savedStep =
      (sessionClaims?.metadata?.onboardingStep as OnboardingStep | undefined) ??
      "personal";
    if (savedStep !== "complete")
      return NextResponse.redirect(new URL(stepToPath(savedStep), request.url));
  }

  // ── Cross-role protection ──────────────────────────────────────────────
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
