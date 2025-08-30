'use client';

import { useState, FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";


const OnboardingView = () => {
    const [projectName, setProjectName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleProjectCreation = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectName.trim() || isLoading) return;

        setIsLoading(true);
        
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
                throw authError;
            }
            
            if (!user) {
                setError('You must be logged in to create a project');
                return;
            }

            // Get the current session to include the auth token
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.access_token) {
                throw new Error('No active session found');
            }

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    name: projectName.trim(),
                    type: 'text',
                    label: projectName.trim().charAt(0).toUpperCase(),
                    bg: '#5865f2',
                    color: '#ffffff',
                    project_count: 0,
                    user_id: user.id
                }),
            });

            const result = await response.json();
            
            if (!response.ok) {
                setError(result.error || 'Failed to create project');
                return;
            }
            
            const project = result.data;
            
            // Redirect to the new project or dashboard
            toast.success('Project created successfully!');
            router.push('/dashboard'); // Adjust the redirect path as needed
            
        } catch (error) {
            console.error('Error creating project:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
            setError(errorMessage);
            
            // Show toast notification for better user feedback
            toast.error(errorMessage, {
                position: 'top-center',
                duration: 5000,
            });
            
            // If it's an auth error, suggest re-logging in
            if (errorMessage.toLowerCase().includes('auth') || errorMessage.toLowerCase().includes('session')) {
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
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
                <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-56 sm:w-96 h-56 sm:h-96 bg-gradient-to-r from-[#ec4899]/15 sm:from-[#ec4899]/20 to-[#f97316]/15 sm:to-[#f97316]/20 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                <div className="hidden sm:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4]/10 to-[#8b5cf6]/10 rounded-full blur-2xl"></div>

                {/* Geometric shapes - Hidden on small mobile, smaller on larger mobile */}
                <div className="hidden sm:block absolute top-32 right-32 w-12 sm:w-20 h-12 sm:h-20 border border-[#5865f2]/30 rotate-45 animate-spin" style={{ animationDuration: "20s" }}></div>
                <div className="hidden md:block absolute bottom-32 left-32 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-[#ec4899]/20 to-[#f97316]/20 rotate-12"></div>
                <div className="hidden sm:block absolute top-1/4 left-1/4 w-4 sm:w-6 h-4 sm:h-6 bg-[#5865f2]/40 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
                <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-6 sm:w-8 h-6 sm:h-8 bg-[#7c3aed]/40 rounded-full animate-bounce" style={{ animationDelay: "0.7s" }}></div>
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
                        Let's get started. Create your first project.
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

                {/* Form */}
                <form className="flex flex-col gap-4" onSubmit={handleProjectCreation} noValidate>
                    <Input 
                        type="text" 
                        placeholder="Project name" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)}
                        disabled={isLoading}
                        minLength={1}
                        maxLength={50}
                        className="text-black"
                        required 
                    />
                    <Button 
                        className="bg-[#5865f2] hover:bg-[#4752c4] text-white h-11 w-full" 
                        type="submit"
                        disabled={isLoading || !projectName.trim()}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </div>
                        ) : 'Create Project'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingView;