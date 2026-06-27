"use client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Wallet , Mic , MessageSquare , Radar, MoveUpRight } from "lucide-react";
import Link from "next/link";

export default function Home (){

    return (

        <>

        <NavBar/>

        <div className="px-5 xl:px-20">

            <div className="balance-card--wrapper xl:px-30">
                <div className="balance-card bg-primary-500 mt-5 px-5 py-10 rounded-md cursor-pointer ">

                <div className="flex flex-row items-center justify-between">

                    <div className="">

                        <p className="text-xs text-neutral-400">Welcome Back</p>

                        <p className="text-xl text-white font-bold">NGN 100,000 <span className="text-xs text-light text-neutral-500">Available</span></p>

                    </div>

                    <div className="">

                        <Wallet size={40} className="text-white"/>

                    </div>

                    
                </div>
            </div>
            </div>

            <div className="mt-10 flex items-center justify-center">

                <div className="flex items-center justify-center p-10 rounded-md">

                     <div className="loading-wave">
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
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

            </div>

            <div>
                 <p className="text-center font-jetbrains text-neutral-800 text-xs">Listening ..</p>

                 <p className="text-center mt-1">"Pay 10,000 NGN to Sarah"</p>
            </div>


           <div className="flex justify-end mb-4 mt-20 md:mt-30 lg:mt-0 xl:mt-0 ">
  <Link href={'/Proxima'} className="w-14 h-14 rounded-full bg-primary-500 text-white shadow-xl hover:scale-105 transition flex items-center justify-center">
    <Radar size={24} />
  </Link>
</div>



            <div className="xl:px-30 mt-10 chat absolute bottom-6 left-0 right-0 px-6 ">

                <p className="font-bold text-xs font-gaust">Text Command</p>
                <p className="text-neutral-600 text-xs mt-2">intelligent agent ready</p>

                <div className="flex flex-col md:flex-row">
        <div className="flex-1">
    <Link href="/ChatTransaction">
      <div className="flex items-center bg-white gap-2 px-2 py-3 chat-input-link rounded-lg mt-5">
        <MessageSquare
          size={20}
          className="text-primary-500 font-extralight"
        />

        <input
          className="pointer-events-none outline-none border-none text-xs l-input"
          type="text"
          placeholder="Type a Command"
        />
      </div>
    </Link>
  </div>

  <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-5 md:ml-4">
    <div className="bg-primary-400 p-2 text-xs rounded-md text-white cursor-pointer">
      Balance Check
    </div>

    <div className="bg-primary-400 p-2 text-xs rounded-md text-white cursor-pointer">
      History
    </div>

    <div className="bg-primary-400 p-2 text-xs rounded-md text-white cursor-pointer flex items-center">
      Transfer <MoveUpRight size={10}/>
    </div>
  </div>
</div>



            </div>

        </div>
        
        </>
    );
}