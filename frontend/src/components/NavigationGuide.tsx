import { Volume2, Pause, SkipForward, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import VideoStepPlayer from "@/components/VideoStepPlayer";
import RouteMap from "@/components/RouteMap";
import { geocodeDestination, getRoute, Coordinates, RouteStep } from "@/services/routingService";
import { generateRouteImage } from "@/services/imageGenerationService";

interface NavigationGuideProps {
  destination: string;
  mode: string;
  userLocation: Coordinates | null;
}

interface VideoStep {
  id: number;
  title: string;
  distance: string;
  landmark: string;
  videoSrc: string;
}

// Convert real route steps to video steps with AI-generated images
const convertToVideoSteps = async (steps: RouteStep[]): Promise<VideoStep[]> => {
  const videoSteps: VideoStep[] = [];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const distanceText = `${Math.round(step.distance)}m`;
    const locationText = step.name || "Continue ahead";
    
    try {
      const imageUrl = await generateRouteImage(step.instruction, distanceText, locationText);
      
      videoSteps.push({
        id: i + 1,
        title: step.instruction,
        distance: distanceText,
        landmark: locationText,
        videoSrc: imageUrl,
      });
    } catch (error) {
      console.error("Failed to generate image for step:", error);
      // Fallback to generic navigation image if generation fails
      videoSteps.push({
        id: i + 1,
        title: step.instruction,
        distance: distanceText,
        landmark: locationText,
        videoSrc: step.imageUrl,
      });
    }
  }
  
  return videoSteps;
};

const NavigationGuide = ({ destination, mode, userLocation }: NavigationGuideProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [guideVideos, setGuideVideos] = useState<VideoStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destCoords, setDestCoords] = useState<Coordinates | null>(null);
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
        const coords = await geocodeDestination(destination);
        setDestCoords(coords);
        const route = await getRoute(userLocation, coords, mode);
        const videos = await convertToVideoSteps(route.steps);
        setGuideVideos(videos);
        setError(null);
      } catch (err) {
        console.error("Navigation route error:", err);
        setError("Could not load navigation");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [destination, mode, userLocation]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl animate-slide-up">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-lg text-muted-foreground">Loading navigation...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || guideVideos.length === 0) {
    return (
      <div className="w-full max-w-2xl animate-slide-up">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-lg text-destructive">{error || "No navigation available"}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl animate-slide-up">
      <Card className="p-6 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Navigation Active</h2>
          <p className="text-xl text-muted-foreground">To: {destination}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Guide Display */}
          <div className="space-y-4">
            <VideoStepPlayer
              step={guideVideos[activeVideo]}
              activeIndex={activeVideo}
              total={guideVideos.length}
              isPlaying={isPlaying}
              onPrev={() => setActiveVideo(Math.max(0, activeVideo - 1))}
              onNext={() => setActiveVideo(Math.min(guideVideos.length - 1, activeVideo + 1))}
            />

            {/* Current Instruction */}
            <div className="bg-accent/10 border-2 border-accent p-6 rounded-lg">
              <p className="text-2xl font-bold text-center text-foreground">
                {guideVideos[activeVideo].title} — {guideVideos[activeVideo].distance}
              </p>
            </div>
          </div>

          {/* Map Display */}
          <div className="h-[400px] lg:h-full min-h-[400px]">
            {userLocation && destCoords && (
              <RouteMap
                userLocation={userLocation}
                destination={destCoords}
                steps={guideVideos}
                activeStepIndex={activeVideo}
              />
            )}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setActiveVideo(0);
              toast({ title: "Restarting instructions" });
            }}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
          <Button
            variant={isPlaying ? "secondary" : "accent"}
            size="xl"
            onClick={() => {
              setIsPlaying(!isPlaying);
              toast({ title: !isPlaying ? "Playing" : "Paused" });
            }}
            className="col-span-1"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setActiveVideo((prev) => Math.min(guideVideos.length - 1, prev + 1));
              toast({ title: "Next instruction" });
            }}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>25% Complete</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-primary animate-pulse" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NavigationGuide;
