import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-white text-center p-6">
      <h1 className="text-5xl font-bold mb-6 text-green-800">
        Welcome to NavGuide 🌍
      </h1>
      <p className="text-lg text-gray-700 max-w-lg mb-8">
        Your personal AI-powered travel companion. Get video previews, live
        maps, and routes to your next destination!
      </p>
      <Button
        onClick={() => navigate("/auth")}
        className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg"
      >
        Get Started
      </Button>
    </div>
  );
}
