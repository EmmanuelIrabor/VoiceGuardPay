import { LucideIcon, Signal } from "lucide-react";

type FoundDeviceProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  ms: number;
};

export default function FoundDevice({ icon: Icon, title, subtitle, ms }: FoundDeviceProps) {
  return (
    <div className="bg-white py-3 px-4 flex items-center justify-between cursor-pointer rounded-sm">
      <div className="flex items-center gap-4">
        <div className="flex justify-center p-2 bg-primary-100">
          <Icon size={15} className="text-primary-500" />
        </div>
        <div>
          <p className="text-xs font-jetbrains">{title}</p>
          <p className="text-xs font-light text-neutral-600">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col justify-end items-end">
        <Signal className="text-primary-500" size={15} />
        <p className="text-xs font-jetbrains text-neutral-900">+{ms}ms</p>
      </div>
    </div>
  );
}