"use client"
import HomePage from "../components/Home/home";
import LandingPage from "../components/LandingPage/landingPage";
import { useSession } from "next-auth/react";

export default function Home() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading Coder...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="pt-16"> 
        
            {status === 'unauthenticated' ? (
                <LandingPage />
            ) : (
                <HomePage />
            )}
        </main>
    );
}