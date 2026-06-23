
// "use client"

// import React, { useEffect } from 'react'; 
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { resetPassword } from "@/src/lib/services/resetPassword.services";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useForm } from "react-hook-form"
// import { toast } from "sonner";
// import z from "zod";


// const ResetSchema = z.object({
//  new_password: z.string().min(8),
//  confirmation_password: z.string().min(8),
// }).refine(data => data.new_password === data.confirmation_password, {
//  message: 'Passwords do not match',
//  path: ['confirmPassword']
// });
// type ResetValues = z.infer<typeof ResetSchema>;

// export default function ResetPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token'); 

//     useEffect(() => {
//         if (token === null) {
//             toast.error('Invalid or missing reset token. You will be redirected.', {
//                 duration: 5000 
//             });

//             const timer = setTimeout(() => {
//                 router.push('/forget-password');
//             }, 1000); 

//             return () => clearTimeout(timer); 
//         }
//     }, [token, router]);

  
//     if (token === null) {
//         return (
//             <div className="max-w-lg mx-auto py-20 text-center">
//                 <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
//                 <p>Please check your email and try again with the correct link.</p>
//                 <Button onClick={() => router.push('/forget-password')} className="mt-4">
//                     Request New Reset Link
//                 </Button>
//             </div>
//         );
//     }
    
//     const form = useForm<ResetValues>({
//         resolver: zodResolver(ResetSchema),
//         defaultValues: { new_password: '', confirmation_password: '' }
//     });

//   const onSubmit = async (values: ResetValues) => {
//  const res = await resetPassword(values.confirmation_password, values.new_password , token);
//  if (res.ok) {
//  toast.success('Password reset successfully!');
//  router.push('/login');
// } else {
//  toast.error(res.message || 'Failed to reset password');
//  }
//  };

//  return (
//     <>
//      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#35426f] via-[#213258] to-black">

//         {/* Glow Effects */}
//       <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
//       <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
// <div className="flex justify-center items-center min-h-screen text-orange-100">
//  <section className="max-w-lg mx-auto py-20">
//      <h1 className="text-2xl font-bold mb-4 text-center pb-6">Reset Password</h1>
//      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-6  p-8 border border-gray-300 rounded-lg ">
//       <Input type="password" placeholder="New Password" {...form.register('new_password')} className='focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]'/>
//       <Input type="password" placeholder="Confirm Password" {...form.register('confirmation_password')} className='focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]'/>
//       <Button type="submit"className="w-full my-4 text-xl bg-[#d6864d] hover:bg-[#af6d3e]">Reset</Button>
      
//      </form>
//    </section>
//    </div>
//      </div>
//       </>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/src/lib/services/resetPassword.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldAlert,
  Loader2,
} from "lucide-react";

const ResetSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmation_password: z
      .string()
      .min(8, "Confirmation password must be at least 8 characters long"),
  })
  .refine((data) => data.new_password === data.confirmation_password, {
    message: "Passwords do not match",
    path: ["confirmation_password"],
  });

type ResetValues = z.infer<typeof ResetSchema>;

export default function ResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetValues>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      new_password: "",
      confirmation_password: "",
    },
  });

  useEffect(() => {
    if (token === null) {
      toast.error("Invalid or missing reset token. Redirecting...", {
        duration: 3000,
      });

      const timer = setTimeout(() => {
        router.push("/forget-password");
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [token, router]);

  const onSubmit = async (values: ResetValues) => {
    if (!token) return;

    try {
      setLoading(true);

      // راجعي ترتيب البارامترات في السيرفس عندك
      const res = await resetPassword(
        values.new_password,
        values.confirmation_password,
        token
      );

      if (res.ok) {
        toast.success("Password reset successfully!");
        router.push("/login");
      } else {
        toast.error(res.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (token === null) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#243B6B] via-[#1C2D4D] to-[#0B0F19]">
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-blue-500/25 blur-[150px]" />
        <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[130px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <section className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30">
                  <ShieldAlert className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Invalid Reset Link
                </h1>
                <p className="mt-3 text-sm leading-6 text-orange-100/80">
                  This password reset link is missing or invalid. Please request
                  a new one to continue.
                </p>
              </div>

              <Button
                onClick={() => router.push("/forget-password")}
                className="mt-8 h-12 w-full rounded-xl bg-gradient-to-r from-[#d6864d] to-[#f0a46d] text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.01] hover:from-[#c77741] hover:to-[#e9975f]"
              >
                Request New Reset Link
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#243B6B] via-[#1C2D4D] to-[#0B0F19]">
      {/* Glow Effects */}
      <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-blue-500/25 blur-[150px]" />
      <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[130px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30">
                <LockKeyhole className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Reset Password
              </h1>
              <p className="mt-2 text-sm leading-6 text-orange-100/80">
                Create a new secure password for your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-orange-100">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...form.register("new_password")}
                    className="h-12 rounded-xl border border-white/15 bg-white/10 px-4 pr-12 text-white placeholder:text-white/45 shadow-inner backdrop-blur-sm transition-all duration-200 focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.new_password && (
                  <p className="mt-2 text-sm text-red-300">
                    {form.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-orange-100">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...form.register("confirmation_password")}
                    className="h-12 rounded-xl border border-white/15 bg-white/10 px-4 pr-12 text-white placeholder:text-white/45 shadow-inner backdrop-blur-sm transition-all duration-200 focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmation_password && (
                  <p className="mt-2 text-sm text-red-300">
                    {form.formState.errors.confirmation_password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d6864d] to-[#f0a46d] text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.01] hover:from-[#c77741] hover:to-[#e9975f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-white/50">
              Make sure your new password is strong and easy for you to remember.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}