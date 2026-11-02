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

function SignUpRoute() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '', password: '', confirmPassword: '' });
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
          setError(err?.message ?? "Google sign-up failed.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { email, name, password, confirmPassword } = formData;

    console.log("Form data:", { email, name, password, confirmPassword });

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); return; }

      // Use token directly from registration response
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

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-up didn't start.");
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
        title={<span className="font-light text-[#2a1c12] tracking-tighter">Create Account</span>}
        description="Join our community and start your journey with us"
        heroImageSrc="https://images.unsplash.com/photo-1559883251-957f389d1a5f?w=1200&h=800&fit=crop"
        testimonials={sampleTestimonials}
        onSignIn={handleSignUp}
        onGoogleSignIn={handleGoogleSignUp}
        showCreateAccountLink={false}
        showSignInLink={true}
        submitButtonText={loading ? "Creating account…" : "Create Account"}
        showSignUpFields={true}
        formData={formData}
        onFormChange={setFormData}
      />
    </>
  );
}

export const Route = createFileRoute("/sign-up")({ component: SignUpRoute });