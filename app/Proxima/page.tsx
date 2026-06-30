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
  getLastKnownPosition,
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

type LogEntry = { time: string; msg: string };

export default function Proxima() {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning]   = useState(false);
  const [geoError, setGeoError]       = useState<string | null>(null);
  const [pushError, setPushError]     = useState<string | null>(null);
  const [debugLog, setDebugLog]       = useState<LogEntry[]>([]);

  const watchIdRef      = useRef<number | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef     = useRef<WakeLockSentinel | null>(null);

  // ── Debug logger — visible on screen, no devtools needed ─────────────────
  const log = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setDebugLog((prev) => [{ time, msg }, ...prev].slice(0, 30)); // keep last 30
    console.log(`[Proxima] ${time} — ${msg}`);
  }, []);

  // ── Wake Lock ─────────────────────────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      log("Wake Lock API not supported on this browser");
      return;
    }
    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      log("Wake lock acquired");
    } catch (e) {
      log(`Wake lock failed: ${e instanceof Error ? e.message : e}`);
    }
  }, [log]);

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
    } catch {
      // ignore
    }
  }, []);

  // ── Push last known position ──────────────────────────────────────────────
  const pushLastKnown = useCallback(async () => {
    const pos = getLastKnownPosition();
    if (!pos) {
      log("pushLastKnown: no cached position yet");
      return;
    }
    try {
      await pushLocation(pos.lat, pos.lng);
      log(`Pushed ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
      setPushError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Location push failed";
      log(`Push FAILED: ${msg}`);
      setPushError(msg);
    }
  }, [log]);

  // ── Poll ──────────────────────────────────────────────────────────────────
  const pollNow = useCallback(async () => {
    if (document.visibilityState !== "visible") {
      log("poll skipped — tab not visible");
      return;
    }

    await pushLastKnown();

    try {
      const users = await fetchNearbyUsers();
      log(`/nearby returned ${users.length} user(s)`);
      setNearbyUsers(users);
    } catch (err) {
      log(`/nearby FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }, [pushLastKnown, log]);

  // ── Teardown ──────────────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    stopLocationTracking(watchIdRef.current);
    watchIdRef.current = null;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
    releaseWakeLock();
    setIsScanning(false);
  }, [releaseWakeLock]);

  // ── Start scanning ────────────────────────────────────────────────────────
  const startScanning = useCallback(() => {
    log("startScanning() called");

    if (!localStorage.getItem("token")) {
      log("ABORT: no token in localStorage");
      setPushError("You're not signed in. Please log in and try again.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      log("ABORT: navigator.geolocation unavailable");
      setGeoError(GEO_MESSAGES.UNSUPPORTED);
      return;
    }

    setGeoError(null);
    setPushError(null);
    setIsScanning(true);
    acquireWakeLock();

    log("Calling startLocationTracking()...");

    const watchId = startLocationTracking(
      async (lat, lng) => {
        log(`watchPosition/getCurrentPosition callback fired: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        try {
          await pushLocation(lat, lng);
          log("Push from GPS callback succeeded");
          setPushError(null);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Location push failed";
          log(`Push from GPS callback FAILED: ${msg}`);
          setPushError(msg);
        }
      },
      {
        pushThrottleMs: 6_000,
        highAccuracy: false,
        onError: (code: GeoErrorCode, rawMsg: string) => {
          log(`Geolocation ERROR: ${code} — ${rawMsg}`);
          const msg = GEO_MESSAGES[code];
          setGeoError(msg);
          notify.error(msg);
          stopAll();
        },
      },
    );

    log(`startLocationTracking returned watchId: ${watchId}`);

    if (watchId === null) {
      log("ABORT: watchId is null");
      setGeoError(GEO_MESSAGES.UNSUPPORTED);
      setIsScanning(false);
      return;
    }

    watchIdRef.current = watchId;
    pollNow();
    pollIntervalRef.current = setInterval(pollNow, 5_000);
  }, [stopAll, pollNow, acquireWakeLock, log]);

  // ── Mount / unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    startScanning();
    return stopAll;
  }, [startScanning, stopAll]);

  // ── Visibility & focus recovery ───────────────────────────────────────────
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState === "visible") {
        log("Tab became visible — re-acquiring wake lock + pushing + polling");
        await acquireWakeLock();
        await pushLastKnown();
        pollNow();
      }
    };
    const onFocus = () => { log("Window focused"); pollNow(); };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [pollNow, pushLastKnown, acquireWakeLock, log]);

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

        {/* ── DEBUG PANEL — remove once mobile is confirmed working ──────── */}
        <div className="mt-10 mb-10 p-3 bg-black rounded-md text-[10px] font-mono text-green-400 max-h-80 overflow-y-auto">
          <p className="text-white font-bold mb-2">DEBUG LOG (newest first)</p>
          {debugLog.length === 0 ? (
            <p className="text-neutral-500">No events yet...</p>
          ) : (
            debugLog.map((entry, i) => (
              <p key={i} className="mb-1 break-words">
                <span className="text-neutral-500">{entry.time}</span> — {entry.msg}
              </p>
            ))
          )}
        </div>

      </div>
    </>
  );
}
