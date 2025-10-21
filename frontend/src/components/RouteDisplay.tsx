import { MapPin, Navigation, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { geocodeDestination, getRoute, Coordinates, RouteInfo } from "@/services/routingService";
import { useToast } from "@/hooks/use-toast";

interface RouteDisplayProps {
  destination: string;
  mode: string;
  userLocation: Coordinates | null;
  onStartNavigation: () => void;
}

const RouteDisplay = ({ destination, mode, userLocation, onStartNavigation }: RouteDisplayProps) => {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation) {
        setError("Location not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Geocode destination
        const destCoords = await geocodeDestination(destination);
        
        // Get route
        const routeData = await getRoute(userLocation, destCoords, mode);
        setRoute(routeData);
      } catch (err) {
        console.error("Route error:", err);
        setError(err instanceof Error ? err.message : "Failed to calculate route");
        toast({
          title: "Route error",
          description: "Could not find a route to your destination",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [destination, mode, userLocation, toast]);
  
  if (loading) {
    return (
      <div className="w-full max-w-2xl animate-slide-up">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-lg text-muted-foreground">Calculating route...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="w-full max-w-2xl animate-slide-up">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-lg text-destructive">{error || "Route not available"}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const durationMins = Math.ceil(route.duration / 60);
  const distanceKm = (route.distance / 1000).toFixed(1);

  return (
    <div className="w-full max-w-2xl animate-slide-up">
      <Card className="p-6 shadow-soft">
        {/* Map Preview */}
        <div className="relative h-64 bg-gradient-subtle rounded-lg mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <MapPin className="h-16 w-16 text-primary mx-auto" />
              <p className="text-xl font-bold text-foreground">{destination}</p>
              <p className="text-muted-foreground capitalize">via {mode}</p>
              <p className="text-sm text-muted-foreground">{route.steps.length} steps</p>
            </div>
          </div>
          {/* Decorative route line */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <path
              d="M 50 200 Q 150 50, 250 100 T 450 200"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10,5"
            />
          </svg>
        </div>

        {/* Route Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg">
            <Clock className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-xl font-bold">{durationMins} mins</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg">
            <Navigation className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-xl font-bold">{distanceKm} km</p>
            </div>
          </div>
        </div>

        {/* Route Ready Alert */}
        <div className="flex items-center gap-3 bg-success/10 border-2 border-success p-4 rounded-lg mb-6">
          <AlertCircle className="h-6 w-6 text-success" />
          <p className="text-sm font-semibold text-success-foreground">Route ready - {route.steps.length} turn-by-turn directions</p>
        </div>

        {/* Start Navigation Button */}
        <Button 
          variant="accent" 
          size="xl" 
          className="w-full"
          onClick={onStartNavigation}
        >
          <Navigation className="h-6 w-6" />
          Start Navigation
        </Button>
      </Card>
    </div>
  );
};

export default RouteDisplay;
