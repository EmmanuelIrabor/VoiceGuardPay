export function startLocationTracking(onUpdate: (lat: number, lng: number) => void): number {
  return navigator.geolocation.watchPosition(
    (position) => {
      onUpdate(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      console.error("Geolocation error:", error);
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}

export function stopLocationTracking(watchId: number) {
  navigator.geolocation.clearWatch(watchId);
}