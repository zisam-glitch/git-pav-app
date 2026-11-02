import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { signInWithGoogle, handleGoogleRedirectResult } from "@/lib/firebase/client";
import { useCartStore } from "@/lib/cart-store";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity.",
  },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function exchangeFirebaseToken(idToken: string): Promise<{ token?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/auth/firebase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });
  return res.json();
}

function SignInRoute() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { sessionId, syncCart } = useCartStore();

  // Pick up Google redirect result when landing back on this page
  useEffect(() => {
    setLoading(true);
    handleGoogleRedirectResult()
      .then(async (idToken) => {
        if (!idToken) return;
        const data = await exchangeFirebaseToken(idToken);
        if (data.error) { setError(data.error); return; }
        if (data.token) localStorage.setItem("user_token", data.token);
        
        // Merge guest cart with user cart
        if (sessionId) {
          try {
            await fetch(`${API_BASE}/api/v1/cart/merge`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.token}`
              },
              credentials: "include",
              body: JSON.stringify({ sessionId }),
            });
            // Sync cart after merge
            await syncCart();
          } catch (err) {
            console.warn("Failed to merge cart:", err);
          }
        }
        
        navigate({ to: "/" });
      })
      .catch((err) => {
        if (err?.code !== "auth/popup-closed-by-user") {
          setError(err?.message ?? "Google sign-in failed.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed. Please check your credentials.");
        return;
      }

      if (data.token) localStorage.setItem("user_token", data.token);
      
      // Merge guest cart with user cart
      if (sessionId) {
        try {
          await fetch(`${API_BASE}/api/v1/cart/merge`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.token}`
            },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
          });
          // Sync cart after merge
          await syncCart();
        } catch (err) {
          console.warn("Failed to merge cart:", err);
        }
      }
      
      navigate({ to: "/" });
    } catch {
      setError("Network error — make sure the API server is running on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    // Triggers redirect — page will reload then useEffect above handles result
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in didn't start.");
    }
  };

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl shadow-lg text-sm max-w-sm text-center">
          {error}
        </div>
      )}
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1559883251-957f389d1a5f?w=1200&h=800&fit=crop"
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={() => navigate({ to: "/contact" })}
        submitButtonText={loading ? "Signing in…" : "Sign In"}
      />
    </>
  );
}

export const Route = createFileRoute("/sign-in")({ component: SignInRoute });