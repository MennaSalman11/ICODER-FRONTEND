"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RiCodeBlock } from "react-icons/ri"
import { FaMedapps } from "react-icons/fa"
import { CiTrophy } from "react-icons/ci"
import { Input } from "@/components/ui/input"
import { loginFormPayload, LoginFormSchema } from "@/src/schema/login.schema"
import { signIn } from 'next-auth/react'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

 
  const form = useForm<loginFormPayload>({ 
    resolver: zodResolver(LoginFormSchema), 
    defaultValues: { 
      handle: '', 
      password: '' 
    } 
  })

  async function onSubmit(values: loginFormPayload) {
    try {
      const res = await signIn('credentials', {
        handle: values.handle, 
        password: values.password,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Login successfully", {
          position: 'top-center'
        })
        // التوجيه للصفحة الرئيسية أو البروفايل
        router.push('/')
        router.refresh() 
      } else {
        toast.error(res?.error || "Invalid handle or password", {
          position: 'top-center'
        })
      }
    } catch (error) {
      console.error("Login submission error:", error);
      toast.error("Something went wrong");
    }
  }

  return (
<section className="relative py-6 bg-gradient-to-br from-[#1f263c] via-[#1d2c4a] to-black min-h-screen overflow-hidden">
      {/* glow effect */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>

      <header className="text-center py-2 relative z-10">
        <h1 className="text-4xl font-bold text-white">Login to ICoder</h1>
      </header>

      {/* main content */}
      <div className="flex flex-col lg:flex-row justify-between items-center px-16 py-12 gap-7 container m-auto relative z-10">
        
        {/* Left Side: Branding */}
        <div className="text-white flex-1">
          <h1 className="text-orange-300 font-bold text-5xl pb-2">ICoder</h1>
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-6 text-orange-100">
            Master the Art of <span className="text-orange-400">Problem Solving</span>
          </h2>
          <p className="text-lg text-orange-100 mb-10 max-w-md leading-relaxed">
            Welcome back! Continue your journey, solve challenges, and climb the leaderboard.
          </p>
          
          <section className="flex justify-around lg:justify-start lg:gap-12">
               <div>
                 <RiCodeBlock size={100} className="opacity-20 mt-50 me-5"/>
                 </div>
                 <div>
                   <FaMedapps size={100} className="opacity-20 mt-40"/>
                 </div>
                 <div>
                   <CiTrophy size={100} className="opacity-20 mt-20"/>
                 </div>
          </section>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-sm bg-gradient-to-br from-[#c6cde1] via-[#9fa7bc] border border-slate-700 p-8 rounded-lg shadow-gray-600 shadow-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Handle Field */}
              <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="handle*" 
                        {...field} 
                        className="bg-white/80 focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877] h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-red-800 font-bold" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="password*" 
                        {...field} 
                        className="bg-white/80 focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877] h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-red-800 font-bold" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="w-full mt-2 bg-[#d6864d] hover:bg-[#af6d3e] text-white font-bold h-11 transition-colors"
              >
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <div className="space-y-3 pt-2">
                <p className="text-center text-slate-800 text-sm">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-[#c26d34] hover:text-[#eb7526] font-bold hover:underline">
                    Register
                  </Link> 
                </p>
                <Link 
                  href="/forget-password" 
                  className="block text-center text-xs text-slate-700 hover:text-black hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}