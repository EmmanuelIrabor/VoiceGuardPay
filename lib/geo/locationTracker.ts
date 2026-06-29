
let lastUpdateTime = 0;
let lastLocation: { lat: number; lng: number } | null = null;

export function startLocationTracking(
  onUpdate: (lat: number, lng: number) => void,
  options?: { 
    minUpdateInterval?: number;  
    minDistanceChange?: number;   
  }
): number {
  const { minUpdateInterval = 3000, minDistanceChange = 5 } = options || {};
  
  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const now = Date.now();
      
      // Throttle updates
      if (now - lastUpdateTime < minUpdateInterval) {
        return;
      }
      
      // Check if position changed significantly
      if (lastLocation) {
        const distance = getDistanceFromLatLonInMeters(
          lastLocation.lat, lastLocation.lng,
          latitude, longitude
        );
        if (distance < minDistanceChange) {
          return;
        }
      }
      
      lastUpdateTime = now;
      lastLocation = { lat: latitude, lng: longitude };
      
      console.log('📍 Update location:', { latitude, longitude });
      onUpdate(latitude, longitude);
    },
    (error) => {
      console.error("Geolocation error:", error);
      // On mobile, sometimes the first attempt fails
      // Return cached position if available
      if (lastLocation) {
        console.log('📦 Using cached location');
        onUpdate(lastLocation.lat, lastLocation.lng);
      }
    },
    { 
      enableHighAccuracy: true, 
      maximumAge: 10000,  // Allow 10s old positions on mobile
      timeout: 15000     // Longer timeout for mobile
    }
  );
}

// Helper function
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export function stopLocationTracking(watchId: number) {
  navigator.geolocation.clearWatch(watchId);
  lastUpdateTime = 0;
  lastLocation = null;
}