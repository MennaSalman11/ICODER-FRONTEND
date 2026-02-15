"use client"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgetPassword } from "@/src/lib/services/forgetPassword.services";
import { useForm } from "react-hook-form"
import { toast } from "sonner";

interface ForgetForm {
  email : string
}
export default function ForgetPass() {
  const form = useForm<ForgetForm>(
    {
      defaultValues:{email:''}
    });
    async function onSubmit(values: ForgetForm){
      const res = await forgetPassword(values.email);
      console.log('response from forget pass is :' , res);

      if(!res.ok){
        toast.error(res.data?.message || 'failed to send data from forget pass', {
          position:'top-center'
        });
        return ;
      }
      toast.success(res.data?.message ||'forget pass email sent , check your inbox',{
        position:'top-center'
      })
      
    }
  return (
    <section className="relative py-10 bg-gradient-to-br from-[#283252] via-[#303c64] to-black min-h-screen">
  {/* glow effect */}
   <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
   <header className="text-center py-6">
    <h1 className="text-4xl font-bold text-orange-100">Recover Access</h1>
  </header>

  {/* main */}
    <div className="flex justify-center items-center py-18">
          <div className="w-full max-w-sm bg-transparent border-2 border-slate-400 p-8 rounded-lg shadow-gray-900 shadow-3xl py-20 z-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-center m-auto pb-4">Enter Your Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} 
                                  className="focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]"

                  />
                </FormControl>
             
              </FormItem>
            )}
          />
               <Button type="submit" className="w-full mt-2 bg-[#d6864d] hover:bg-[#af6d3e]">Send Email</Button>

        </form>
      </Form>
    </div>
    </div>
    </section>
  )
}
