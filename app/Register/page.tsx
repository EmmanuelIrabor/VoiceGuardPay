"use client";
import logo from "@/public/images/logo.svg";
import Image from "next/image";
import { User, Mail, Lock , ShieldCheck, Info , MoveRight } from "lucide-react";
import AuthInput from "@/components/ui/AuthInput";
import Link from "next/link";

export default function Register(){
    return (

        <>
        <div className="px-5 xl:px-20 mt-5 flex items-center justify-center">

            <div className="bg-white w-96 px-5 py-5 rounded-md shadow-md">
         
         <div className="flex items-center justify-center gap-1">
               <Image src={logo} alt="Voice Guard Pay" className="xl:w-5 xl:h-5 w-5 h-5" />
                <p className="text-primary-500 font-semibold text-md">Voice Guard Pay</p>

         </div>

         <h2 className="font-semibold font-geist text-2xl mt-10">
            Create Account
         </h2>
         <p className="text-xs text-neutral-950 mt-1">
            Secure your biometric identity with enterprise grade Encryption
         </p>

         <div className="mt-5">


      

         <div className="flex flex-col gap-4">
      <AuthInput
        label="FULL NAME"
        icon={User}
        placeholder="Enter your Full Name"
      />
      <AuthInput
        label="EMAIL"
        icon={Mail}
        type="email"
        placeholder="Enter your Email"
      />
     
    </div>

    <div className="flex items-center justify-center gap-5 mt-4">
         <AuthInput
        label="PASSWORD"
        icon={Lock}
        type="password"
        placeholder="Enter your Password"
      />
       <AuthInput
        label="CONFIRM PASSWORD"
        icon={ShieldCheck}
        type="password"
        placeholder="Confirm your Password"
      />
    </div>

    <div className="mt-5 bg-primary-100 flex gap-3 items-start p-3 rounded-md">

        <Info size={20} className="text-primary-500" />
        <p className="text-xs font-jetbrains mt-0 p-0 m-0 ">By registering, you agree to the VoiceGuard Biometric Privacy Protocol.</p>

    </div>
 

    <div className="mt-5 flex items-center justify-center">
        <button className="btn-primary w-full mt-5 rounded-md flex items-center justify-center gap-1">Register  <MoveRight size={20} className="font-bold"/></button>   
 
    </div>

    <div className="flex items-center justify-center">
         <Link href="Login" className="text-xs hover:underline mt-5 text-center">Already have an account? <span className="text-primary-500">Login</span></Link>
    </div>

           
                
            </div>

            </div>



        </div>
        </>
    );
}