"use client"
import NavBar from "@/components/NavBar";
import { CirclesThreePlus , Translate } from "phosphor-react";
import LanguageCard from "@/components/ui/LanguageCard";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function Home() {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  return (
    <>
      <NavBar />
    

    <div className="px-5 xl:px-20 mt-10">
      <div className="bg-primary-100 w-30 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
        <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
          Step 01
      </div>


      <div>
        <h1 className="text-2xl font-medium mt-2 font-geist">Hello kindly select your lanaguage of choice.</h1>
        <p className="text-xs text-neutral-800 mt-1">The system will calibrate its voice recognition algorithms based on your selection to ensure compatibility and  precision.</p>
      </div>

 <div className="grid grid-cols-2 lg:flex lg:flex-row lg:items-center lg:flex-wrap gap-5 mt-5">
      <LanguageCard
        id="001 / YO"
        language="Yoruba"
        region="WEST AFRICA / NIGERIA"
        isSelected={selectedLanguageId === "001 / YO"}
        onSelect={setSelectedLanguageId}
      />
      <LanguageCard
        id="002 / IG"
        language="Igbo"
        region="WEST AFRICA / NIGERIA"
        isSelected={selectedLanguageId === "002 / IG"}
        onSelect={setSelectedLanguageId}
      />
      <LanguageCard
        id="003 / HA"
        language="Hausa"
        region="WEST AFRICA / NIGERIA"
        isSelected={selectedLanguageId === "003 / HA"}
        onSelect={setSelectedLanguageId}
      />
      <LanguageCard
        id="004 / EN"
        language="English"
        region="GLOBAL / DEFAULT"
        isSelected={selectedLanguageId === "004 / EN"}
        onSelect={setSelectedLanguageId}
      />
      <LanguageCard
        id="005 / CH"
        language="Chinese"
        region="EAST ASIA / CHINA"
        isSelected={selectedLanguageId === "005 / CH"}
        onSelect={setSelectedLanguageId}
      />
      <LanguageCard
        id="006 / DE"
        language="German"
        region="WESTERN EUROPE / GERMANY"
        isSelected={selectedLanguageId === "006 / DE"}
        onSelect={setSelectedLanguageId}
      />
      <LanguageCard
        id="007 / FR"
        language="French"
        region="WESTERN EUROPE / FRANCE"
        isSelected={selectedLanguageId === "007 / FR"}
        onSelect={setSelectedLanguageId}
      />
    </div>

 <hr className=" text-neutral-600 mt-10"/>

 <div className="mt-5 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="loader-s"></span>
  <p className="font-jetbrains text-xs text-neutral-900">AWAITING SELECTION...</p>
  </div>

  <div>
    <button className="btn-dark text-xs">CONFIRM SELECTION</button>
  </div>
 </div>
 <p className="font-jetbrains text-xs text-primary-700 mt-2">Don't see your language? Kindly reach out to our support team.</p>
 

    </div>
   <Footer/>
    </>
  )
  
}
