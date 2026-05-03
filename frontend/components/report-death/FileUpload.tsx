import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  hint?: string;
  id?: string;
}

/**
 * Click-to-upload file area. Passes the selected File object up via `onChange`.
 */
export function FileUpload({
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  hint = "PDF, JPG or PNG · Optional now",
  id = "file-upload",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role='button'
      tabIndex={0}
      aria-label='Upload file'
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",
        file
          ? "border-[#004d19]/40 bg-green-50/40"
          : "border-[#001407]/15 hover:border-[#001407]/30",
      )}>
      <input
        ref={inputRef}
        id={id}
        type='file'
        accept={accept}
        className='hidden'
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className='space-y-1'>
          <FileText className='w-6 h-6 text-[#004d19] mx-auto' />
          <p className='text-[12px] font-medium text-[#0c190c]'>{file.name}</p>
          <p className='text-[10px] text-[#001407]/40'>
            {(file.size / 1024).toFixed(0)} KB · Click to change
          </p>
        </div>
      ) : (
        <div className='space-y-1'>
          <FileText className='w-6 h-6 text-[#001407]/25 mx-auto' />
          <p className='text-[12px] text-[#001407]/50'>
            Click to upload death certificate
          </p>
          <p className='text-[10px] text-[#001407]/30'>{hint}</p>
        </div>
      )}
    </div>
  );
}
