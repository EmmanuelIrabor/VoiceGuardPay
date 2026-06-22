

import Link from "next/link";
import Image from "next/image";

export default function NavBar(){

    return (
    <>
    <div className="navbar flex justify-between items-center py-5 px-5 xl:px-20">

        <div className="flex flex-row items-center gap-1">

            <div>
        <Link href="/">
          <Image src="/images/logo.svg" alt="logo" width={20} height={20} />
        </Link>
            </div>

            <div>
                <p className="font-bold text-lg font-geist text-primary-500">VoiceGuardPay</p>
            </div>


        </div>

    

        <div>

        {/* <p className="text-sm text-neutral-800 font-jetbrains">Active</p> */}
         <div className="loader-x"></div>


        </div>
    </div>
    <hr className=" text-neutral-600"/>
    </>
    
    )
}