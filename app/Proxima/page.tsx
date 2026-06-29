
"use client";
import NavBar from "@/components/NavBar";
import { Radar , ChevronLeft , } from "lucide-react";
import { CirclesThreePlus } from "phosphor-react";
import Link from "next/link";
import FoundDevice from "@/components/FoundDevices";
import { Store, User, Coffee, Smartphone, Briefcase } from "lucide-react";

const DISCOVERED_PROFILES = [
  {
    icon: Store,
    title: "Mama Nkechi's Stall",
    subtitle: "Food Vendor • Verified Merchant",
    ms: 42,
  },
  {
    icon: User,
    title: "Tunde Adebayo",
    subtitle: "Individual Account",
    ms: 58,
  },
  {
    icon: Coffee,
    title: "Brew & Bean Café",
    subtitle: "Registered Business",
    ms: 35,
  },
  {
    icon: User,
    title: "Chiamaka Okafor",
    subtitle: "Individual Account",
    ms: 71,
  },
  {
    icon: Briefcase,
    title: "Lagos Tech Hub Kiosk",
    subtitle: "Verified Merchant Terminal",
    ms: 49,
  },
];

export default function Proxima (){

    return(

        <>

        <NavBar/>

        <div className="px-5 xl:px-20">

             <div className="flex items-center gap-1 mt-5">
                      <Link href="../Home/">
                        <ChevronLeft size={15} className="text-primary-500 font-bold" />
                      </Link>
            
                      <div className="bg-primary-100 w-25 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
                        <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
                        Proxima
                      </div>
                    </div>
            
                    <div>
                      <h1 className="text-2xl font-medium mt-2 font-geist typing">
                        Proxima is Scanning
                      </h1>
                      <p className="text-xs text-neutral-800 mt-1">
                         Proxima finds nearby accounts and merchants so you can isssue hassle free payments
                      </p>
                    </div>

            <div className="mt-10 flex items-center justify-center">

                <div className="rounded-md p-5 w-30 h-20 flex justify-center items-center ">

                    {/* <Radar className="text-primary-500" size={50}/> */}
                    <div className="blob-scanner"></div>

                </div>

               


            </div>

             <p className="text-center font-bold font-jetbrains mt-15 text-xs">Proximity Detection</p>
             <p className="text-center text-xs text-neutral-600">Scanning for nearby beacons..</p>

             <div>
                <p className="font-bold font-jetbrains text-neutral-700 mt-15 text-xs"> DISCOVERED</p>
                    

                    <div className="flex flex-col gap-2 mt-2 mb-5">
    {DISCOVERED_PROFILES.map((profile, index) => (
      <FoundDevice
        key={index}
        icon={profile.icon}
        title={profile.title}
        subtitle={profile.subtitle}
        ms={profile.ms}
      />
    ))}
    </div>
    
             </div>

        </div>
        
        </>
    );
}