// app/(public)/layout.tsx
import NavPills from "@/components/layout/NavPills";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='h-screen overflow-y-auto'>
      <div className='fixed bottom-5 left-1/2 -translate-x-1/2 z-50'>
        <NavPills />
      </div>
      {children}
    </div>
  );
}
