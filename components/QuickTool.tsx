import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickToolProps {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export default function QuickTool({ href, label, icon: Icon, color }: QuickToolProps) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 min-w-[68px] shrink-0">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${color}`}>
        <Icon size={24} className="text-white" strokeWidth={2} />
      </div>
      <span className="text-[11px] font-medium text-gray-600 text-center leading-tight max-w-[72px]">
        {label}
      </span>
    </Link>
  );
}
