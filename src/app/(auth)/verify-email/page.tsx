"use client"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { sendVerificationEmail } from "@/src/lib/services/verifyEmail.services";
import { useRouter } from "next/navigation";

interface VerifyForm {
  handle: string;
}

export default function VerifyPage() {
    // const router =useRouter();
  const form = useForm<VerifyForm>({
    defaultValues: { handle: "" }
  });

async function onSubmit(values: VerifyForm) {
  const res = await sendVerificationEmail(values.handle);
console.log("response from verify :"  ,res);

  if (!res.ok) {
    toast.error(res.data?.message || "Failed to send verification email.", {
      position: "top-center",
    });
    return;
  }

  toast.success("Verification email sent! Check your inbox.", {
    position: "top-center",
  });


}

  return (
     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#35426f] via-[#213258] to-black">

        {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
<div className="flex justify-center items-center min-h-screen text-orange-100">
 <section className="max-w-lg mx-auto py-20">
       <h1 className="text-2xl font-bold mb-4 text-center pb-6">Reset Password</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-6  p-8 border border-gray-300 rounded-lg ">
          <FormField
            control={form.control}
            name="handle"
            render={({ field }) => (
              <FormItem>
                
                <FormControl>
                  <Input placeholder="Enter your handle" {...field} className='focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]'/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full my-4 text-lg bg-[#d6864d] hover:bg-[#af6d3e]">Send Verification Email</Button>
        </form>
      </Form>
          </section>
    </div>
</div>
  );
}
