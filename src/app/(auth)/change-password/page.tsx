
"use client"

import React, { useEffect } from 'react'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/src/lib/services/resetPassword.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import z from "zod";


const ResetSchema = z.object({
 new_password: z.string().min(8),
 confirmation_password: z.string().min(8),
}).refine(data => data.new_password === data.confirmation_password, {
 message: 'Passwords do not match',
 path: ['confirmPassword']
});
type ResetValues = z.infer<typeof ResetSchema>;

export default function ResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); 

    useEffect(() => {
        if (token === null) {
            toast.error('Invalid or missing reset token. You will be redirected.', {
                duration: 5000 
            });

            const timer = setTimeout(() => {
                router.push('/forget-password');
            }, 1000); 

            return () => clearTimeout(timer); 
        }
    }, [token, router]);

  
    if (token === null) {
        return (
            <div className="max-w-lg mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
                <p>Please check your email and try again with the correct link.</p>
                <Button onClick={() => router.push('/forget-password')} className="mt-4">
                    Request New Reset Link
                </Button>
            </div>
        );
    }
    
    const form = useForm<ResetValues>({
        resolver: zodResolver(ResetSchema),
        defaultValues: { new_password: '', confirmation_password: '' }
    });

  const onSubmit = async (values: ResetValues) => {
 const res = await resetPassword(values.confirmation_password, values.new_password , token);
 if (res.ok) {
 toast.success('Password reset successfully!');
 router.push('/login');
} else {
 toast.error(res.message || 'Failed to reset password');
 }
 };

 return (
    <>
     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#35426f] via-[#213258] to-black">

        {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
<div className="flex justify-center items-center min-h-screen text-orange-100">
 <section className="max-w-lg mx-auto py-20">
     <h1 className="text-2xl font-bold mb-4 text-center pb-6">Reset Password</h1>
     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-6  p-8 border border-gray-300 rounded-lg ">
      <Input type="password" placeholder="New Password" {...form.register('new_password')} className='focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]'/>
      <Input type="password" placeholder="Confirm Password" {...form.register('confirmation_password')} className='focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]'/>
      <Button type="submit"className="w-full my-4 text-xl bg-[#d6864d] hover:bg-[#af6d3e]">Reset</Button>
      
     </form>
   </section>
   </div>
     </div>
      </>
  );
}