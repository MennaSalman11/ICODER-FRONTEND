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
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formState, RegisterFormSchema, RegisterSchema } from "@/src/schema/register.schema"
import { handleRegister } from "@/src/lib/services/register.services"
import { useActionState, useEffect } from "react"
import { sendVerificationEmail } from "@/src/lib/services/verifyEmail.services"
import { RiCodeBlock } from "react-icons/ri"
import { FaMedapps } from "react-icons/fa6"
import { CiTrophy } from "react-icons/ci"
import Link from "next/link"



export default function RegisterPage() {
  const router = useRouter();
const [action , formAction]= useActionState(handleRegister , formState)
const form = useForm<RegisterSchema>({resolver:zodResolver(RegisterFormSchema), 
  defaultValues :
  {
    handle:'' ,
    nickname:'',
    email:'',
     password:'',
     password_confirmation:'' ,
      school:''
    }
  })
console.log('formAction' , action);

useEffect(()=>{
  if(action){
    if(!action.success && action.message){
     toast.error(action.message , {
    position:'top-center'
     })
    }
    if(action.success && action.message){
      toast.success(action.message ,
        {
          position:'top-center'
        }
      )
    
      router.push('/verify-email')
    }
  }
},[action , router])

  return (

<section className="relative py-6 bg-gradient-to-br from-[#1f263c] via-[#1d2c4a] to-black min-h-screen">
  {/* glow effect */}
   <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
   <header className="text-center py-2">
  <h1 className="text-4xl font-bold text-white">Join ICoder</h1>
  </header>
{/* main */}
  <div className="flex justify-between px-16 py-2 gap-7 container m-auto">

      <div className="text-white ">
         <h1 className="text-orange-300 font-bold text-4xl pb-2">ICoder</h1>
         <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-6 text-orange-100">
                     Master the Art of <span className="text-orange-400">Problem Solving</span>
     </h2>
       <p className="text-lg text-orange-100 mb-10 max-w-md leading-relaxed">
                         Join the global community of competitive programmers. Solve, compete, and track your progress in real-time.
                     </p>
     <section className="flex justify-around">
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

   <div className="w-full max-w-sm bg-gradient-to-br from-[#c6cde1] via-[#9fa7bc] border border-slate-700 p-8 rounded-lg shadow-gray-600 shadow-3xl  z-20">
     <h2 className="text-2xl font-bold mb-3 text-center text-white">Register</h2>
        <Form {...form}>
      <form action={formAction} 
      className="space-y-8">
      
       {/* ******* handle ****** */}
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>handle</FormLabel> */}
              <FormControl>
                <Input placeholder="handle*" {...field} 
                className="focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]"
                />
              </FormControl>
              <FormMessage>
                {action?.error?.handle?.[0]}
              </FormMessage>
            </FormItem>
          )}
        />

  {/* ******* nickname ****** */}
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Nickname</FormLabel> */}
              <FormControl>
                <Input placeholder="Nickname*" {...field}
                className="focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]"
                />
              </FormControl>
                 <FormMessage>
                {action?.error?.nickname?.[0]}
              </FormMessage>
            </FormItem>
          )}
        />

    {/* ******* email ****** */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Email</FormLabel> */}
              <FormControl>
                <Input placeholder="Email*" {...field}
                className="focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]"
                />
              </FormControl>
                  <FormMessage>
                {action?.error?.email?.[0]}
              </FormMessage>
            </FormItem>
          )}
        />

         {/* ******* password ****** */}
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Password</FormLabel> */}
              <FormControl>
                <Input placeholder="password*" {...field}
                className="focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]"
                />
              </FormControl>
                  <FormMessage>
                {action?.error?.password?.[0]}
              </FormMessage>
            </FormItem>
          )}
        />

           {/* ******* Confirm password ****** */}
        <FormField
          control={form.control}
          name='password_confirmation'
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Confirm Password</FormLabel> */}
              <FormControl>
                <Input placeholder="Confirm password*" {...field} 
                className="focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]"
                />
              </FormControl>
                  <FormMessage>
                {action?.error?.password_confirmation?.[0]}
              </FormMessage>
            </FormItem>
          )}
        />
           {/* ******* school ****** */}
        <FormField
          control={form.control}
        name='school'
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>School</FormLabel> */}
              <FormControl>
                <Input placeholder="school" {...field} 
                className="focus-visible:ring-[#fbcdac] focus-visible:border-[#eca877]"
                />
              </FormControl>
                  <FormMessage>
                {action?.error?.school?.[0]}
              </FormMessage>
            </FormItem>
          )}
        />




        <Button type="submit" 
        disabled={form.formState.isSubmitting}
        className="w-full mt-2 bg-[#d6864d] hover:bg-[#af6d3e]">
         {form.formState.isSubmitting ? "signing up..." : "Sign Up"}
          </Button>
        <p className="text-center text-orange-100 hover:text-orange-50 cursor-pointer">You have an account? <Link href="/login" className="text-orange-400 hover:text-orange-200">login</Link> </p>
      </form>
    </Form>
   </div>
  </div>


 </section>
  )
}