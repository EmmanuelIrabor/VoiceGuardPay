"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import NavBar from "@/components/NavBar";
import { ChevronLeft } from "lucide-react";
import { CirclesThreePlus } from "phosphor-react";
import Link from "next/link";
import { User } from "lucide-react";
import FoundDevice from "@/components/FoundDevices";
import { startLocationTracking, stopLocationTracking, GeoErrorCode } from "@/lib/geo/locationTracker";
import { pushLocation, fetchNearbyUsers, NearbyUser } from "@/lib/api/proximity";
import { notify } from "@/lib/stores/notifyStore";

const GEO_ERROR_MESSAGES: Record<GeoErrorCode, string> = {
  PERMISSION_DENIED:    "Location access was denied. Enable it in your browser settings to scan.",
  POSITION_UNAVAILABLE: "Your location couldn't be determined. Check your signal and try again.",
  TIMEOUT:              "Getting your location is taking too long. Try moving outdoors.",
  UNSUPPORTED:          "Geolocation isn't supported on this device.",
};

export default function Proxima() {
  const [nearbyUsers, setNearbyUsers]   = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning]     = useState(false);
  const [geoError, setGeoError]         = useState<string | null>(null);
  const watchIdRef                      = useRef<number | null>(null);
  const pollIntervalRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback(() => {
    stopLocationTracking(watchIdRef.current);
    watchIdRef.current = null;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(() => {
    if (!navigator?.geolocation) {
      setGeoError(GEO_ERROR_MESSAGES.UNSUPPORTED);
      return;
    }

    setGeoError(null);
    setIsScanning(true);

    const watchId = startLocationTracking(
      async (lat, lng) => {
        try {
          await pushLocation(lat, lng);
        } catch {
          // Network hiccup — don't surface, we'll retry on next tick
        }
      },
      {
        pushThrottleMs: 6_000,   // max one DB upsert per 6 s
        highAccuracy: false,     // conserve battery; flip to true if you need <10 m accuracy
        onError: (code) => {
          const msg = GEO_ERROR_MESSAGES[code];
          setGeoError(msg);
          notify.error(msg);
          stopAll();
        },
      },
    );

    if (watchId === null) {
      // Returned null means geolocation API missing (already guarded above, safety net)
      setGeoError(GEO_ERROR_MESSAGES.UNSUPPORTED);
      setIsScanning(false);
      return;
    }

    watchIdRef.current = watchId;

    // Poll for nearby users every 5 s — slightly offset from the 6 s push
    // so we're likely reading a fresh location on every poll.
    pollIntervalRef.current = setInterval(async () => {
      try {
        const users = await fetchNearbyUsers();
        setNearbyUsers(users);
      } catch {
        // Fail silently — don't spam toasts on every interval
      }
    }, 5_000);
  }, [stopAll]);

  // Kick off scanning on mount. 
  // iOS Safari will prompt the user on the first watchPosition call as long as
  // this component mounts as a result of a navigation/tap (which it does from Home).
  // If we ever need a guaranteed user-gesture trigger, wrap startScanning in a button.
  useEffect(() => {
    startScanning();
    return stopAll;
  }, [startScanning, stopAll]);

  return (
    <>
      <NavBar />

      <div className="px-5 xl:px-20">
        <div className="flex items-center gap-1 mt-5">
          <Link href="../Home/">
            <ChevronLeft size={15} className="text-primary-500 font-bold" />
          </Link>

          <div className="bg-primary-100 w-25 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs">
            <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
            Proxima
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-medium mt-2 font-geist typing">
            {isScanning ? "Proxima is Scanning" : "Proxima"}
          </h1>
          <p className="text-xs text-neutral-800 mt-1">
            Proxima finds nearby accounts and merchants so you can issue hassle-free payments
          </p>
        </div>

        {/* Geo error state */}
        {geoError && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {geoError}
            {geoError === GEO_ERROR_MESSAGES.PERMISSION_DENIED && (
              <button
                className="block mt-2 font-semibold underline"
                onClick={startScanning}
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center">
          <div className="rounded-md p-5 w-30 h-20 flex justify-center items-center">
            <div className={`blob-scanner${isScanning ? "" : " blob-scanner--paused"}`} />
          </div>
        </div>

        <p className="text-center font-bold font-jetbrains mt-15 text-xs">Proximity Detection</p>
        <p className="text-center text-xs text-neutral-600">
          {isScanning
            ? `Scanning for nearby beacons… (${nearbyUsers.length} found)`
            : geoError
              ? "Scanning paused — see above"
              : "Scanning paused"}
        </p>

        <div>
          <p className="font-bold font-jetbrains text-neutral-700 mt-15 text-xs">DISCOVERED</p>

          <div className="flex flex-col gap-2 mt-2 mb-5">
            {nearbyUsers.length === 0 ? (
              <p className="text-xs text-primary-500 mt-5">No one nearby yet.</p>
            ) : (
              nearbyUsers.map((user) => (
                <Link key={user.user_id} href={`/Pay/${user.user_id}`}>
                  <FoundDevice
                    icon={User}
                    title={user.name}
                    subtitle="User Account"
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