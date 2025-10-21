import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface VoiceButtonProps {
  onDestinationSet: (destination: string) => void;
}

const VoiceButton = ({ onDestinationSet }: VoiceButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const handleVoiceInput = () => {
    if (!isListening) {
      // Start listening
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak your destination clearly",
      });

      // Simulate voice recognition (in real app, use Web Speech API)
      setTimeout(() => {
        const mockDestination = "City Center";
        onDestinationSet(mockDestination);
        setIsListening(false);
        toast({
          title: "Destination Set",
          description: `Going to: ${mockDestination}`,
        });
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <Button
      variant="voice"
      size="xl"
      onClick={handleVoiceInput}
      className={`w-full max-w-md ${isListening ? 'animate-pulse-glow' : ''}`}
    >
      {isListening ? (
        <>
          <MicOff className="h-8 w-8" />
          <span className="text-2xl">Listening...</span>
        </>
      ) : (
        <>
          <Mic className="h-8 w-8" />
          <span className="text-2xl">Tap to Speak Destination</span>
        </>
      )}
    </Button>
  );
};

export default VoiceButton;
