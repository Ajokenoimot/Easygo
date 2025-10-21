import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to NavGuide
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-accent rounded-full mb-8" />
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 animate-fade-in">
          Your personal AI-powered travel companion. Get video previews, live
          maps, and routes to your next destination.
        </p>
        <Button
          onClick={() => navigate("/auth")}
          size="lg"
          className="px-12 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-glow hover:shadow-accent transition-all duration-300 animate-pulse-glow"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
