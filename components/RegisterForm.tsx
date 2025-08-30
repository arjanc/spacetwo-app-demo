"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const[email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
          
      const data = await response.json();

      if (!response.ok) {
        setError("An error occurred during sign up. " + data.error);
      }

      // Update the auth session
      if (data.session) {
        console.log('Updating auth session', data.session);
        
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
      }

      router.refresh(); // Important: This will re-run layout and page data fetches
      router.push('/onboarding');

    } catch (error) {
      console.error("Sign up error:", error);
      setError("An error occurred during sign up." + error);
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
            Sign up to access your creative community
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
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <Input className="text-black" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <Input className="text-black" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white" type="submit">
              Sign Up
              {isLoading && (
                <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 sm:border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              )}
            </Button>
          </form>
          <span className="block text-xs mt-4">Already have an account? <Link className="text-[#5865f2] hover:text-[#4752c4] transition-colors font-medium" href="/login">Sign In</Link></span>

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