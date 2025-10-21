import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Navigation } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`https://your-backend.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin
          ? "You've successfully logged in."
          : "Welcome to NavGuide.",
      });

      navigate("/navigation");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <Card className="w-full max-w-md p-8 shadow-elegant bg-card border-border relative z-10">
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Navigation className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">NavGuide</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 shadow-soft hover:shadow-glow transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          {isLogin ? (
            <button onClick={() => setIsLogin(false)} className="hover:text-primary transition-colors">
              Don't have an account? Sign up
            </button>
          ) : (
            <button onClick={() => setIsLogin(true)} className="hover:text-primary transition-colors">
              Already have an account? Sign in
            </button>
          )}
        </p>
      </Card>
    </div>
  );
}
