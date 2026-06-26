
"use client";

import Link from "next/link";
import { CircleCheck ,ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function Success() {
  return (

    <>

    <NavBar/>
    <div className="flex flex-col justify-center items-center mt-30">
      
      <div className="flex items-center justify-center p-5 rounded-full ">
        <CircleCheck size={40} className="text-primary-500" />
      </div>

        <p className="font-jetbrains text-primary-500 text-xs mt-2 typing">Your speech pattern has been captured successfully</p>

        <Link className="btn-primary text-xs flex items-center mt-5 rounded-md" href={'/Home'}>Proceed <ChevronRight size={10} /></Link>

    
    </div>
    <Footer/>

    </>
  );
}