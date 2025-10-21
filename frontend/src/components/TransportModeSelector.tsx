import { Car, PersonStanding, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type TransportMode = "walk" | "drive" | "bus";

interface TransportModeSelectorProps {
  onModeSelect: (mode: TransportMode) => void;
}

const TransportModeSelector = ({ onModeSelect }: TransportModeSelectorProps) => {
  const [selectedMode, setSelectedMode] = useState<TransportMode>("walk");

  const modes: { id: TransportMode; icon: any; label: string }[] = [
    { id: "walk", icon: PersonStanding, label: "Walk" },
    { id: "drive", icon: Car, label: "Drive" },
    { id: "bus", icon: Bus, label: "Bus" },
  ];

  const handleSelect = (mode: TransportMode) => {
    setSelectedMode(mode);
    onModeSelect(mode);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-foreground">Choose Transport</h2>
      <div className="grid grid-cols-3 gap-4">
        {modes.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="transport"
            size="lg"
            onClick={() => handleSelect(id)}
            className={`flex-col gap-3 h-32 ${
              selectedMode === id ? 'border-primary bg-primary/10' : ''
            }`}
          >
            <Icon className="h-12 w-12" />
            <span className="text-lg font-bold">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TransportModeSelector;
