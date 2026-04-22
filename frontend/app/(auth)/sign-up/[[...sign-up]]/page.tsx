import { AuthCard } from "@/components/auth/AuthCard";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUp } from "@clerk/nextjs";

// Or if you moved them: import { AuthShell, AuthCard } from "@/components/auth/AuthShell";

const clerkAppearance = {
  elements: {
    card: "shadow-none bg-transparent",
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

export default function SignUpPage() {
  return (
    <AuthShell>
      <AuthCard
        badge='New Account'
        title='Request Access'
        subtitle='Submit your details for administrator verification.'>
        <SignUp appearance={clerkAppearance} />
      </AuthCard>
    </AuthShell>
  );
}
