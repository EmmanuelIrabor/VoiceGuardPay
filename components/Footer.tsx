
import Link from "next/link";

export default function Footer() {

    return (
        <>
         <hr className=" text-neutral-600 mt-10"/>
    <div className="mt-2 px-5 xl:px-20 pb-5 font-jetbrains text-xs text-neutral-900 flex justify-between items-center flex-wrap">
      <div>
        <p>© 2026 VOICEGUARDPAY. ALL RIGHTS RESERVED.</p>
      </div>

      <div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <Link href="/privacy" className="text-xs hover:underline">
            PRIVACY_PROTOCOL
          </Link>
          <Link href="/encryption" className="text-xs hover:underline">
            ENCRYPTION_STANDARDS
          </Link>
        </div>
      </div>
      
    </div>
        </>
    )
}