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

const GEO_MESSAGES: Record<GeoErrorCode, string> = {
  PERMISSION_DENIED:    "Location access was denied. Enable it in your browser settings.",
  POSITION_UNAVAILABLE: "Your location couldn't be determined. Check your signal.",
  TIMEOUT:              "Getting your location is taking too long. Try moving to an open area.",
  UNSUPPORTED:          "Geolocation isn't supported on this device.",
};

export default function Proxima() {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning]   = useState(false);
  const [geoError, setGeoError]       = useState<string | null>(null);
  const [pushError, setPushError]     = useState<string | null>(null);

  const watchIdRef      = useRef<number | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch once, right now ─────────────────────────────────────────────────
  // Called on mount AND whenever the page becomes visible again (back-navigation).
  // This means the list is never empty for 5 s waiting for the first interval tick.
  const pollNow = useCallback(async () => {
    try {
      const users = await fetchNearbyUsers();
      setNearbyUsers(users);
    } catch {
      // silent — interval will retry
    }
  }, []);

  // ── Teardown ──────────────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    stopLocationTracking(watchIdRef.current);
    watchIdRef.current = null;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
    setIsScanning(false);
  }, []);

  // ── Start scanning ────────────────────────────────────────────────────────
  const startScanning = useCallback(() => {
    if (!localStorage.getItem("token")) {
      setPushError("You're not signed in. Please log in and try again.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError(GEO_MESSAGES.UNSUPPORTED);
      return;
    }

    setGeoError(null);
    setPushError(null);
    setIsScanning(true);

    const watchId = startLocationTracking(
      async (lat, lng) => {
        try {
          await pushLocation(lat, lng);
          setPushError(null);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Location push failed";
          setPushError(msg);
        }
      },
      {
        pushThrottleMs: 6_000,
        highAccuracy: false,
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

    // Fetch immediately so the list is populated before the first interval tick
    pollNow();

    // Then keep polling every 5 s
    pollIntervalRef.current = setInterval(pollNow, 5_000);
  }, [stopAll, pollNow]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    startScanning();
    return stopAll;
  }, [startScanning, stopAll]);

  // ── Page Visibility API ───────────────────────────────────────────────────
  // Fires when the user navigates back to this tab/page without a full remount.
  // Re-fetches immediately so the list isn't stale after returning from /Pay.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollNow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pollNow]);

  // ── Next.js route focus recovery ──────────────────────────────────────────
  // When Next.js soft-navigates back to this page, the component may not fully
  // remount (depending on your router cache config). window focus is a reliable
  // signal that the user has returned to this page.
  useEffect(() => {
    const handleFocus = () => pollNow();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [pollNow]);

  // ─── Render ───────────────────────────────────────────────────────────────
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

        <div className="mt-2">
          <h1 className="text-2xl font-medium font-geist typing">
            {isScanning ? "Proxima is scanning" : "Proxima"}
          </h1>
          <p className="text-xs text-neutral-800 mt-1">
            Finds nearby accounts so you can send payments without typing details
          </p>
        </div>

        {geoError && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            <p>{geoError}</p>
            <button className="mt-2 font-semibold underline" onClick={startScanning}>
              Retry
            </button>
          </div>
        )}

        {pushError && !geoError && (
          <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
            {pushError}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center">
          <div className="rounded-md p-5 w-30 h-20 flex justify-center items-center">
            <div className={`blob-scanner${isScanning ? "" : " blob-scanner--paused"}`} />
          </div>
        </div>

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

        <div className="mt-15 mb-5">
          <p className="font-bold font-jetbrains text-neutral-700 text-xs">DISCOVERED</p>

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
