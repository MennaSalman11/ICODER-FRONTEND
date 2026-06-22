"use client";

import React, { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { subscribeToSubmissionStream } from "@/src/lib/services/subscribeStream.client";
import {
  Globe,
  User,
  Send,
  Eye,
  EyeOff,
  Terminal,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";

import {
  getLanguages,
  submitCodeSolution,
  getUserSessionByJudge,
  addUserSession,
  updateUserSession,
  deleteUserSession,
} from "@/src/lib/services/submitCode.services";

import { useParams } from "next/navigation";
import {
  SubmissionFormValues,
  submissionSchema,
} from "@/src/schema/submitCode.schema";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useProblem } from "@/src/components/context/problemContext";
import { useSearchParams } from "next/navigation";
interface SubmitProblemProps {
  onSuccess?: () => void;
}

const FINAL_VERDICTS = [
  "ACCEPTED",
  "WRONG_ANSWER",
  "RUNTIME_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "COMPILATION_ERROR",
  "MEMORY_LIMIT_EXCEEDED",
  "FAILED",
];

const SubmitProblemPage = ({ onSuccess }: SubmitProblemProps) => {
 const searchParams = useSearchParams();
    const contestId = searchParams.get("contestId"); 
  const activeSubmissionId = useRef<number | null>(null);
  const eventSourceRef = useRef<(() => void) | null>(null);
let globalActiveSubmissionId: number | null = null;
 
  const submissionMetaRef = useRef<{
    lang: string;
    submittedAt: string;
    time: string;
    length: string;
  } | null>(null);

  const { data: session } = useSession();
  const params = useParams();
  const ojName = (params?.judge as string) || "";
  const { selectedLanguage, sourceCode } = useProblem();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      online_judge: ojName,
      problem_code: (params?.code as string) || "",
      submission_method: "BOT",
      opened: true,
      code: sourceCode || "",
      language: selectedLanguage || "",
      contest_id: contestId || null,
    },
  });

  const submissionMethod = watch("submission_method");
  const isOpened = watch("opened");
  const currentCode = watch("code");

  const [languages, setLanguages] = useState<{ id: string; display_name: string }[]>([]);
  const [accountSession, setAccountSession] = useState<{ id: number; handle: string } | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [showVerifyBlock, setShowVerifyBlock] = useState(false);
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);
  const [cookieValue, setCookieValue] = useState("");
  const [createdSubmissionId, setCreatedSubmissionId] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    status: string;
    time?: string;
    length?: string;
    lang?: string;
    submittedAt?: string;
  } | null>(null);

// ─── SSE mount ────────────────────────────────────────────────
useEffect(() => {
  const tokenString =
    (session?.accessToken as string) || (session?.user?.accessToken as string);
  if (!tokenString) return;

  eventSourceRef.current = subscribeToSubmissionStream(
    tokenString,
    (data) => {
      
      const receivedId = Number(
        data.id ?? data.submissionId ?? data.submission_id
      );

      console.log("receivedId =", receivedId);
      console.log("activeSubmissionId =", activeSubmissionId.current);

      if (!receivedId) {
        console.log("❌ no id");
        return;
      }

const activeId = globalActiveSubmissionId;
// const activeId = activeSubmissionId.current;
if (activeId !== null && receivedId !== activeId) {
  console.log("⏭️ Ignored submission stream for other ID");
  return;
}
      if (activeSubmissionId.current === null && activeId !== null) {
        activeSubmissionId.current = activeId;
      }

      console.log("✅ passed filter");
 console.log("FULL SSE DATA =", data);
      const verdict = (data.verdict || "PENDING").toUpperCase();
      console.log("✅ verdict received from SSE:", verdict);

      setCreatedSubmissionId(receivedId);

      setSubmissionResult({
        status: verdict,
        time: submissionMetaRef.current?.time,
        length: submissionMetaRef.current?.length,
        lang: submissionMetaRef.current?.lang ?? "",
        submittedAt: submissionMetaRef.current?.submittedAt,
      });

      if (FINAL_VERDICTS.includes(verdict)) {
        console.log("🔒 Final verdict reached, clear tracking ID");
        activeSubmissionId.current = null;
        globalActiveSubmissionId = null;
        sessionStorage.removeItem("activeSubmissionId");
      }
    },
    (err) => console.error("SSE Error:", err)
  );

  return () => {
    eventSourceRef.current?.();
    eventSourceRef.current = null;
  };
}, [session]);

// ─── Queued → Judging transition ──────────────────────────────────────────
useEffect(() => {
  if (submissionResult?.status !== "CREATED") return;

  const t1 = setTimeout(() => {
    setSubmissionResult((prev) =>
      prev?.status === "CREATED" ? { ...prev, status: "JUDGING" } : prev
    );
  }, 2000);

  return () => clearTimeout(t1);
}, [submissionResult?.status]);

  // ─── Sync Monaco editor code + language ───────────────────────────────────
  useEffect(() => {
    if (sourceCode) setValue("code", sourceCode, { shouldValidate: true });
    if (selectedLanguage) setValue("language", selectedLanguage, { shouldValidate: true });
  }, [sourceCode, selectedLanguage, setValue]);

  // ─── Fetch languages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ojName) return;
    const fetchLangs = async () => {
      try {
        const data = await getLanguages(ojName);
        setLanguages(data || []);
        if (data?.length > 0 && !selectedLanguage) {
          setValue("language", data[0].id);
        }
      } catch (err) {
        console.error("Error fetching languages:", err);
      }
    };
    fetchLangs();
  }, [ojName, setValue, selectedLanguage]);

  // ─── Set user id ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (session?.user?.numericId) {
      const userId = Number(session.user.numericId);
      if (!isNaN(userId)) setValue("user_id", userId, { shouldValidate: true });
    }
  }, [session, setValue]);

  // ─── Fetch session status ──────────────────────────────────────────────────
  const fetchSessionStatus = async () => {
    if (!ojName) return;
    setLoadingSession(true);
    try {
      const data = await getUserSessionByJudge(ojName);
      if (data) {
        setAccountSession({
          id: data.id,
          handle: session?.user?.name || data.handle || "User Account",
        });
      } else {
        setAccountSession(null);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    if (submissionMethod === "SESSION") fetchSessionStatus();
  }, [submissionMethod, ojName, session]);

  // ─── Verdict banner styles ─────────────────────────────────────────────────
  const getBannerStyles = (verdict: string) => {
    const v = verdict?.toUpperCase()?.trim();
    switch (v) {
      case "PENDING":
        return { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Pending...", icon: <RefreshCw size={14} className="animate-spin text-amber-600" /> };
     case "CREATED":
  return { 
    bg: "bg-blue-50 border-blue-200", 
    text: "text-blue-700", 
    label: "Queued", 
    icon: <Clock size={14} className="animate-pulse text-blue-500" /> 
  };

case "JUDGING":
case "PENDING":
  return { 
    bg: "bg-violet-50 border-violet-200", 
    text: "text-violet-700", 
    label: "Judging...", 
    icon: <RefreshCw size={14} className="animate-spin text-violet-600" /> 
  };
        case "TESTING":
        return { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Testing...", icon: <RefreshCw size={14} className="animate-spin text-blue-600" /> };
      case "COMPILING":
       
      return { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", label: "Compiling...", icon: <Terminal size={14} className="animate-pulse text-indigo-600" /> };
     
      case "ACCEPTED":
      case "AC":
        return { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Accepted", icon: <CheckCircle size={14} className="text-green-600" /> };
      case "WRONG_ANSWER":
      case "WA":
        return { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Wrong Answer", icon: <XCircle size={14} className="text-red-600" /> };
      case "RUNTIME_ERROR":
      case "RE":
        return { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "Runtime Error", icon: <XCircle size={14} className="text-orange-600" /> };
      case "FAILED":
        return { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Failed", icon: <XCircle size={14} className="text-red-600" /> };
      case "TIME_LIMIT_EXCEEDED":
      case "TLE":
        return { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", label: "Time Limit Exceeded", icon: <Clock size={14} className="text-purple-600" /> };
      case "COMPILATION_ERROR":
      case "CE":
        return { bg: "bg-slate-50 border-slate-300", text: "text-slate-700", label: "Compilation Error", icon: <Terminal size={14} className="text-slate-600" /> };
      case "MEMORY_LIMIT_EXCEEDED":
      case "MLE":
        return { bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-700", label: "Memory Limit Exceeded", icon: <XCircle size={14} className="text-cyan-600" /> };
      default:
        return { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", label: v || "Unknown", icon: <Clock size={14} className="text-gray-500" /> };
    }
  };

  // ─── Submit code ───────────────────────────────────────────────────────────
  const onSubmitCode = async (data: SubmissionFormValues) => {
    console.log("Submit clicked, data:", data);
    if (submissionMethod === "SESSION" && !accountSession) {
      toast.error("Please configure your account Session ID first.");
      return;
    }

    const toastId = toast.loading("Processing your submission...");

    try {
      const userId = session?.user?.numericId ? Number(session.user.numericId) : null;
      if (!userId) {
        toast.error("Please log in to submit your solution.", { id: toastId });
        return;
      }

      const payload = {
        user_id: userId,
        problem_code: (params?.code || data.problem_code) as string,
        code: data.code,
        language: data.language,
        online_judge: ((params?.judge as string) || data.online_judge).toUpperCase(),
        opened: data.opened,
        submission_method: data.submission_method,
        contest_id: contestId || null,
      };

      const response = await submitCodeSolution(payload);

      if (response?.id) {
        // ① حفظ كل الـ meta من الـ POST response في ref
        // الـ SSE هيجيب verdict بس، والباقي هييجي من هنا
        submissionMetaRef.current = {
          lang: payload.language,
          submittedAt: response.submittedAt
            ? new Date(response.submittedAt).toLocaleString()
            : "Just now",
          time: `${response.timeUsage ?? 0}ms`,
          length: `${response.memoryUsage ?? 0} KB`,
        };

        // ② سيت الـ ID عشان الـ SSE callback يعرف يفلتر
activeSubmissionId.current = response.id;
globalActiveSubmissionId = response.id;
sessionStorage.setItem("activeSubmissionId", String(response.id));
        // ③ عرض الحالة الأولية من الـ POST response
        setCreatedSubmissionId(response.id);
        setSubmissionResult({
          status: (response.status || "CREATED").toUpperCase(),
          time: `${response.timeUsage ?? 0}ms`,
          length: `${response.memoryUsage ?? 0} KB`,
          lang: payload.language,
          submittedAt: response.submittedAt
            ? new Date(response.submittedAt).toLocaleString()
            : "Just now",
        });

        toast.success("Solution pushed! Waiting for verdict...", { id: toastId });
        onSuccess?.();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "An error occurred during submission", { id: toastId });
    }
  };

  // ─── Save cookie ───────────────────────────────────────────────────────────
  const handleSaveCookie = async () => {
    if (!cookieValue.trim()) return;
    const toastId = toast.loading("Saving cookie session...");
    try {
      const payload = { online_judge: ojName.toUpperCase(), session_data: cookieValue };
      if (isUpdatingSession) {
        await updateUserSession(payload);
      } else {
        await addUserSession(payload);
      }
      toast.success("Cookie updated successfully", { id: toastId });
      setShowVerifyBlock(false);
      setCookieValue("");
      setIsUpdatingSession(false);
      fetchSessionStatus();
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error("Verification failed.", { id: toastId });
    }
  };

  const handleUpdateClick = () => {
    setIsUpdatingSession(true);
    setShowVerifyBlock(true);
  };

  const handleRemoveSession = async () => {
    if (!accountSession?.id) return;
    const toastId = toast.loading("Removing session account...");
    try {
      await deleteUserSession(accountSession.id);
      setAccountSession(null);
      setShowVerifyBlock(false);
      toast.success("Account disconnected successfully", { id: toastId });
    } catch (err) {
      console.error("Error removing session:", err);
      toast.error("Failed to disconnect account", { id: toastId });
    }
  };
useEffect(() => {
    const contestId = sessionStorage.getItem("activeContestId");

    if (contestId) {
        console.log("تم قراءة الـ ID بنجاح من الـ Session:", contestId);
    }
}, []);
  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full text-left bg-white">
      {createdSubmissionId && submissionResult ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Submission Details #{createdSubmissionId}
            </h3>
            <button
              type="button"
            onClick={() => {
  setCreatedSubmissionId(null);
  setSubmissionResult(null);
  submissionMetaRef.current = null;
  activeSubmissionId.current = null;
  globalActiveSubmissionId = null; // ← أضف دي
}}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              &larr; Submit Another Code
            </button>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden text-[11px] shadow-xs">
            <div className="grid grid-cols-5 bg-gray-50/70 p-2.5 font-bold text-gray-500 border-b text-center tracking-wide uppercase text-[10px]">
              <div>Status</div>
              <div>Time</div>
              <div>Memory</div>
              <div>Lang</div>
              <div>Submitted</div>
            </div>
            <div className="grid grid-cols-5 p-2.5 text-center items-center font-semibold text-gray-700">
              <div
                className={`py-1 px-2 rounded-lg mx-1 font-bold flex items-center justify-center gap-1 border ${getBannerStyles(submissionResult.status).bg} ${getBannerStyles(submissionResult.status).text}`}
              >
                {getBannerStyles(submissionResult.status).icon}
                {getBannerStyles(submissionResult.status).label}
              </div>
              <div className="font-mono text-xs">{submissionResult.time}</div>
              <div className="font-mono text-xs">{submissionResult.length}</div>
              <div className="font-mono text-xs text-gray-600">{submissionResult.lang}</div>
              <div className="text-gray-400 text-[10px] font-medium">{submissionResult.submittedAt}</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Source Code
            </Label>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs overflow-x-auto max-h-[320px] shadow-inner leading-relaxed">
              <code>{currentCode}</code>
            </pre>
          </div>
        </div>
      ) : showVerifyBlock ? (
        <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-200">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-2">
            Verify My Account
          </div>
          <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl text-xs text-blue-800 flex items-start gap-2 leading-relaxed">
            <ShieldAlert size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              Please login unto{" "}
              <strong className="uppercase font-extrabold">{ojName}</strong>{" "}
              with your own account, and fill corresponding values below.
            </span>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-hidden text-xs shadow-xs">
            <div className="grid grid-cols-4 bg-gray-50/80 p-2.5 font-bold text-gray-500 border-b uppercase text-[10px] tracking-wider">
              <div>Type</div>
              <div>Domain</div>
              <div>Name</div>
              <div>Value</div>
            </div>
            <div className="grid grid-cols-4 p-3 items-center text-gray-700 font-semibold">
              <div className="text-gray-400 font-bold text-[10px]">COOKIE</div>
              <div className="text-xs">{ojName.toLowerCase()}.fi</div>
              <div className="text-red-500 font-mono text-xs font-bold">PHPSESSID</div>
              <div>
                <input
                  type="text"
                  value={cookieValue}
                  onChange={(e) => setCookieValue(e.target.value)}
                  placeholder="Paste Cookie Value"
                  className="w-full h-9 px-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-gray-50/30 focus:bg-white font-mono text-xs transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowVerifyBlock(false)}
              className="px-5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCookie}
              className="px-6 py-2 rounded-xl bg-[#314b87] hover:bg-[#3b5aa2] text-white text-xs font-bold shadow-xs"
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmitCode)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-gray-700 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Globe size={13} className="text-blue-500" />
                Problem Info
              </Label>
              <div className="h-10 flex items-center px-3 bg-gray-50 border border-gray-200/60 rounded-xl text-gray-800 font-semibold text-xs">
                {`${ojName.toUpperCase() || "OJ"} - ${params?.code || "CODE"}`}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-gray-700 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                {isOpened ? <Eye size={13} className="text-green-500" /> : <EyeOff size={13} className="text-gray-400" />}
                Visibility
              </Label>
              <button
                type="button"
                onClick={() => setValue("opened", !isOpened)}
                className={`flex items-center justify-between h-10 px-3.5 rounded-xl border transition-all ${
                  isOpened ? "bg-green-50/60 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {isOpened ? "Public" : "Private"}
                </span>
                <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${isOpened ? "bg-green-500" : "bg-gray-300"}`}>
                  <div className={`bg-white w-3 h-3 rounded-full transition-transform ${isOpened ? "translate-x-3" : "translate-x-0"}`} />
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-gray-700 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Terminal size={13} className="text-purple-500" />
                Language
              </Label>
              <div className="relative">
                <select
                  {...register("language")}
                  className="w-full appearance-none h-10 rounded-xl border border-gray-200 bg-gray-50/30 px-3 text-xs font-semibold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  {languages.length === 0 ? (
                    <option value="">Loading...</option>
                  ) : (
                    languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.display_name}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-gray-700 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <User size={13} className="text-orange-500" />
                Submit Via
              </Label>
              <div className="flex bg-gray-100 p-0.5 rounded-xl h-10">
                <button
                  type="button"
                  onClick={() => setValue("submission_method", "SESSION")}
                  className={`flex-1 rounded-lg text-[10px] font-black tracking-wider transition-all ${
                    submissionMethod === "SESSION" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  MY ACCOUNT
                </button>
                <button
                  type="button"
                  onClick={() => setValue("submission_method", "BOT")}
                  className={`flex-1 rounded-lg text-[10px] font-black tracking-wider transition-all ${
                    submissionMethod === "BOT" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  ICODER BOT
                </button>
              </div>
            </div>
          </div>

          {submissionMethod === "SESSION" && (
            <div className="flex items-center gap-4 text-xs bg-gray-50/50 border border-gray-100 p-3 rounded-xl animate-in fade-in duration-150">
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Account status:</span>
              {loadingSession ? (
                <span className="text-gray-400 flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" />
                  Fetching Status...
                </span>
              ) : accountSession ? (
                <div className="flex items-center gap-3">
                  <span className="text-green-600 font-extrabold">{session?.user?.handle || session?.user?.name}</span>
                  <button type="button" onClick={handleUpdateClick} className="text-blue-600 font-bold hover:underline">Update</button>
                  <button type="button" onClick={handleRemoveSession} className="text-red-500 font-bold hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 italic font-semibold">(Not Set)</span>
                  <button
                    type="button"
                    onClick={() => { setIsUpdatingSession(false); setShowVerifyBlock(true); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Link Account
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label className="text-gray-700 font-bold text-[11px] uppercase tracking-wider">Source Code</Label>
            <div className="relative">
              <Textarea
                {...register("code")}
                placeholder="// Your code from the editor is synced here..."
                className="min-h-[220px] max-h-[360px] rounded-xl border-gray-200 p-4 font-mono text-xs bg-gray-50/50 focus:bg-white focus-visible:ring-blue-100 resize-y shadow-inner text-gray-900 leading-relaxed"
              />
              {errors.code && (
                <p className="text-red-500 text-[10px] mt-1 italic font-semibold ml-1">⚠️ {errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || (submissionMethod === "SESSION" && !accountSession)}
              className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[#314b87] hover:bg-[#3b5aa2] text-white text-xs font-bold shadow-md shadow-blue-600/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting Solution..." : <><Send size={13} />Submit Code</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SubmitProblemPage;
