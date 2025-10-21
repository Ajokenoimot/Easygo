import { supabase } from "@/integrations/supabase/client";

export const generateRouteImage = async (instruction: string, distance: string, location: string): Promise<string> => {
  const prompt = `First-person view from a street camera showing: ${instruction}. 
  Urban street scene with ${location}. 
  Photorealistic, clear road markings, traffic signs visible, daylight, 16:9 aspect ratio.
  Distance ahead: ${distance}. Professional street view photography style.`;

  console.log("Requesting route image for:", instruction);

  try {
    const { data, error } = await supabase.functions.invoke('generate-route-image', {
      body: { prompt }
    });

    if (error) {
      console.error('Route image generation error:', error);
      throw error;
    }

    if (!data?.imageUrl) {
      throw new Error('No image URL returned');
    }

    console.log("Route image generated successfully");
    return data.imageUrl;
  } catch (error) {
    console.error("Failed to generate route image:", error);
    throw error;
  }
};
