"use client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import {ArrowLeft , Mic} from "lucide-react"
import { CirclesThreePlus } from "phosphor-react";

export default function VoiceBiometrics(){

    return (

        <>

        <NavBar/>

         <div className="px-5 xl:px-20 mt-10">

       <div className="bg-primary-100 w-30 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
        <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
          Step 02
      </div>

       <div>
        <h1 className="text-2xl font-medium mt-2 font-geist typing">Kindly provide a voice sample.</h1>
        <p className="text-xs text-neutral-800 mt-1">Repeat the statements below to create your voice sample.</p>
      </div>

       <div className="flex flex-col justify-center items-center mt-10 gap-8">
          <Mic size={80} className="text-primary-500 font-light" />
       </div>

       <div className="flex flex-col justify-center items-center mt-10">
        <div className="loading-wave">
  <div className="obj"></div>
  <div className="obj"></div>
  <div className="obj"></div>
  <div className="obj"></div>
  <div className="obj"></div>
  <div className="obj"></div>
  <div className="obj"></div>
  <div className="obj"></div>
</div>
       </div>

       <div>
         <p className="text-xs text-center font-jetbrains text-neutral-800 mt-10">Sample 1 : The cat jumps over the fence</p>
       </div>

       <div className="flex flex-col justify-center items-center mt-10">
        <button className="btn-primary text-md rounded-md">Hold to record sample</button>
       </div>




         </div>
         <Footer/>
        
        </>
    );
}