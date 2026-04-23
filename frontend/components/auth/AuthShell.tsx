import { LeftPanel } from "./LeftPanel";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex bg-[#001407]'>
      <LeftPanel />
      <div className='flex-1 relative flex flex-col items-center justify-center bg-[#f6f9f6] px-5 md:px-10 py-12'>
        {/* Top gradient rule tying both panels */}
        <div
          className='absolute top-0 left-0 right-0 h-0.75'
          style={{
            background: "linear-gradient(90deg, #004d19, #c8960c, transparent)",
          }}
        />
        {children}
      </div>
    </div>
  );
}
