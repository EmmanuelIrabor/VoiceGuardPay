"use client";
import { useEffect, useState, useRef } from "react";
import NavBar from "@/components/NavBar";
import { ChevronLeft } from "lucide-react";
import { CirclesThreePlus } from "phosphor-react";
import Link from "next/link";
import { User, Store } from "lucide-react";
import FoundDevice from "@/components/FoundDevices";
import { startLocationTracking, stopLocationTracking } from "@/lib/geo/locationTracker";
import { pushLocation, fetchNearbyUsers, NearbyUser } from "@/lib/api/proximity";
import { notify } from "@/lib/stores/notifyStore";

export default function Proxima() {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      notify.error("Geolocation isn't supported on this device.");
      setIsScanning(false);
      return;
    }

    const watchId = startLocationTracking((lat, lng) => {
      pushLocation(lat, lng);
    });

    if (watchId === null) {
      notify.error("Location access denied. Enable it to discover nearby users.");
      setIsScanning(false);
    }

    watchIdRef.current = watchId;

    const pollInterval = setInterval(async () => {
      try {
        const users = await fetchNearbyUsers();
        setNearbyUsers(users);
      } catch (err) {
        // fail silently on individual polls — don't spam toasts every 3s
      }
    }, 3000);

    return () => {
      if (watchIdRef.current !== null) stopLocationTracking(watchIdRef.current);
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <>
      <NavBar />

      <div className="px-5 xl:px-20">
        <div className="flex items-center gap-1 mt-5">
          <Link href="../Home/">
            <ChevronLeft size={15} className="text-primary-500 font-bold" />
          </Link>

          <div className="bg-primary-100 w-25 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
            <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
            Proxima
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-medium mt-2 font-geist typing">Proxima is Scanning</h1>
          <p className="text-xs text-neutral-800 mt-1">
            Proxima finds nearby accounts and merchants so you can issue hassle free payments
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="rounded-md p-5 w-30 h-20 flex justify-center items-center ">
            <div className="blob-scanner"></div>
          </div>
        </div>

        <p className="text-center font-bold font-jetbrains mt-15 text-xs">Proximity Detection</p>
        <p className="text-center text-xs text-neutral-600">
          {isScanning
            ? `Scanning for nearby beacons.. (${nearbyUsers.length} found)`
            : "Scanning paused"}
        </p>

        <div>
          <p className="font-bold font-jetbrains text-neutral-700 mt-15 text-xs"> DISCOVERED</p>

          <div className="flex flex-col gap-2 mt-2 mb-5">
            {nearbyUsers.length === 0 ? (
              <p className="text-xs text-primary-500  mt-5">
                No one nearby yet — keep this open on both devices.
              </p>
            ) : (
              nearbyUsers.map((user) => (
                <Link key={user.user_id} href={`/Pay/${user.user_id}`}>
                  <FoundDevice
                    icon={User}
                    title={user.name}
                    subtitle={'User Account'}
                    ms={Math.round(user.distance_meters)}
                  />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}