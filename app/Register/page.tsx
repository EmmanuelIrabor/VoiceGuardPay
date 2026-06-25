"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/images/logo.svg";
import Image from "next/image";
import { User, Mail, Lock, ShieldCheck, Info, MoveRight } from "lucide-react";
import AuthInput from "@/components/ui/AuthInput";
import Link from "next/link";
import { notify } from "@/lib/stores/notifyStore";
import { registerUser } from "@/lib/api/auth";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      notify.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      notify.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      notify.success("Account created successfully.");
      router.push("/Login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      notify.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
              <AuthInput
                label="EMAIL"
                icon={Mail}
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-center gap-5 mt-4">
              <AuthInput
                label="PASSWORD"
                icon={Lock}
                type="password"
                placeholder="Enter your Password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
              <AuthInput
                label="CONFIRM PASSWORD"
                icon={ShieldCheck}
                type="password"
                placeholder="Confirm your Password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mt-5 bg-primary-100 flex gap-3 items-start p-3 rounded-md">
              <Info size={20} className="text-primary-500" />
              <p className="text-xs font-jetbrains mt-0 p-0 m-0">
                By registering, you agree to the VoiceGuard Biometric Privacy Protocol.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="btn-primary w-full mt-5 rounded-md flex items-center justify-center gap-1 disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Register"}
                <MoveRight size={20} className="font-bold" />
              </button>
            </div>

            <div className="flex items-center justify-center">
              <Link href="/Login" className="text-xs hover:underline mt-5 text-center">
                Already have an account? <span className="text-primary-500">Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}