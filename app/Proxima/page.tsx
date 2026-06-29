"use client";


import { useEffect, useState, useRef, useCallback } from "react";
import NavBar from "@/components/NavBar";
import { ChevronLeft } from "lucide-react";
import { CirclesThreePlus } from "phosphor-react";
import Link from "next/link";
import { User } from "lucide-react";
import FoundDevice from "@/components/FoundDevices";
import {
  startLocationTracking,
  stopLocationTracking,
  GeoErrorCode,
} from "@/lib/geo/locationTracker";
import {
  pushLocation,
  fetchNearbyUsers,
  NearbyUser,
} from "@/lib/api/proximity";
import { notify } from "@/lib/stores/notifyStore";

// ─── Error messages ────────────────────────────────────────────────────────

const GEO_MESSAGES: Record<GeoErrorCode, string> = {
  PERMISSION_DENIED:
    "Location access was denied. Enable it in your browser settings.",
  POSITION_UNAVAILABLE:
    "Your location couldn't be determined. Check your signal.",
  TIMEOUT:
    "Getting your location is taking too long. Try moving to an open area.",
  UNSUPPORTED:
    "Geolocation isn't supported on this device.",
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function Proxima() {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning]   = useState(false);
  const [geoError, setGeoError]       = useState<string | null>(null);
  const [pushError, setPushError]     = useState<string | null>(null);

  const watchIdRef      = useRef<number | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Teardown ─────────────────────────────────────────────────────────────

  const stopAll = useCallback(() => {
    stopLocationTracking(watchIdRef.current);
    watchIdRef.current = null;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
    setIsScanning(false);
  }, []);

  // ── Start scanning ────────────────────────────────────────────────────────

  const startScanning = useCallback(() => {
    // Guard: token must exist before we start or every push will 401
    if (!localStorage.getItem("token")) {
      setPushError("You're not signed in. Please log in and try again.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError(GEO_MESSAGES.UNSUPPORTED);
      return;
    }

    // Reset any previous error state
    setGeoError(null);
    setPushError(null);
    setIsScanning(true);

    const watchId = startLocationTracking(
      async (lat, lng) => {
        try {
          await pushLocation(lat, lng);
          setPushError(null); // clear previous push error on success
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Location push failed";
          setPushError(msg);
          // Don't stop scanning — GPS is working, just a transient network issue
        }
      },
      {
        pushThrottleMs: 6_000,
        highAccuracy: false,   // flip to true if you need <10 m precision
        onError: (code: GeoErrorCode) => {
          const msg = GEO_MESSAGES[code];
          setGeoError(msg);
          notify.error(msg);
          stopAll();
        },
      },
    );

    if (watchId === null) {
      setGeoError(GEO_MESSAGES.UNSUPPORTED);
      setIsScanning(false);
      return;
    }

    watchIdRef.current = watchId;

    // Poll for nearby users every 5 s.
    // Intentionally offset from the 6 s push so we read a freshly-written row.
    pollIntervalRef.current = setInterval(async () => {
      try {
        const users = await fetchNearbyUsers();
        setNearbyUsers(users);
      } catch {
        // Silent — don't toast on every failed poll
      }
    }, 5_000);
  }, [stopAll]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    startScanning();
    return stopAll;
  }, [startScanning, stopAll]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <NavBar />

      <div className="px-5 xl:px-20">

        {/* Header row */}
        <div className="flex items-center gap-1 mt-5">
          <Link href="../Home/">
            <ChevronLeft size={15} className="text-primary-500 font-bold" />
          </Link>
          <div className="bg-primary-100 w-25 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs">
            <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
            Proxima
          </div>
        </div>

        {/* Title */}
        <div className="mt-2">
          <h1 className="text-2xl font-medium font-geist typing">
            {isScanning ? "Proxima is scanning" : "Proxima"}
          </h1>
          <p className="text-xs text-neutral-800 mt-1">
            Finds nearby accounts so you can send payments without typing details
          </p>
        </div>

        {/* Geolocation error */}
        {geoError && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            <p>{geoError}</p>
            <button
              className="mt-2 font-semibold underline"
              onClick={startScanning}
            >
              Retry
            </button>
          </div>
        )}

        {/* Push / auth error (non-fatal — scanning continues) */}
        {pushError && !geoError && (
          <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
            {pushError}
          </div>
        )}

        {/* Scanner animation */}
        <div className="mt-10 flex items-center justify-center">
          <div className="rounded-md p-5 w-30 h-20 flex justify-center items-center">
            <div className={`blob-scanner${isScanning ? "" : " blob-scanner--paused"}`} />
          </div>
        </div>

        {/* Status line */}
        <p className="text-center font-bold font-jetbrains mt-15 text-xs">
          Proximity detection
        </p>
        <p className="text-center text-xs text-neutral-600">
          {isScanning
            ? `Scanning for nearby beacons… (${nearbyUsers.length} found)`
            : geoError
              ? "Paused — see above"
              : "Scanning paused"}
        </p>

        {/* Results */}
        <div className="mt-15 mb-5">
          <p className="font-bold font-jetbrains text-neutral-700 text-xs">
            DISCOVERED
          </p>

          <div className="flex flex-col gap-2 mt-2">
            {nearbyUsers.length === 0 ? (
              <p className="text-xs text-primary-500 mt-5">
                {isScanning
                  ? "No one nearby yet — keep scanning"
                  : "Start scanning to discover nearby users"}
              </p>
            ) : (
              nearbyUsers.map((user) => (
                <Link key={user.user_id} href={`/Pay/${user.user_id}`}>
                  <FoundDevice
                    icon={User}
                    title={user.name}
                    subtitle="User account"
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
