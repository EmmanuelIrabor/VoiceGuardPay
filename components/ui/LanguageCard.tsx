
"use client";
import {Translate } from "phosphor-react";

type LanguageCardProps = {
  id: string;
  language: string;
  region:string;
};
export default function Langaugecard ({
  id,
  language,
  region
}: LanguageCardProps) {

    return (

        <div className="language-card  px-5 py-5">

          <div className="flex md:gap-30 items-center justify-between">
             <div>
              <p className="text-xs font-jetbrains text-neutral-900">{id}</p>
             </div>
             <div>
              <Translate size={15} className="text-neutral-900"  />
             </div>
            
          </div>

          <p className="text-md font-medium mt-10 font-geist">
            {language}
          </p>
          <p className="text-xs text-neutral-800 mt-1">{region}</p>

        </div>
    )
}