"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeProgressBar() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/Login");
          }, 300);
          return 100;
        }

        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="w-54 xl:w-80 h-2 rounded-full overflow-hidden bg-dark">
      <div
        className="h-full transition-all duration-100 ease-out bg-primary-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}