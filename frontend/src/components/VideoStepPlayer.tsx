import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

interface Step {
  id: number;
  title: string;
  distance: string;
  landmark: string;
  videoSrc: string;
}

interface VideoStepPlayerProps {
  step: Step;
  activeIndex: number;
  total: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const VideoStepPlayer = ({ step, activeIndex, total, isPlaying, onPrev, onNext }: VideoStepPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(step.videoSrc);
  const isVideo = /\.(mp4|webm|mov|m3u8)$/i.test(step.videoSrc);

  useEffect(() => {
    if (!isVideo) return; // Skip video playback for images
    
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isPlaying, step.videoSrc, isVideo]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Navigation Visual</h3>
        <Badge variant="secondary" className="gap-2">
          <Eye className="h-3 w-3" />
          Step {activeIndex + 1} of {total}
        </Badge>
      </div>

      <div className="relative h-72 rounded-lg overflow-hidden border-2 border-primary/20 bg-secondary/40">
        {isVideo ? (
          <video
            ref={videoRef}
            src={step.videoSrc}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={step.videoSrc}
            alt={step.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Overlay info */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/80 via-background/40 to-transparent">
          <p className="text-xl font-bold text-foreground">{step.title}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-accent font-semibold">{step.distance}</span>
            <span className="h-3 w-px bg-muted-foreground/30" />
            <MapPin className="h-4 w-4" />
            <span>{step.landmark}</span>
          </div>
        </div>

        {/* Controls + Dots */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <Button size="sm" variant="secondary" onClick={onPrev} className="backdrop-blur-md bg-card/80">
            Previous
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: total }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${idx === activeIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'}`}
              />
            ))}
          </div>
          <Button size="sm" variant="secondary" onClick={onNext} className="backdrop-blur-md bg-card/80">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoStepPlayer;
