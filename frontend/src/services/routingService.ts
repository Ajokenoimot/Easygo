// Real-world routing using OpenStreetMap Nominatim (geocoding) and OSRM (routing)
import navTurnLeft from "@/assets/nav-turn-left.jpg";
import navTurnRight from "@/assets/nav-turn-right.jpg";
import navStraight from "@/assets/nav-straight.jpg";
import navArrive from "@/assets/nav-arrive.jpg";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface RouteStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  maneuver: string;
  name?: string;
  imageUrl: string; // Navigation image for this step
}

export interface RouteInfo {
  duration: number; // in seconds
  distance: number; // in meters
  steps: RouteStep[];
}

// Map maneuver types to appropriate navigation images
const getNavigationImage = (maneuverType: string): string => {
  const lowerType = maneuverType.toLowerCase();
  
  if (lowerType.includes("left")) return navTurnLeft;
  if (lowerType.includes("right")) return navTurnRight;
  if (lowerType.includes("arrive")) return navArrive;
  
  // Default to straight for continue, depart, merge, etc.
  return navStraight;
};

// Get current user location
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// Geocode destination address to coordinates
export const geocodeDestination = async (address: string): Promise<Coordinates> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    {
      headers: {
        'User-Agent': 'NavGuide App'
      }
    }
  );

  const data = await response.json();
  
  if (data.length === 0) {
    throw new Error("Destination not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
};

// Get route from OSRM
export const getRoute = async (
  start: Coordinates,
  end: Coordinates,
  mode: string = "walk"
): Promise<RouteInfo> => {
  // Map our modes to OSRM profiles
  const profileMap: Record<string, string> = {
    walk: "foot",
    bike: "bike",
    car: "car",
    transit: "car", // Use car as fallback for transit
  };

  const profile = profileMap[mode] || "foot";
  
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/${profile}/${start.lon},${start.lat};${end.lon},${end.lat}?steps=true&overview=false&geometries=geojson`
  );

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("Route not found");
  }

  const route = data.routes[0];
  const steps: RouteStep[] = route.legs[0].steps.map((step: any) => {
    const maneuverType = step.maneuver.type;
    const instruction = maneuverType === "depart" 
      ? `Head ${step.maneuver.modifier || "forward"}${step.name ? ` on ${step.name}` : ""}`
      : maneuverType === "arrive"
      ? "You have arrived at your destination"
      : `${maneuverType.charAt(0).toUpperCase() + maneuverType.slice(1)} ${step.maneuver.modifier || ""}${step.name ? ` onto ${step.name}` : ""}`;
    
    return {
      instruction,
      distance: step.distance,
      duration: step.duration,
      maneuver: maneuverType,
      name: step.name,
      imageUrl: getNavigationImage(maneuverType + " " + (step.maneuver.modifier || "")),
    };
  });

  return {
    duration: route.duration,
    distance: route.distance,
    steps,
  };
};
