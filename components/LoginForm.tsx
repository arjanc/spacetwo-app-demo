
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const FEATURE_FLAG_GOOGLESIGNIN = true;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramError = searchParams.get("error");
  const redirectTo = searchParams.get("redirectedFrom") || "/";
  const[email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState(paramError ? paramError === "auth_error" ? "Authentication failed. Please try again." : "An error occurred during sign in." : '');
  const { signInWithGoogle, setUserWithProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError("An error occurred during sign in. " + data.error);
      }

      // Update the auth session
      if (data.session) {
        // Set the session
        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token!,
        });

        if (error) {
          console.error('Error setting session:', error);
          throw error;
        }

         // Force a refresh of the auth state
        await supabase.auth.refreshSession();

        // Update the user profile in the auth context
        await setUserWithProfile(data.user);
      }

      // Force a full page reload to ensure all auth state is properly initialized
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in." + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorative elements - Hidden on mobile for better performance */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs - Smaller and fewer on mobile */}
        <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-[#5865f2]/15 sm:from-[#5865f2]/20 to-[#7c3aed]/15 sm:to-[#7c3aed]/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-56 sm:w-96 h-56 sm:h-96 bg-gradient-to-r from-[#ec4899]/15 sm:from-[#ec4899]/20 to-[#f97316]/15 sm:to-[#f97316]/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="hidden sm:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4]/10 to-[#8b5cf6]/10 rounded-full blur-2xl"></div>

        {/* Geometric shapes - Hidden on small mobile, smaller on larger mobile */}
        <div
          className="hidden sm:block absolute top-32 right-32 w-12 sm:w-20 h-12 sm:h-20 border border-[#5865f2]/30 rotate-45 animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>
        <div className="hidden md:block absolute bottom-32 left-32 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-[#ec4899]/20 to-[#f97316]/20 rotate-12"></div>
        <div
          className="hidden sm:block absolute top-1/4 left-1/4 w-4 sm:w-6 h-4 sm:h-6 bg-[#5865f2]/40 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="hidden sm:block absolute bottom-1/4 right-1/4 w-6 sm:w-8 h-6 sm:h-8 bg-[#7c3aed]/40 rounded-full animate-bounce"
          style={{ animationDelay: "0.7s" }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-[#5865f2] to-[#7c3aed] rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-[#5865f2]/25">
            <Sparkles className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2 sm:mb-3">
            SpaceTwo
          </h1>
          <p className="text-[#827989] text-base sm:text-lg font-medium px-2">
            Welcome to the future of design
          </p>
          <p className="text-[#64748b] text-sm mt-1 px-2">
            Sign in to access your creative community
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl flex items-center gap-3 backdrop-blur-sm mx-2 sm:mx-0">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-xs sm:text-sm">
              {error}
            </p>
          </div>
        )}
      
        {/* Login form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl mx-2 sm:mx-0">
          {FEATURE_FLAG_GOOGLESIGNIN && (
            <>
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 sm:h-14 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm sm:text-base flex items-center justify-center gap-3 sm:gap-4 transition-all duration-200 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
              >
              {isLoading ? (
                <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 sm:border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <>
                  <svg
                    className="w-5 sm:w-6 h-5 sm:h-6 flex-shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="truncate">Continue with Google</span>
                </>
              )}
            </Button>
            <div className="relative my-6 flex justify-center items-center">
              <div className="w-full border-t border-gray-600"></div>
              <span className="px-6 text-gray-400">Or</span>
              <div className="w-full border-t border-gray-600"></div>
            </div>
          </>
          )}
          
          <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
            <Input className="text-black" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <Input className="text-black" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white" type="submit">
              Sign In
              {isLoading && (
                <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 sm:border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              )}
            </Button>
          </form>
          <span className="block text-xs mt-4">Don't have an account? <Link className="text-[#5865f2] hover:text-[#4752c4] transition-colors font-medium" href="/register">Sign Up</Link></span>

          {/* Additional info */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-[#64748b]">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs sm:text-xs">Secure</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full"></div>
                <span className="text-xs sm:text-xs">Fast</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-400 rounded-full"></div>
                <span className="text-xs sm:text-xs">Private</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center px-4 sm:px-0">
          <p className="text-[#64748b] text-xs sm:text-sm leading-relaxed">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-[#5865f2] hover:text-[#4752c4] transition-colors font-medium"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#5865f2] hover:text-[#4752c4] transition-colors font-medium"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
