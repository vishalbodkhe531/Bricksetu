"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { loginSchema, LoginFormData } from "@/lib/validation/schemas";

export function useLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    setError(null);

    try {
      // Submit login to server-side route handler to write secure HTTP cookies
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Invalid email or password.");
        setIsNavigating(false);
        return;
      }

      // Sync browser client state
      const supabase = createBrowserSupabase();
      await supabase.auth
        .signInWithPassword({
          email: values.email,
          password: values.password,
        })
        .catch(() => {});  
 
      setIsNavigating(true);
      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setIsNavigating(false);
    }
  };

  return {
    form,
    error,
    isLoading: form.formState.isSubmitting || isNavigating || isPending,
    isNavigating,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
