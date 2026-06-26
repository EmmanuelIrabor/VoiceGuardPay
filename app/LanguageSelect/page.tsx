"use client"
import NavBar from "@/components/NavBar";
import { CirclesThreePlus , Translate } from "phosphor-react";
import LanguageCard from "@/components/ui/LanguageCard";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import { notify } from "@/lib/stores/notifyStore";

const LANGUAGE_CODE_MAP: Record<string, string> = {
  "001 / YO": "yo",
  "002 / IG": "ig",
  "003 / HA": "ha",
  "004 / EN": "en",
  "005 / CH": "zh-Hans",
  "006 / DE": "de",
  "007 / FR": "fr",
};

export default function LanguageSelect() {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  const { setLanguage } = useLanguage();
  const router = useRouter();

  const handleSelect = (id: string) => {
    setSelectedLanguageId(id);
    setLanguage(LANGUAGE_CODE_MAP[id] ?? "en");
  };

  const handleConfirm = () => {
    if (!selectedLanguageId) {
      notify.error("Please select a language to continue.");
      return;
    }
    notify.success("Language selected.");
    router.push("/VoiceBiometrics");
  };

  return (
    <>
      <NavBar />
    

    <div className="px-5 xl:px-20 mt-10">
      <div className="bg-primary-100 w-30 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
        <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
          Step 01
      </div>


      <div>
        <h1 className="text-2xl font-medium mt-2 font-geist typing">Hello kindly select your lanaguage of choice.</h1>
        <p className="text-xs text-neutral-800 mt-1">The system will calibrate its voice recognition algorithms based on your selection to ensure compatibility and  precision.</p>
      </div>

 <div className="grid grid-cols-2 lg:flex lg:flex-row lg:items-center lg:flex-wrap gap-5 mt-5">
      <LanguageCard
        id="001 / YO"
        language="Yoruba"
        region="WEST AFRICA / NIGERIA"
        isSelected={selectedLanguageId === "001 / YO"}
        onSelect={handleSelect}
      />
      <LanguageCard
        id="002 / IG"
        language="Igbo"
        region="WEST AFRICA / NIGERIA"
        isSelected={selectedLanguageId === "002 / IG"}
        onSelect={handleSelect}
      />
      <LanguageCard
        id="003 / HA"
        language="Hausa"
        region="WEST AFRICA / NIGERIA"
        isSelected={selectedLanguageId === "003 / HA"}
        onSelect={handleSelect}
      />
      <LanguageCard
        id="004 / EN"
        language="English"
        region="GLOBAL / DEFAULT"
        isSelected={selectedLanguageId === "004 / EN"}
        onSelect={handleSelect}
      />
      <LanguageCard
        id="005 / CH"
        language="Chinese"
        region="EAST ASIA / CHINA"
        isSelected={selectedLanguageId === "005 / CH"}
        onSelect={handleSelect}
      />
      <LanguageCard
        id="006 / DE"
        language="German"
        region="WESTERN EUROPE / GERMANY"
        isSelected={selectedLanguageId === "006 / DE"}
        onSelect={handleSelect}
      />
      <LanguageCard
        id="007 / FR"
        language="French"
        region="WESTERN EUROPE / FRANCE"
        isSelected={selectedLanguageId === "007 / FR"}
        onSelect={handleSelect}
      />
    </div>

 <hr className=" text-neutral-600 mt-10"/>

 <div className="mt-5 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="loader-s"></span>
  <p className="font-jetbrains text-xs text-neutral-900">
    {selectedLanguageId ? "LANGUAGE SELECTED" : "AWAITING SELECTION..."}
  </p>
  </div>

  <div>
    <button onClick={handleConfirm} className="btn-dark text-xs">CONFIRM SELECTION</button>
  </div>
 </div>
 <p className="font-jetbrains text-xs text-primary-700 mt-2">Don't see your language? Kindly reach out to our support team.</p>
 

    </div>
   <Footer/>
    </>
  )
  
}
