/**
 * Location tracking helpers.
 *
 * Mobile notes
 * ------------
 * - enableHighAccuracy=true drains battery fast and times out more on iOS.
 *   We start with low-accuracy and let the caller opt into high-accuracy.
 * - maximumAge=10_000 lets the browser reuse a recent fix instead of hammering
 *   the GPS chip on every tick — good for both battery and responsiveness.
 * - timeout=15_000 gives iOS Safari enough time to get a first fix.
 * - We expose the GeolocationPositionError code so callers can show the right
 *   message (PERMISSION_DENIED vs POSITION_UNAVAILABLE vs TIMEOUT).
 */

export type GeoErrorCode = "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNSUPPORTED";

export interface TrackingOptions {
  /** Minimum milliseconds between pushLocation calls (default 5000). */
  pushThrottleMs?: number;
  /** Use high-accuracy GPS (higher battery cost, default false). */
  highAccuracy?: boolean;
  onError?: (code: GeoErrorCode, message: string) => void;
}

function mapGeoError(err: GeolocationPositionError): GeoErrorCode {
  switch (err.code) {
    case err.PERMISSION_DENIED:    return "PERMISSION_DENIED";
    case err.POSITION_UNAVAILABLE: return "POSITION_UNAVAILABLE";
    case err.TIMEOUT:              return "TIMEOUT";
    default:                       return "POSITION_UNAVAILABLE";
  }
}

/**
 * Start watching the device position.
 *
 * @returns watchId to pass to stopLocationTracking(), or null if unsupported.
 */
export function startLocationTracking(
  onUpdate: (lat: number, lng: number) => void,
  options: TrackingOptions = {},
): number | null {
  if (!navigator?.geolocation) return null;

  const { pushThrottleMs = 5_000, highAccuracy = false, onError } = options;

  let lastPushAt = 0;

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      // Throttle: only call onUpdate if enough time has passed
      if (now - lastPushAt >= pushThrottleMs) {
        lastPushAt = now;
        onUpdate(position.coords.latitude, position.coords.longitude);
      }
    },
    (err) => {
      const code = mapGeoError(err);
      onError?.(code, err.message);
    },
    {
      enableHighAccuracy: highAccuracy,
      maximumAge: 10_000,   // reuse a fix up to 10 s old — saves battery
      timeout: 15_000,      // iOS Safari needs more time for a first fix
    },
  );

  return watchId;
}

export function stopLocationTracking(watchId: number | null) {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
}