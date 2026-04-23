import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

// Removed Geist — DM Sans is your app font now.
// Both fonts conflict if they share the same variable name,
// so each gets its own: --font-sans and --font-display.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans", // → Tailwind font-sans utility
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display", // → Tailwind font-display utility
  display: "swap",
});

export const metadata: Metadata = {
  title: "BPMLVS v2.0 — Biometric Pensioner Management",
  description:
    "Multi-Modal Biometric Pension Verification System — Federal Republic of Nigeria",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ cssLayerName: "clerk" }}>
      <html
        lang='en'
        suppressHydrationWarning
        className={`${dmSans.variable} ${playfair.variable}`}>
        {/* font-sans applies DM Sans to everything; antialiased for crispness */}
        <body className='font-sans antialiased'>
          <Toaster />
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
