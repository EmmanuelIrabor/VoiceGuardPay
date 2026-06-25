import { LucideIcon } from "lucide-react";
import { ChangeEvent } from "react";

interface AuthInputProps {
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  id?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function AuthInput({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  id,
  value,
  onChange,
}: AuthInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="input-wrapper">
      <label htmlFor={inputId} className="text-xs font-jetbrains">
        {label}
      </label>

      <div className="input-container bg-primary-50 border border-neutral-600 rounded-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 mt-1">
        <Icon size={10} />
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-none focus:outline-none focus:bg-none text-xs w-full"
        />
      </div>
    </div>
  );
}