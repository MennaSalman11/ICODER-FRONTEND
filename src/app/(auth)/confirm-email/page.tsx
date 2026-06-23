"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmEmail } from "@/src/lib/services/confirmEmail.services";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function VerifyConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("We’re verifying your email now...");

  useEffect(() => {
    async function handleConfirm() {
      if (!token) {
        setStatus("error");
        setMessage("No verification token was provided.");
        toast.error("No token provided");
        return;
      }

      try {
        const res = await confirmEmail(token);
        console.log("confirm response:", res);

        if (!res.ok) {
          setStatus("error");
          setMessage(res.data?.message || "Verification failed. Please try again.");
          toast.error(res.data?.message || "Verification failed");
          return;
        }

        setStatus("success");
        setMessage("Your email has been verified successfully.");
        toast.success("Email verified successfully!");

        setTimeout(() => {
          router.push("/login");
        }, 1800);
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
        toast.error("Something went wrong");
      }
    }

    handleConfirm();
  }, [token, router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#243B6B] via-[#1C2D4D] to-[#0B0F19]">
      {/* Glow Effects */}
      <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-blue-500/25 blur-[150px]" />
      <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[130px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            {/* Top Icon */}
            <div className="mb-6 flex justify-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
                  status === "loading"
                    ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
                    : status === "success"
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
                    : "bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30"
                }`}
              >
                {status === "loading" && (
                  <ShieldCheck className="h-8 w-8 text-white" />
                )}
                {status === "success" && (
                  <CheckCircle2 className="h-8 w-8 text-white" />
                )}
                {status === "error" && (
                  <XCircle className="h-8 w-8 text-white" />
                )}
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {status === "loading" && "Verifying Email"}
                {status === "success" && "Email Verified"}
                {status === "error" && "Verification Failed"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-orange-100/80">
                {message}
              </p>
            </div>

            {/* Loading Spinner */}
            {status === "loading" && (
              <div className="mt-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-300" />
                <p className="text-sm text-white/60">
                  Please wait while we confirm your email address...
                </p>
              </div>
            )}

            {/* Success state */}
            {status === "success" && (
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-center text-sm text-emerald-100">
                  Redirecting you to login page...
                </div>

                <Button
                  onClick={() => router.push("/login")}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d6864d] to-[#f0a46d] text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.01] hover:from-[#c77741] hover:to-[#e9975f]"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {/* Error state */}
            {status === "error" && (
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-center text-sm text-red-100">
                  The verification link may be invalid, expired, or already used.
                </div>

                <Button
                  onClick={() => router.push("/verify")}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d6864d] to-[#f0a46d] text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.01] hover:from-[#c77741] hover:to-[#e9975f]"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}