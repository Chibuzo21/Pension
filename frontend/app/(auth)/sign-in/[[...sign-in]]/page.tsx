import { SignIn } from "@clerk/nextjs";
import { LeftPanel } from "@/components/auth/LeftPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";

const clerkAppearance = {
  elements: {
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "border border-[#dce8dc] rounded-[9px] text-sm font-medium",
    formFieldInput:
      "border-[1.5px] border-[#dce8dc] rounded-[9px] text-sm transition-colors focus:border-[#004d19] focus:ring-2 focus:ring-[#004d19]/10",
    formButtonPrimary:
      "bg-[#004d19] hover:bg-[#003311] text-white rounded-[9px] text-sm font-semibold tracking-wide transition-all hover:-translate-y-px",
    footerActionLink: "text-[#c8960c] hover:text-[#e6ad0e] font-semibold",
  },
};

export default function SignInPage() {
  return (
    <AuthShell>
      <AuthCard
        badge='Secure Access'
        title='Sign in to BPMLVS'
        subtitle='Enter your authorised credentials to continue.'>
        <SignIn appearance={clerkAppearance} />
      </AuthCard>
    </AuthShell>
  );
}
