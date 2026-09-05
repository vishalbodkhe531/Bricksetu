"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Flame, AlertCircle } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Submit login to server-side route handler to write secure HTTP cookies
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Sync browser client state
      const supabase = createBrowserSupabase();
      await supabase.auth.signInWithPassword({ email, password }).catch(() => {});

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-foreground relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Flame className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            BrickSetu
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to manage brick kiln operations
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-md border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 px-4 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 mt-2"
          >
            {loading ? (
              "Authenticating..."
            ) : (
              <>
                Sign In to Workspace <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-muted-foreground text-center border-t border-border">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Secured by Supabase Auth. Admin portal only.</span>
        </div>
      </div>
    </div>
  );
}
