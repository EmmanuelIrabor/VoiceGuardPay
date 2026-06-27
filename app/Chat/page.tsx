
"use client";
import Navbar from "@/components/NavBar";
import { Radar , ChevronLeft , MoveUpRight ,MessageSquare} from "lucide-react";
import { CirclesThreePlus  } from "phosphor-react";
import Link from "next/link";

export default function Chat (){
return (

    <>

    <Navbar/>

    <div className="px-5 xl:px-20">

          <div className="flex items-center gap-1 mt-5">
                      <Link href="../Home/">
                        <ChevronLeft size={15} className="text-primary-500 font-bold" />
                      </Link>
            
                      <div className="bg-primary-100 w-20 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
                        <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
                       Chat
                      </div>
                    </div>
            
                    <div>
                      <h1 className="text-2xl font-medium mt-2 font-geist">
                       Text a command or an instruction
                      </h1>
                      <p className="text-xs text-neutral-800 mt-1">
                        Intelligent Agent would carry out your instructions
                      </p>
                    </div>

                    <div className="chat-container mt-5">

                        <div className="agent-chat-bubble rounded-md bg-primary-500 text-white p-3  cursor-pointer typing text-xs">

                            Hello i'm louis , i'm here to help with your finances. How may i be of service ?



                        </div>

                        <div className="flex justify-end mt-5">

                            <div className="user-chat-bubble rounded-md bg-white text-black p-3  cursor-pointer text-xs">

                            Hello Louis kindly transfer 5,000 NGN to sarah



                        </div>

                        </div>

                    </div>

    <div className="flex flex-col md:flex-row mx-auto absolute bottom-0 left-0 right-0 px-5 xl:px-20 mb-5 overflow-hidden">
        <div className="flex-1">
    
      <div className="flex items-center bg-white gap-2 px-2 py-3 chat-input-link rounded-lg mt-5">
        <MessageSquare
          size={20}
          className="text-primary-500 font-extralight"
        />

        <input
          className="outline-none border-none text-xs l-input"
          type="text"
          placeholder="Type a Command"
        />
      </div>
    
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
    
    </>
);

}