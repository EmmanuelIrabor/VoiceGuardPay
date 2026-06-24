import Image from "next/image";
import HomeProgressBar from "@/components/ui/HomeProgressBar";
import logo from "@/public/images/logo.svg";

export default function SplashPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-8">
      <Image
        src={logo}
        alt="Duel Domain Logo"
        className="xl:w-20 xl:h-20 w-25 h-25"
      />

        <p className="text-primary-500 font-semibold">Voice Guard Pay</p>

      <HomeProgressBar />
    </div>
  );
}