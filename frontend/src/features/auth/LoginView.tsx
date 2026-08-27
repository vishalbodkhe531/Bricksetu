import React, { useState } from "react";
import { ShieldCheck, ArrowRight, Flame, AlertCircle } from "lucide-react";
import { apiRequest } from "../../shared/api/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("AdminPassword123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-[420px] bg-card border-border shadow-xl text-card-foreground">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="size-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-orange-500/25">
            <Flame className="size-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
            BrickSetu
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">
            Sign in to manage brick kiln operations
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">Username</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-muted/30 border-border focus-visible:ring-orange-500/20 text-foreground h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/30 border-border focus-visible:ring-orange-500/20 text-foreground h-10"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 shadow-md shadow-orange-500/20 mt-2 gap-2 border-0 cursor-pointer"
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  Sign In to Workspace <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-6 text-xs text-muted-foreground gap-1.5">
          <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
          Admin Portal Only (V1). Worker self-service disabled.
        </CardFooter>
      </Card>
    </div>
  );
};
