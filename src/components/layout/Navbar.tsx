"use client";

import React from "react";
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

const Navbar = () => {
  const { data: session, status } = useSession();

<<<<<<< HEAD
const Navbar = ({

}: Navbar1Props) => {
  const { data: session, status } = useSession();
  console.log("Current Status:", status);
  console.log("Current Session:", session);


  return (
    <section className=" absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}


            <div className="flex items-center">
              <Link href="/" className="text-3xl text-orange-400 font-bold tracking-tighter text-foreground">
                ICoder
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <span className="text-sm text-muted-foreground animate-pulse">
                Loading...
              </span>
            ) : status === "unauthenticated" ? (
              <div className="flex items-start">
                <Button asChild variant="ghost" className="text-2xl m-2 text-white hover:bg-white/10 hover:text-orange-300 transition-all duration-300">
                  <Link href="/login">login</Link>
                </Button>
                <Button asChild className="m-2 text-2xl text-orange-300 hover:bg-gray-200 px-5 font-semibold">
                  <Link href="/register">sign Up</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* <span className="text-sm font-medium text-black">
    Welcome, {session?.user?.handle || session?.user?.name || "User"}
  </span> */}

                {status === "authenticated" ? (
                  <Link
                    href={`/profile/${session?.user?.handle}`}
                    className="flex items-center gap-2 bg-orange-400 px-4 py-2 rounded hover:bg-orange-500 transition"
                  >
                    <User size={18} />
                    {session?.user?.handle || session?.user?.name || "User"}
                  </Link>
                ) : (
                  <Link href="/login">Login</Link>
                )}

                <Link href="/problems" className="text-black hover:text-gray-300 text-sm font-medium">
                  Problems
                </Link>
                <Link href="/groups" className="text-black hover:text-gray-300 text-sm font-medium">
                  Groups
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Logout
                  <PiSignOut className=" size-4 text-white" />
                </Button>
              </div>
            )}
=======
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo Wrapper */}
            <div className="flex items-center gap-1.5">
               <div className="w-5 h-7 bg-[#1e3a8a] rounded-[2px] relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-1/2 bg-[#ef4444]"></div>
               </div>
               <span className="text-2xl font-bold text-[#0f172a] tracking-tight">Coder</span>
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
>>>>>>> dev

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

<<<<<<< HEAD
        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  {/* <SheetTitle>
                  </SheetTitle> */}
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground">
                    ICoder
                  </Link>


                  <div className="flex flex-col gap-3">
                    {status === 'loading' ? <>
                      <span>Loading....</span>
                    </> :
                      (
                        status === 'unauthenticated' ?
                          <>
                            <Button asChild variant="outline" size="sm">
                              <Link href='/login'>login</Link>
                            </Button>
                            <Button asChild size="sm">
                              <Link href='/register'>sign up</Link>
                            </Button>
                          </> :
                          <>
                            <Button asChild variant='outline'>
                              <Link href='#'>Problems</Link>
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                              sign out
                            </Button>
                          </>
                      )
                    }
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
=======
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 group outline-none">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
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
>>>>>>> dev
        </div>
      </div>
    </header>
  );
};

export { Navbar };