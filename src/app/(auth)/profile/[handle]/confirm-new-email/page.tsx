"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmNewEmail } from "@/src/lib/services/confirmNewEmail.services";

export default function VerifyConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    async function handleConfirm() {
      if (!token) {
        toast.error("No token provided");
        return;
      }
console.log("Token found:", token);
      const res = await confirmNewEmail(token);
      console.log("confirm response:", res); 

      if (!res.ok) {
        toast.error(res.data?.message || "Verification failed");
        return;
      }

      toast.success("Email verified successfully!");
      router.push(`/profile/${searchParams.get("handle")}`);
    }

    handleConfirm();
  }, [token, router]);

  return(
    <>
         <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#4d5f9f] via-[#36518c] to-black">

        {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-[700px] h-[700px] bg-blue-300 rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
    <div className="flex justify-center  min-h-screen text-orange-100">
      <p className="text-center mt-10 text-white text-xl">Confirming New Email...</p>
    </div>
    </div>
    </>
  ) 
}
