

export type GeoErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED";

export interface TrackingOptions {
  pushThrottleMs?: number;
  highAccuracy?: boolean;
  onError?: (code: GeoErrorCode, rawMessage: string) => void;
}

export interface LatLng {
  lat: number;
  lng: number;
}

function toGeoErrorCode(err: GeolocationPositionError): GeoErrorCode {
  switch (err.code) {
    case err.PERMISSION_DENIED:    return "PERMISSION_DENIED";
    case err.POSITION_UNAVAILABLE: return "POSITION_UNAVAILABLE";
    case err.TIMEOUT:              return "TIMEOUT";
    default:                       return "POSITION_UNAVAILABLE";
  }
}

// Module-level cache — survives between poll ticks even when watchPosition stalls.
let lastKnownPosition: LatLng | null = null;

export function getLastKnownPosition(): LatLng | null {
  return lastKnownPosition;
}


export function startLocationTracking(
  onUpdate: (lat: number, lng: number) => void,
  options: TrackingOptions = {},
): number | null {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  const { pushThrottleMs = 6_000, highAccuracy = false, onError } = options;
  let lastPushedAt = 0;

  const handlePosition = (position: GeolocationPosition, forcePush = false) => {
    const { latitude, longitude } = position.coords;
    lastKnownPosition = { lat: latitude, lng: longitude };

    const now = Date.now();
    if (forcePush || now - lastPushedAt >= pushThrottleMs) {
      lastPushedAt = now;
      onUpdate(latitude, longitude);
    }
  };

  // ── Phase 1: one-shot immediate fix ──────────────────────────────────────
  // forcePush=true bypasses the throttle so this always pushes immediately.
  navigator.geolocation.getCurrentPosition(
    (pos) => handlePosition(pos, true),
    (err) => {
      // Non-fatal — watchPosition below will retry continuously.
      // Only surface PERMISSION_DENIED since that's unrecoverable.
      if (err.code === err.PERMISSION_DENIED) {
        onError?.(toGeoErrorCode(err), err.message);
      }
    },
    {
      enableHighAccuracy: highAccuracy,
      maximumAge: 30_000,  // accept a fix up to 30 s old for the one-shot
      timeout: 10_000,
    },
  );

  // ── Phase 2: continuous watch ─────────────────────────────────────────────
  const watchId = navigator.geolocation.watchPosition(
    (pos) => handlePosition(pos),
    (err) => onError?.(toGeoErrorCode(err), err.message),
    {
      enableHighAccuracy: highAccuracy,
      maximumAge: 10_000,
      timeout: 15_000,
    },
  );

  return watchId;
}

export function stopLocationTracking(watchId: number | null): void {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  lastKnownPosition = null;
}