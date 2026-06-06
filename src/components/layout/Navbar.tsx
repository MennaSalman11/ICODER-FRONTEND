"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  ChevronDown, 
  Bell, 
  FileText, 
  Trophy, 
  BarChart2, 
  Users,
  Settings,
  LogOut
} from "lucide-react"; 

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { getProfile } from "@/src/lib/services/profile.services";
const Navbar = () => {
  const { data: session, status } = useSession();
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserImage = async () => {
      const handle = session?.user?.handle || session?.user?.name;
      if (!handle) return;
      const res = await getProfile(handle);
      if (res.ok && res.data?.picture_url) {
        setUserImage(res.data.picture_url);
      }
    };

    if (status === "authenticated") {
      fetchUserImage();
    }
  }, [status, session]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo Wrapper */}
            <div className="flex items-center gap-1.5">
               {/* <div className="w-5 h-7 bg-[#1e3a8a] rounded-[2px] relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-1/2 bg-[#ef4444]"></div>
               </div> */}
               <span className="text-2xl font-bold text-[#0f172a] tracking-tight">ICoder</span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          {status === "authenticated" && (
            <nav className="hidden md:flex items-center gap-7">
              <Link href="/problems" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <FileText size={18} className="text-slate-400" /> Problems
              </Link>
              <Link href="/contests" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <Trophy size={18} className="text-slate-400" /> Contests
              </Link>
              <Link href="/submissions" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <BarChart2 size={18} className="text-slate-400" /> Submissions
              </Link>
              <Link href="/groups" className="text-slate-500 hover:text-blue-600 font-medium transition text-[14px] flex items-center gap-2">
                <Users size={18} className="text-slate-400" /> Groups
              </Link>
            </nav>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          {status === "unauthenticated" ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-slate-600 font-semibold">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-5 rounded-lg font-semibold shadow-sm">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          ) : status === "authenticated" ? (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 group outline-none">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                     {userImage ? (
  <img src={userImage} alt="User" className="w-full h-full object-cover" />
) : (
  <User size={20} className="text-slate-400" />
)}
                    </div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition" />
                  </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-52 mt-2 p-1.5 rounded-xl shadow-lg border-slate-100">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-bold text-slate-700 truncate mt-0.5">
                       {session?.user?.handle || session?.user?.name}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2 focus:bg-slate-50">
                    <Link href={`/profile/${session?.user?.handle}`} className="flex items-center gap-2 w-full">
                      <User size={16} className="text-slate-400" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2 focus:bg-slate-50">
                    <Link href={`/profile/${session?.user?.handle}/update-profile`} className="flex items-center gap-2 w-full">
                      <Settings size={16} className="text-slate-400" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-50" />
                  
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="rounded-lg cursor-pointer py-2 text-red-500 focus:bg-red-50 focus:text-red-600 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Loading State */
            <div className="w-9 h-9 rounded-full bg-slate-50 animate-pulse"></div>
          )}
        </div>
      </div>
    </header>
  );
};

export { Navbar };