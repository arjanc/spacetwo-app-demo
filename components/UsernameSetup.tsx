'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UsernameSetup() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Username validation regex
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  // Check username availability
  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }

    if (!usernameRegex.test(value)) {
      setUsernameStatus('invalid');
      setUsernameError('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError(null);

    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: value }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsernameStatus(data.available ? 'available' : 'taken');
        setUsernameError(data.available ? null : 'Username is already taken');
      } else {
        setUsernameStatus('invalid');
        setUsernameError(data.error || 'Error checking username');
      }
    } catch (error) {
      setUsernameStatus('invalid');
      setUsernameError('Error checking username availability');
    }
  };

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleUsernameSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameStatus !== 'available') {
      setError('Please choose a valid username');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await updateProfile({ username });

      // Redirect to onboarding or dashboard
      router.push('/onboarding');
    } catch (error) {
      console.error('Error setting username:', error);
      setError('Failed to set username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />;
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'taken':
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
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
          style={{ animationDelay: '1s' }}
        ></div>
        <div className="hidden sm:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4]/10 to-[#8b5cf6]/10 rounded-full blur-2xl"></div>

        {/* Geometric shapes - Hidden on small mobile, smaller on larger mobile */}
        <div
          className="hidden sm:block absolute top-32 right-32 w-12 sm:w-20 h-12 sm:h-20 border border-[#5865f2]/30 rotate-45 animate-spin"
          style={{ animationDuration: '20s' }}
        ></div>
        <div className="hidden md:block absolute bottom-32 left-32 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-[#ec4899]/20 to-[#f97316]/20 rotate-12"></div>
        <div
          className="hidden sm:block absolute top-1/4 left-1/4 w-4 sm:w-6 h-4 sm:h-6 bg-[#5865f2]/40 rounded-full animate-bounce"
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div
          className="hidden sm:block absolute bottom-1/4 right-1/4 w-6 sm:w-8 h-6 sm:h-8 bg-[#7c3aed]/40 rounded-full animate-bounce"
          style={{ animationDelay: '0.7s' }}
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
          <p className="text-[#827989] text-base sm:text-lg font-medium px-2">Choose your username</p>
          <p className="text-[#64748b] text-sm mt-1 px-2">This will be your unique identifier in the community</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl flex items-center gap-3 backdrop-blur-sm mx-2 sm:mx-0">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Username setup form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl mx-2 sm:mx-0">
          <form className="flex flex-col gap-4" onSubmit={handleUsernameSetup}>
            <div className="relative">
              <Input
                className="text-black pr-10"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]{3,20}"
                required
                autoFocus
              />
              {username && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getUsernameIcon()}</div>
              )}
            </div>
            {usernameError && <p className="text-red-400 text-xs -mt-2">{usernameError}</p>}
            <div className="text-xs text-[#64748b] -mt-2">
              <p>• 3-20 characters long</p>
              <p>• Letters, numbers, and underscores only</p>
              <p>• Must be unique</p>
            </div>
            <Button
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
              type="submit"
              disabled={isLoading || usernameStatus !== 'available' || !username}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting Username...
                </div>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center px-4 sm:px-0">
          <p className="text-[#64748b] text-xs sm:text-sm leading-relaxed">
            You can change your username later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
