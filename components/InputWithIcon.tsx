import { LucideIcon } from "lucide-react";

interface InputWithIconProps {
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  className?: string;
}

export default function InputWithIcon({
  icon: Icon,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  minLength,
  className = "",
}: InputWithIconProps) {
  return (
    <div className="relative">
      <Icon
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary"
        aria-hidden
      />
      <input
        className={`input-field input-field-icon ${className}`}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
