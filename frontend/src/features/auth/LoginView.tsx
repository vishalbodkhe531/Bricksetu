import React, { useState } from "react";
import { ShieldCheck, ArrowRight, Flame } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[420px] bg-slate-900/80 border-slate-800/60 backdrop-blur-xl shadow-2xl text-slate-100">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="size-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-orange-500/25">
            <Flame className="size-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-white">
            BrickSetu
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm mt-1">
            Sign in to manage brick kiln operations
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Username</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-slate-950/40 border-slate-700/60 focus-visible:border-orange-500 focus-visible:ring-orange-500/20 text-white h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-950/40 border-slate-700/60 focus-visible:border-orange-500 focus-visible:ring-orange-500/20 text-white h-10"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold h-11 shadow-lg shadow-orange-500/20 mt-2 gap-2"
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

        <CardFooter className="justify-center pb-6 text-xs text-slate-500 gap-1.5">
          <ShieldCheck className="size-4 text-slate-500" />
          Admin Portal Only (V1). Worker self-service disabled.
        </CardFooter>
      </Card>
    </div>
  );
};
