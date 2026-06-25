"use client";
import { Translate, CheckCircle } from "phosphor-react";

type LanguageCardProps = {
  id: string;
  language: string;
  region: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export default function LanguageCard({
  id,
  language,
  region,
  isSelected,
  onSelect,
}: LanguageCardProps) {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`language-card px-5 py-5 cursor-pointer transition-colors ${
        isSelected ? "bg-primary-500" : ""
      }`}
    >
      <div className="flex md:gap-30 items-center justify-between">
        <div>
          <p className={`text-xs font-jetbrains ${isSelected ? "text-white" : "text-neutral-900"}`}>
            {id}
          </p>
        </div>
        <div>
          {isSelected ? (
            <CheckCircle size={15} className="text-white" weight="fill" />
          ) : (
            <Translate size={15} className="text-neutral-900" />
          )}
        </div>
      </div>

      <p className={`text-md font-medium mt-10 font-geist ${isSelected ? "text-white" : ""}`}>
        {language}
      </p>
      <p className={`text-xs mt-1 ${isSelected ? "text-white" : "text-neutral-800"}`}>
        {region}
      </p>
    </div>
  );
}