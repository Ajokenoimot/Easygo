interface VideoGenerationRequest {
  prompt: string;
}

interface VideoGenerationResponse {
  id: string;
  status: string;
  output?: string[];
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-navigation-video`;

export const generateNavigationVideo = async (prompt: string): Promise<string> => {
  console.log("Requesting video generation for:", prompt);
  
  // Start video generation
  const startResponse = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt } as VideoGenerationRequest),
  });

  if (!startResponse.ok) {
    throw new Error('Failed to start video generation');
  }

  const startData: VideoGenerationResponse = await startResponse.json();
  const predictionId = startData.id;
  
  console.log("Video generation started, prediction ID:", predictionId);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max (5 seconds * 60)
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    const statusResponse = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ predictionId }),
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to check video generation status');
    }

    const statusData: VideoGenerationResponse = await statusResponse.json();
    console.log("Video generation status:", statusData.status);

    if (statusData.status === 'succeeded' && statusData.output && statusData.output.length > 0) {
      console.log("Video generation complete:", statusData.output[0]);
      return statusData.output[0];
    }

    if (statusData.status === 'failed') {
      throw new Error('Video generation failed');
    }

    attempts++;
  }

  throw new Error('Video generation timeout');
};

export const createNavigationPrompt = (instruction: string, distance: string, location: string): string => {
  return `First-person view navigation scene: ${instruction}. Distance: ${distance}. Location: ${location}. Realistic urban street view with clear signage and landmarks. Cinematic, smooth camera movement.`;
};
