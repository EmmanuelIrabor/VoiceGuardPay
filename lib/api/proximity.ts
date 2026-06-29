export async function pushLocation(lat: number, lng: number) {
  const token = localStorage.getItem("token");
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proximity/update-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  });
}

export type NearbyUser = {
  user_id: string;
  name: string;
  masked_account: string;
  distance_meters: number;
};

export async function fetchNearbyUsers(): Promise<NearbyUser[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proximity/nearby`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.nearby;
}