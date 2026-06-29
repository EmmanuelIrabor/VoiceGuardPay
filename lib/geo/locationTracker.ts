

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
// Reset to null when tracking stops.
let lastKnownPosition: LatLng | null = null;

/** Returns the most recent GPS fix, or null if we've never had one. */
export function getLastKnownPosition(): LatLng | null {
  return lastKnownPosition;
}

/**
 * Start watching device position.
 * Returns a watchId to pass to stopLocationTracking(), or null if unavailable.
 */
export function startLocationTracking(
  onUpdate: (lat: number, lng: number) => void,
  options: TrackingOptions = {},
): number | null {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  const { pushThrottleMs = 6_000, highAccuracy = false, onError } = options;
  let lastPushedAt = 0;

  const watchId = navigator.geolocation.watchPosition(
    ({ coords }) => {
      // Always cache the latest fix regardless of throttle
      lastKnownPosition = { lat: coords.latitude, lng: coords.longitude };

      const now = Date.now();
      if (now - lastPushedAt >= pushThrottleMs) {
        lastPushedAt = now;
        onUpdate(coords.latitude, coords.longitude);
      }
    },
    (err) => {
      onError?.(toGeoErrorCode(err), err.message);
    },
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