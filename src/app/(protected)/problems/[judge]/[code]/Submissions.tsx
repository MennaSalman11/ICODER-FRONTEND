"use client"; 
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Globe, User, Send, Lock, Eye, EyeOff, Terminal } from "lucide-react";
import { getLanguages, submitCodeSolution, toggleSubmissionOpenness } from '@/src/lib/services/submitCode.services';
import { useParams } from 'next/navigation';
import { SubmissionFormValues, submissionSchema } from '@/src/schema/submitCode.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const SubmitProblemPage = () => {
  const { data: session } = useSession();
  const params = useParams();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      online_judge: (params?.judge as string) || "",
      problem_code: (params?.code as string) || "",
      submission_method: "BOT", 
      opened: true,
      code: "", 
      language: "", 
      contest_id: null,
    }
  });
  console.log(" Validation Errors:", errors);

  const submissionMethod = watch("submission_method");
  const isOpened = watch("opened");
  const [languages, setLanguages] = useState<{id: string, display_name: string}[]>([]);

  useEffect(() => {
    const fetchLangs = async () => {
      const ojName = params?.judge as string; 
      if (ojName) {
        try {
          const data = await getLanguages(ojName);
          setLanguages(data);
          if (data.length > 0) {
            setValue("language", data[0].id);
          }
        } catch (err) {
          console.error("Error fetching languages:", err);
        }
      }
    };
    fetchLangs();
  }, [params?.judge, setValue]);

useEffect(() => {
  if (session?.user?.numericId) {
    const userId = Number(session.user.numericId);
    if (!isNaN(userId)) {
      setValue("user_id", userId, { shouldValidate: true }); 
      console.log("✅ User ID Sync:", userId);
    }
  }
}, [session, setValue]);
  const onSubmit = async (data: SubmissionFormValues) => {
    console.log("Submitting Data:", data);
    toast.success("Submitting solution...");
  };
// handle submit code solution

const onSubmitCode = async (data: SubmissionFormValues) => {
  const toastId = toast.loading("Processing your submission..."); 
  
  try {
    // Using numericId from the session as defined in our updated interface
    const userId = session?.user?.numericId ? Number(session.user.numericId) : null;

    if (!userId) {
      toast.error("User not found. Please log in again.", { id: toastId });
      return;
    }

    const payload = {
      ...data,
      user_id: userId, 
      contest_id: null,
      online_judge: data.online_judge || (params?.judge as string),
      problem_code: data.problem_code || (params?.code as string),
    };

    console.log("Payload to Backend:", payload);

    const response = await submitCodeSolution(payload); 
    
    if (response) {
      toast.success("Solution submitted successfully!", { id: toastId });
    }
  } catch (err: any) {
    console.error("Submission error:", err);
    const errorMessage = err.response?.data?.message || "An error occurred during submission";
    toast.error(errorMessage, { id: toastId });
  }
};
console.log("Is Submitting:", isSubmitting);
console.log('languages:', languages);
console.log('isOpened:', isOpened);
console.log('submissionMethod:', submissionMethod);
console.log('online_judge:', watch("online_judge"));
console.log('problem_code:', watch("problem_code"));
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex justify-center items-start">
      <Card className="w-full max-w-4xl p-6 md:p-8 rounded-[2rem] border-none shadow-sm bg-white">
        
        {/* Header Section */}
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-[#1a4b8f]">
            <Code2 size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A1D37]">Submit Solution</h1>
            <p className="text-slate-400 text-sm">Configure your submission and paste your code</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitCode)} className="space-y-8">
          
          {/* Top Row: Problem Info & Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-[#0A1D37] font-semibold flex items-center gap-2 text-sm">
                <Globe size={14} className="text-blue-500" /> Problem Info
              </Label>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[#0A1D37] font-medium text-sm">
                {`${params?.judge?.toString().toUpperCase() || "OJ"} - ${params?.code || "CODE"}`}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[#0A1D37] font-semibold flex items-center gap-2 text-sm">
                {isOpened ? <Eye size={14} className="text-green-500"/> : <EyeOff size={14} className="text-slate-400"/>} 
                Visibility Settings
              </Label>
              <button
                type="button"
                onClick={() => setValue("opened", !isOpened)}
                className={`flex items-center justify-between h-[46px] px-4 rounded-xl border transition-all ${
                  isOpened ? "bg-green-50 border-green-100 text-green-700" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{isOpened ? "Public" : "Private"}</span>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isOpened ? "bg-green-500" : "bg-slate-300"}`}>
                  <div className={`bg-white w-3 h-3 rounded-full transition-transform ${isOpened ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Second Row: Languages & Submit By (Next to each other) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Programming Language */}
            <div className="flex flex-col gap-2">
              <Label className="text-[#0A1D37] font-semibold flex items-center gap-2 text-sm">
                <Terminal size={14} className="text-purple-500" /> Language
              </Label>
              <div className="relative">
                <select 
                  {...register("language")}
                  className="w-full appearance-none h-[46px] rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                >
                  {languages.length === 0 ? (
                    <option value="">Loading...</option>
                  ) : (
                    languages.map((lang) => <option key={lang.id} value={lang.id}>{lang.display_name}</option>)
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Submit By */}
            <div className="flex flex-col gap-2">
              <Label className="text-[#0A1D37] font-semibold flex items-center gap-2 text-sm">
                <User size={14} className="text-orange-500" /> Submit By
              </Label>
              <div className="flex bg-slate-100 p-1 rounded-xl h-[46px]">
                <button
                  type="button"
                  onClick={() => setValue("submission_method", "SESSION")}
                  className={`flex-1 rounded-lg text-xs font-bold transition-all ${submissionMethod === "SESSION" ? "bg-white shadow-sm text-[#0A1D37]" : "text-slate-500 hover:text-slate-700"}`}
                >
                  MY ACCOUNT
                </button>
                <button
                  type="button"
                  onClick={() => setValue("submission_method", "BOT")}
                  className={`flex-1 rounded-lg text-xs font-bold transition-all ${submissionMethod === "BOT" ? "bg-white shadow-sm text-[#0A1D37]" : "text-slate-500 hover:text-slate-700"}`}
                >
                  ICODER BOT
                </button>
              </div>
            </div>
          </div>

          {/* Full Width Code Area */}
          <div className="flex flex-col gap-2 pt-2">
            <Label className="text-[#0A1D37] font-bold text-sm">Source Code</Label>
            <div className="relative">
              <Textarea 
                {...register("code")}
                placeholder="// Paste your code here..." 
                className="min-h-[350px] rounded-[1.5rem] border-slate-200 p-6 font-mono text-[13px] bg-slate-50/20 focus-visible:ring-blue-100 resize-none shadow-inner"
              />
              {errors.code && <p className="text-red-500 text-[11px] mt-1 italic ml-2">{errors.code.message}</p>}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-3 rounded-xl bg-[#0A1D37] text-white text-[13px] font-bold hover:bg-[#153a6f] shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : <><Send size={14} /> Submit Solution</>}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SubmitProblemPage;