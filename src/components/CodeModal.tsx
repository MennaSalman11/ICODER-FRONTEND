
// "use client";

// import { useEffect, useState } from "react";
// import { X, Copy, Check, Code2, EyeOff } from "lucide-react";
// import { toggleSubmissionOpenness } from "@/src/lib/services/submitCode.services";
// import { useSession } from "next-auth/react";

// interface CodeModalProps {
//   submissionId: number | null;
//   verdict: string;
//   isOpen: boolean;
//   ownerHandle: string;
//   onClose: () => void;
// }

// export default function CodeModal({ submissionId, verdict, isOpen, ownerHandle, onClose }: CodeModalProps) {
//   const { data: session } = useSession();
//   const isOwner = session?.user?.handle === ownerHandle || session?.user?.name === ownerHandle;

//   const [code, setCode] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [currentlyOpen, setCurrentlyOpen] = useState(isOpen);
//   const [isToggling, setIsToggling] = useState(false);

//   useEffect(() => {
//     setCurrentlyOpen(isOpen);
//   }, [isOpen]);

//   useEffect(() => {
//     if (submissionId === null) return;
//     const stored = localStorage.getItem(`submission_code_${submissionId}`);
//     setCode(stored);
//   }, [submissionId]);

//   const handleCopy = () => {
//     if (!code) return;
//     navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleToggle = async () => {
//     if (!submissionId || isToggling) return;
//     setIsToggling(true);
//     try {
//       const newValue = await toggleSubmissionOpenness(submissionId);
//       setCurrentlyOpen(newValue);
//     } catch (err) {
//       console.error("Toggle failed:", err);
//     } finally {
//       setIsToggling(false);
//     }
//   };

//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) onClose();
//   };

//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [onClose]);

//   if (submissionId === null) return null;

//   const getVerdictStyle = (v: string) => {
//     const s = v.toLowerCase();
//     if (s === "accepted") return "text-emerald-400 bg-emerald-950/60 border-emerald-800";
//     if (s.includes("wrong")) return "text-red-400 bg-red-950/60 border-red-800";
//     if (s === "failed") return "text-red-400 bg-red-950/60 border-red-800";
//     if (s.includes("runtime")) return "text-orange-400 bg-orange-950/60 border-orange-800";
//     return "text-gray-400 bg-gray-900 border-gray-700";
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
//       onClick={handleBackdropClick}
//     >
//       <div className="relative w-full max-w-3xl mx-4 bg-[#0d1117] border border-gray-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

//         {/* Header */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/60">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-900/40 rounded-lg border border-blue-800/50">
//               <Code2 className="w-4 h-4 text-blue-400" />
//             </div>
//             <div>
//               <h2 className="text-white font-semibold text-sm">Submission Code</h2>
//               <p className="text-gray-500 text-xs mt-0.5">ID #{submissionId}</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* Verdict badge */}
//             <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getVerdictStyle(verdict)}`}>
//               {verdict}
//             </span>

//             {/* Copy button */}
//             {currentlyOpen && code && (
//               <button
//                 onClick={handleCopy}
//                 className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all"
//               >
//                 {copied ? (
//                   <>
//                     <Check className="w-3.5 h-3.5 text-emerald-400" />
//                     <span className="text-emerald-400">Copied!</span>
//                   </>
//                 ) : (
//                   <>
//                     <Copy className="w-3.5 h-3.5" />
//                     Copy
//                   </>
//                 )}
//               </button>
//             )}

//             {/* Close button */}
//             <button
//               onClick={onClose}
//               className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         {/* Code body */}
//         <div className="overflow-auto flex-1 p-5">
//           {!currentlyOpen ? (
//             <div className="flex flex-col items-center justify-center py-16 text-center">
//               <div className="p-4 bg-gray-800/50 rounded-full mb-4">
//                 <EyeOff className="w-8 h-8 text-gray-500" />
//               </div>
//               <p className="text-gray-300 font-semibold">This submission is private</p>
//               <p className="text-gray-600 text-sm mt-1">
//                 The author has set this submission to private.
//               </p>
//             </div>
//           ) : code ? (
//             <pre className="text-sm text-gray-200 font-mono leading-relaxed whitespace-pre-wrap break-words">
//               {code}
//             </pre>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-16 text-center">
//               <div className="p-4 bg-gray-800/50 rounded-full mb-4">
//                 <Code2 className="w-8 h-8 text-gray-600" />
//               </div>
//               <p className="text-gray-400 font-medium">Code not available</p>
//               <p className="text-gray-600 text-sm mt-1">
//                 This submission was made before code storage was enabled.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-5 py-3 border-t border-gray-700/60 flex items-center justify-between">
//           <div className="flex gap-1.5">
//             <span className="w-3 h-3 rounded-full bg-red-500/70" />
//             <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
//             <span className="w-3 h-3 rounded-full bg-green-500/70" />
//           </div>

//           <div className="flex items-center gap-6">
//             {/* Line count */}
//             {currentlyOpen && code && (
//               <span className="text-gray-600 text-xs">
//                 {code.split("\n").length} lines
//               </span>
//             )}

//             {/* Checkbox — owner only */}
//             {isOwner && (
//               <label className={`flex items-center gap-2 cursor-pointer select-none ${isToggling ? "opacity-50 pointer-events-none" : ""}`}>
//                 <div className="relative">
//                   <input
//                     type="checkbox"
//                     checked={currentlyOpen}
//                     onChange={handleToggle}
//                     className="sr-only"
//                   />
//                   <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
//                     ${currentlyOpen
//                       ? "bg-blue-600 border-blue-600"
//                       : "bg-transparent border-gray-500"
//                     }`}
//                   >
//                     {currentlyOpen && (
//                       <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//                 <span className="text-gray-400 text-xs font-medium">
//                   {isToggling ? "Saving..." : "Public"}
//                 </span>
//               </label>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, Code2, EyeOff } from "lucide-react";
import { toggleSubmissionOpenness } from "@/src/lib/services/submitCode.services";
import { useSession } from "next-auth/react";

interface CodeModalProps {
  submissionId: number | null;
  verdict: string;
  isOpen: boolean;
  ownerHandle: string;
  onClose: () => void;
}

export default function CodeModal({ submissionId, verdict, isOpen, ownerHandle, onClose }: CodeModalProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.handle === ownerHandle || session?.user?.name === ownerHandle;

  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentlyOpen, setCurrentlyOpen] = useState(isOpen);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setCurrentlyOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (submissionId === null) return;
    const stored = localStorage.getItem(`submission_code_${submissionId}`);
    setCode(stored);
  }, [submissionId]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    if (!submissionId || isToggling) return;
    setIsToggling(true);
    try {
      const newValue = await toggleSubmissionOpenness(submissionId);
      setCurrentlyOpen(newValue);
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (submissionId === null) return null;

  const getVerdictStyle = (v: string) => {
    const s = v.toLowerCase();
    if (s === "accepted") return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (s.includes("wrong")) return "text-red-700 bg-red-50 border-red-200";
    if (s === "failed") return "text-red-700 bg-red-50 border-red-200";
    if (s.includes("runtime")) return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-slate-600 bg-slate-100 border-slate-200";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-3xl mx-4 bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] flex flex-col max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
              <Code2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold text-sm">Submission Code</h2>
              <p className="text-slate-500 text-xs mt-0.5">ID #{submissionId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Verdict badge */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getVerdictStyle(verdict)}`}>
              {verdict}
            </span>

            {/* Copy button */}
            {currentlyOpen && code && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code body */}
        <div className="overflow-auto flex-1 p-5 bg-gradient-to-b from-white to-slate-50/80">
          {!currentlyOpen ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-slate-100 rounded-full mb-4 border border-slate-200">
                <EyeOff className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold">This submission is private</p>
              <p className="text-slate-500 text-sm mt-1">
                The author has set this submission to private.
              </p>
            </div>
          ) : code ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-inner overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/90">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <span className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <span className="text-slate-500 text-xs">
                  {code.split("\n").length} lines
                </span>
              </div>

              <pre className="text-sm text-slate-800 font-mono leading-relaxed whitespace-pre-wrap break-words p-5">
                {code}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-slate-100 rounded-full mb-4 border border-slate-200">
                <Code2 className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">Code not available</p>
              <p className="text-slate-500 text-sm mt-1">
                This submission was made before code storage was enabled.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>

          <div className="flex items-center gap-6">
            {/* Line count */}
            {currentlyOpen && code && (
              <span className="text-slate-500 text-xs">
                {code.split("\n").length} lines
              </span>
            )}

            {/* Checkbox — owner only */}
            {isOwner && (
              <label className={`flex items-center gap-2 cursor-pointer select-none ${isToggling ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={currentlyOpen}
                    onChange={handleToggle}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                    ${currentlyOpen
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-slate-400"
                    }`}
                  >
                    {currentlyOpen && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-medium">
                  {isToggling ? "Saving..." : "Public"}
                </span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}