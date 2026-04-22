import { Globe, Mail, MapPin, Phone } from "lucide-react";

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}
const CONTACT_ITEMS: ContactItem[] = [
  {
    icon: <Mail size={13} />,
    label: "Email",
    value: "partnerships@bpmlvs.gov.ng",
  },
  { icon: <Phone size={13} />, label: "Phone", value: "+234 (0) 812 345 6789" },
  { icon: <Globe size={13} />, label: "Web", value: "www.bpmlvs.gov.ng" },
  {
    icon: <MapPin size={13} />,
    label: "Location",
    value: "Abuja, FCT · Nigeria",
  },
];
export function ContactBar() {
  return (
    <div className='flex items-center gap-5 bg-white/5 border border-white/9 rounded-xl px-5 py-3 flex-wrap justify-center max-w-2xl'>
      {CONTACT_ITEMS.map((item) => (
        <div key={item.label} className='flex items-center gap-2 text-[11.5px]'>
          <span className='text-white/40'>{item.icon}</span>
          <span className='text-white font-semibold'>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
