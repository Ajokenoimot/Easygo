import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Navigation() {
  const [destination, setDestination] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [map, setMap] = useState(null);

  // Initialize Mapbox map
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: "map-container",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [3.3792, 6.5244], // Default: Lagos, Nigeria
      zoom: 10,
    });
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  // Fetch video for destination
  const handleGenerate = async () => {
    if (!destination.trim()) return;

    const res = await fetch(
      "https://your-backend.onrender.com/api/generate-video",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination }),
      }
    );

    const data = await res.json();
    setVideoUrl(data.videoUrl || "");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 gap-6 p-6 bg-gray-50">
      {/* Left: Map */}
      <div id="map-container" className="rounded-xl shadow-lg h-[80vh]" />

      {/* Right: Destination input and video */}
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold text-green-700">Find Your Route</h1>
        <Input
          type="text"
          placeholder="Enter your destination..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <Button
          onClick={handleGenerate}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Show Route & Video
        </Button>

        {videoUrl && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">
              Video Preview of {destination}
            </h2>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="rounded-lg shadow-md w-full h-64 object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
