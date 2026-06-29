

export type GeoErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED";

export interface TrackingOptions {
  /**
   * Minimum milliseconds between onUpdate calls regardless of how often
   * watchPosition fires. Default: 6000 (one push per 6 s max).
   */
  pushThrottleMs?: number;
  /**
   * enableHighAccuracy flag. false = lower battery, faster first fix on mobile.
   * Flip to true only if you need sub-10 m accuracy.
   * Default: false.
   */
  highAccuracy?: boolean;
  /** Called with a typed error code when geolocation fails. */
  onError?: (code: GeoErrorCode, rawMessage: string) => void;
}

function toGeoErrorCode(err: GeolocationPositionError): GeoErrorCode {
  switch (err.code) {
    case err.PERMISSION_DENIED:    return "PERMISSION_DENIED";
    case err.POSITION_UNAVAILABLE: return "POSITION_UNAVAILABLE";
    case err.TIMEOUT:              return "TIMEOUT";
    default:                       return "POSITION_UNAVAILABLE";
  }
}

/**
 * Start watching device position.
 *
 * Returns a watchId to pass to stopLocationTracking(), or null if the
 * Geolocation API isn't available (SSR, old browser, secure-context missing).
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
      // Reuse a fix up to 10 s old — avoids hammering the GPS chip on every tick.
      maximumAge: 10_000,
      // 15 s gives iOS Safari enough time for a cold-start fix.
      // The original 10 s caused silent timeouts on mobile.
      timeout: 15_000,
    },
  );

  return watchId;
}

export function stopLocationTracking(watchId: number | null): void {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
}