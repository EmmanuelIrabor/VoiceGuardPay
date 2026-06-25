"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/images/logo.svg";
import Image from "next/image";
import { Mail, Lock, MoveRight, Fingerprint, ScanFace } from "lucide-react";
import AuthInput from "@/components/ui/AuthInput";
import Link from "next/link";
import { notify } from "@/lib/stores/notifyStore";
import { loginUser } from "@/lib/api/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      notify.error("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser({ email, password });
      localStorage.setItem("token", result.access_token);
      // notify.success("Logged in successfully.");
      router.push("/LanguageSelect");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials, please try again.";
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

          <h2 className="font-semibold font-geist text-2xl mt-10 text-center">
            Welcome Back
          </h2>
          <p className="text-xs text-neutral-950 mt-1 text-center">
            Enter your credentials to access your account.
          </p>

          <div className="mt-5">
            <div className="flex flex-col gap-4">
              <AuthInput
                label="EMAIL"
                icon={Mail}
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
              <AuthInput
                label="PASSWORD"
                icon={Lock}
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </div>

            <div className="text-xs flex justify-end text-primary-600 mt-3">
              <Link href="/ForgotPassword" className="hover:underline">
                Forgot your password?
              </Link>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className="btn-primary w-full mt-5 rounded-md flex items-center justify-center gap-1 disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Login"}
                <MoveRight size={20} className="font-bold" />
              </button>
            </div>

            <p className="text-xs font-jetbrains mt-5 text-neutral-900 text-center">
              OR AUTHENTICATE WITH
            </p>

            <div className="mt-5 flex items-center justify-center gap-5">
              <button className="btn-outlined text-xs rounded-md flex items-center justify-center gap-1">
                <Fingerprint size={20} className="font-bold" />
                TouchID
              </button>
              <button className="btn-outlined text-xs rounded-md flex items-center justify-center gap-1">
                <ScanFace size={20} className="font-bold" />
                FaceID
              </button>
            </div>

            <div className="flex items-center justify-center">
              <Link href="/Register" className="text-xs hover:underline mt-5 text-center">
                Don&apos;t have an account? <span className="text-primary-500">Register</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}