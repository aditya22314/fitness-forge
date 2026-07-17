import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Iron" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  const signInGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Sign in failed");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      // session set — refresh
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <div className="w-full max-w-sm glass rounded-2xl p-8 text-center">
        <div
          className="mx-auto grid place-items-center h-14 w-14 rounded-2xl mb-4"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <Dumbbell className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to Iron</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to sync your workouts and progress.</p>

        <button
          onClick={signInGoogle}
          disabled={busy}
          className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-lg bg-white text-black font-medium py-2.5 px-4 disabled:opacity-60 hover:bg-white/90 transition"
        >
          <GoogleIcon />
          {busy ? "Signing in…" : "Continue with Google"}
        </button>

        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          Continue without signing in
        </button>
      </div>
    </div>
  );
}

// Ensure module used
void supabase;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.1c-2 1.4-4.5 2.3-7.2 2.3-5.3 0-9.7-3.1-11.3-7.4l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.1 5.1c-.4.4 6.6-4.8 6.6-14.6 0-1.2-.1-2.3-.3-3.5z"/>
    </svg>
  );
}