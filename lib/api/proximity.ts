

const BASE = process.env.NEXT_PUBLIC_API_URL;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** POST the device's current location. Throws on non-2xx so callers can catch. */
export async function pushLocation(lat: number, lng: number): Promise<void> {
  const res = await fetch(`${BASE}/proximity/update-location`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`pushLocation ${res.status}: ${body}`);
  }
}

export type NearbyUser = {
  user_id: string;
  name: string;
  masked_account: string;
  distance_meters: number;
};

/** GET nearby users. Returns an empty array on network error (silent fail). */
export async function fetchNearbyUsers(): Promise<NearbyUser[]> {
  const res = await fetch(`${BASE}/proximity/nearby`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(`fetchNearby ${res.status}`);

  const data = await res.json();
  return data.nearby ?? [];
}

export type DebugPing = {
  status: "fresh" | "stale" | "no_ping";
  latitude?: number;
  longitude?: number;
  age_seconds?: number;
  stale_threshold_seconds?: number;
  will_appear_in_nearby?: boolean;
  message?: string;
};

/** Dev helper — call on both devices to verify pings are landing. */
export async function debugPing(): Promise<DebugPing> {
  const res = await fetch(`${BASE}/proximity/debug-ping`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`debugPing ${res.status}`);
  return res.json();
}