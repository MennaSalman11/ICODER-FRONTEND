
"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { sendVerificationEmail } from "@/src/lib/services/verifyEmail.services";
import { useState } from "react";
import { MailCheck } from "lucide-react";

interface VerifyForm {
  handle: string;
}

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<VerifyForm>({
    defaultValues: { handle: "" },
  });

  async function onSubmit(values: VerifyForm) {
    try {
      setLoading(true);
      const res = await sendVerificationEmail(values.handle);
      console.log("response from verify:", res);

      if (!res.ok) {
        toast.error(res.data?.message || "Failed to send verification email.", {
          position: "top-center",
        });
        return;
      }

      toast.success("Verification email sent! Check your inbox.", {
        position: "top-center",
      });

      form.reset();
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#243B6B] via-[#1C2D4D] to-[#0B0F19]">
      {/* Background glow effects */}
      <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-blue-500/25 blur-[150px]" />
      <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[130px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30">
                <MailCheck className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Verify your email
              </h1>
              <p className="mt-2 text-sm leading-6 text-orange-100/80">
                Enter your handle and we’ll send a verification email to your
                registered account.
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="handle"
                  rules={{
                    required: "Handle is required",
                    minLength: {
                      value: 3,
                      message: "Handle must be at least 3 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <label className="mb-2 block text-sm font-medium text-orange-100">
                        Handle
                      </label>

                      <FormControl>
                        <Input
                          placeholder="Enter your handle"
                          {...field}
                          className="h-12 rounded-xl border border-white/15 bg-white/10 px-4 text-white placeholder:text-white/45 shadow-inner backdrop-blur-sm transition-all duration-200 focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/40"
                        />
                      </FormControl>

                      <p className="text-xs text-orange-100/60">
                        Use the same handle linked to your account.
                      </p>

                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d6864d] to-[#f0a46d] text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.01] hover:from-[#c77741] hover:to-[#e9975f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Sending..." : "Send Verification Email"}
                </Button>
              </form>
            </Form>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs leading-5 text-white/50">
              Didn’t receive the email? Check your spam folder or try again in a
              minute.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}