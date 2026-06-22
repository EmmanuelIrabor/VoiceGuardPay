"use client"
import NavBar from "@/components/NavBar";
import { CirclesThreePlus , Translate } from "phosphor-react";
import LanguageCard from "@/components/ui/LanguageCard";

export default function Home() {
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

  <LanguageCard id="001 / YO" language="Yoruba" region="WEST AFRICA / NIGERIA" />
  <LanguageCard id="002 / IG" language="Igbo" region="WEST AFRICA / NIGERIA" />
  <LanguageCard id="003 / HA" language="Hausa" region="WEST AFRICA / NIGERIA" />
  <LanguageCard id="004 / EN" language="English" region="GLOBAL / DEFAULT" />
  <LanguageCard id="005 / CH" language="Chinese" region="EAST ASIA / CHINA" />
  <LanguageCard id="006 / DE" language="German" region="WESTERN EUROPE / GERMANY" />
  <LanguageCard id="007 / FR" language="French" region="WESTERN EUROPE / FRANCE" />

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
 <p className="font-jetbrains text-xs text-primary-700 mt-1">Don't see your language? Kindly reach out to our support team.</p>
 

    </div>
    <hr className=" text-neutral-600 mt-10"/>
    <div className="mt-2 px-5 xl:px-20 font-jetbrains text-xs text-neutral-900 flex justify-between items-center flex-wrap">
      <div>
        <p>© 2026 VOICEGUARDPAY. ALL RIGHTS RESERVED.</p>
      </div>

      <div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <p className="text-xs">PRIVACY_PROTOCOL</p>
          <p className="text-xs">ENCRYPTION_STANDARDS</p>
          </div>
      </div>
      
    </div>
    </>
  )
  
}
