"use client";

import Editor from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Send, Presentation, Settings, RotateCcw,
  MessageSquare, Play, Database, ChevronLeft, Clock
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Whiteboard from "./Whiteboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; 

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

import { MathJax } from "better-react-mathjax";
import { getSpecificProblemByCrawler } from "@/src/lib/services/specificProblem.services";
import { useProblem } from "@/src/components/context/problemContext";
import { getBatchSubmissionResult, getSubmissionResult, submitBatchCode, submitCode } from "@/src/lib/services/codingEditor.services";
import { getActiveTemplateByLanguag } from "@/src/lib/services/templates.services";
import Submissions from "./Submissions";
import AllSubmit from "./AllSubmit";

const normalizeHtml = (html = "") => {
  return html
    .replace(/<span class="math math-inline">(.*?)<\/span>/g, (_, expr) => `\\(${expr}\\)`)
    .replace(/<\/p>\s*\\\((.*?)\\\)\s*<p>/g, (_, expr) => ` \\(${expr}\\) `);
};

export default function ProblemUI({ data }: { data: any }) {
  const { data: session } = useSession();
  const router = useRouter(); 

  const {
    languages,
    selectedLanguage,
    changeLanguage,
    sourceCode,
    setSourceCode
  } = useProblem();

  const [isMounted, setIsMounted] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [executionOutput, setExecutionOutput] = useState("");
  const currentLangObj = languages.find((l: any) => l.id === selectedLanguage);
  const [currentData, setCurrentData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState<any[]>([]);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
const toastShown = useRef(false);
useEffect(() => {
  setIsMounted(true);
  if (data?.problem_title && !toastShown.current) {
    toastShown.current = true;
    toast.success(`Loaded: ${data.problem_title}`, {
      position: 'top-right',
    });
  }
}, []);

  const handleCrawlerRefresh = async () => {
    setLoading(true);
    toast.info("Fetching latest data from judge...");
    try {
      const crawlerRes = await getSpecificProblemByCrawler(
        currentData.online_judge,
        currentData.problem_code
      );
      if (crawlerRes && !crawlerRes.status) {
        setCurrentData(crawlerRes);
        toast.success("Data updated successfully!");
      } else {
        toast.error("Failed to sync: " + (crawlerRes.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error details:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const extractTestCases = () => {
    const exampleSection = currentData?.sections?.find(
      (s: any) => s.title === "Example" || s.title === "Sample"
    );

    if (!exampleSection || !exampleSection.contents) return [];

    const testCases: any[] = [];
    const contents = exampleSection.contents;

    for (let i = 0; i < contents.length; i++) {
      const text = contents[i].content || "";

      if (text.includes("Input:")) {
        const inputRaw = contents[i + 1]?.content || "";
        const outputRaw = contents[i + 3]?.content || "";

        const cleanInput = inputRaw.replace(/<[^>]*>/g, "").trim();
        const cleanOutput = outputRaw.replace(/<[^>]*>/g, "").trim();

        if (cleanInput || cleanOutput) {
          testCases.push({
            input: cleanInput,
            expected_output: cleanOutput
          });
        }
      }
    }

    if (testCases.length === 0) {
      const cleanInput = (contents[1]?.content || "").replace(/<[^>]*>/g, "").trim();
      const cleanOutput = (contents[3]?.content || "").replace(/<[^>]*>/g, "").trim();
      if (cleanInput) testCases.push({ input: cleanInput, expected_output: cleanOutput });
    }

    return testCases;
  };

  const handleRunSamples = async () => {
    if (!sourceCode.trim() || sourceCode.trim() === " " || sourceCode.toLowerCase().includes("welcome to")) {
      toast.error("Please write your code in the editor before running samples.");
      return;
    }
    
    setLoading(true);
    setExecutionOutput("Processing... ⏳");
    setTestCaseResults([]);

    try {
      if (customInput.trim() !== "") {
        const payload = {
          source_code: sourceCode,
          language_id: Number(selectedLanguage),
          stdin: customInput,
        };

        const res = await submitCode(payload);
        if (!res.token) {
          toast.error("Failed to execute code: No token received.");
          setLoading(false);
          return;
        }

        let isFinished = false;
        while (!isFinished) {
          const result = await getSubmissionResult(res.token);
          if (result.status && result.status.id >= 3) {
            setExecutionOutput(result.stdout || result.stderr || result.compile_output || "No output");
            isFinished = true;
            toast.success("Single test executed!");
          } else {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      } else {
        const tests = extractTestCases();
        if (tests.length === 0) {
          toast.error("No sample cases found in problem description.");
          setLoading(false);
          return;
        }

        const batchPayload = {
          source_code: sourceCode,
          language_id: Number(selectedLanguage),
          test_inputs: tests,
        };
        const tokensRes = await submitBatchCode(batchPayload);

        const tokens = Array.isArray(tokensRes)
          ? tokensRes.map((t: any) => t.token)
          : (tokensRes.tokens || []).map((t: any) => t.token);

        if (tokens.length === 0) {
          toast.error("Error: No tokens received from server.");
          setLoading(false);
          return;
        }
        let isFinished = false;
        while (!isFinished) {
          const resultData = await getBatchSubmissionResult(tokens);
          const submissions = resultData.submissions || [];
          setTestCaseResults(submissions);

          isFinished = submissions.every((s: any) => s.status.id >= 3);

          if (isFinished) {
            const finalData = submissions || [];
            const failedSubmissions = finalData.filter((s: any) => Number(s.status.id) > 3);
            const passedSubmissions = finalData.filter((s: any) => Number(s.status.id) === 3);

            if (failedSubmissions.length > 0) {
              const failedCase = failedSubmissions[0];
              setExecutionOutput(`❌ Error: Failed on ${failedSubmissions.length} samples.\nStatus: ${failedCase.status.description}`);
              toast.error("Some samples failed.");
            } else if (passedSubmissions.length > 0) {
              setExecutionOutput("✅ Success: All sample test cases passed!");
              toast.success("Perfect! All samples passed.");
            } else {
              setExecutionOutput("Results processed, but no matching status found.");
            }
          } else {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✨ التعديل وإضافة الحماية هنا لمنع الـ 500 Error عند تحميل الـ Template الافتراضي
useEffect(() => {
  // 1. إذا لم تكن المكونات جاهزة، لا تفعل شيئاً
  if (!isMounted || !selectedLanguage) return;

  const fetchTemplate = async () => {
    const langId = Number(selectedLanguage);
    const token = (session as any)?.accessToken;

    try {
      // 2. نحاول جلب التمبلت دائماً إذا كان لدينا token
      if (token) {
        const activeTemplate = await getActiveTemplateByLanguag(langId, token);
        if (activeTemplate?.code) {
          setSourceCode(activeTemplate.code);
          return;
        }
      }
      
      // 3. إذا لم يوجد تمبلت أو حدث خطأ، نستخدم الـ Fallback
      if (currentLangObj) {
        setSourceCode(`// Welcome to ${currentLangObj.name}\n\nint main() {\n    return 0;\n}`);
      }
    } catch (error) {
      console.error("Error loading template:", error);
      // في حالة الخطأ، نضع الكود الافتراضي أيضاً لضمان عدم بقاء المحرر فارغاً
      if (currentLangObj) {
        setSourceCode(`// Welcome to ${currentLangObj.name}\n\nint main() {\n    return 0;\n}`);
      }
    }
  };

  fetchTemplate();
}, [selectedLanguage, session, isMounted, currentLangObj, setSourceCode]);

  return (
<div className="flex flex-col h-[calc(100vh)] w-full bg-[#f8f9fa] overflow-hidden text-black pt-14 relative">
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm relative z-[999]">
        <div className="flex items-center gap-4 min-w-0">
       <button 
  onClick={() => router.back()}
  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
>
  <ChevronLeft className="size-5 text-gray-500" />
</button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-gray-800 text-sm tracking-tight truncate">
                {currentData?.problem_code}. {currentData?.problem_title}
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100 uppercase shrink-0">
                {currentData?.online_judge}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5 shrink-0">
              <span className="flex items-center gap-1"><Clock className="size-3" /> 1.00 S</span>
              <span className="flex items-center gap-1"><Database className="size-3" /> 512 MB</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4 shrink-0 min-w-max">
          <select
            className="bg-gray-100 text-[11px] border-none rounded px-2 py-1.5 font-semibold focus:ring-0 cursor-pointer"
            value={selectedLanguage}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            {languages.map((lang: any) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          
          {/* Run Samples */}
          <button
            onClick={handleRunSamples}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-all border shrink-0
              ${loading ? 'bg-gray-50 cursor-not-allowed text-gray-300 border-gray-100' : 'text-gray-600 hover:bg-gray-100 border-gray-200 active:scale-95'}`}
          >
            <Play className={`size-3.5 ${loading ? 'text-green-400' : 'fill-green-600'}`} />
            {loading ? "Running..." : "Run Samples"}
          </button>

          <button
            onClick={() => setIsSubmitOpen(true)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-all border text-white bg-[#314b87] hover:bg-[#3b5aa2] active:scale-95 shadow-sm shrink-0"
          >
            <Send className="size-3.5 fill-white" />
            Submit
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Tabs */}
        <div className="w-1/2 flex flex-col bg-white border-r">
          <Tabs defaultValue="description" className="flex flex-col h-full">
            <div className="px-4 border-b shrink-0">
              <TabsList className="bg-transparent h-12 gap-6 justify-start">
                <TabsTrigger value="description" className="tab-style">
                  <FileText className="size-4 mr-2" /> Description
                </TabsTrigger>
                <TabsTrigger value="submissions" className="tab-style">
                  <MessageSquare className="size-4 mr-2" /> Submissions
                </TabsTrigger>
                <TabsTrigger value="whiteboard" className="tab-style">
                  <Presentation className="size-4 mr-2" /> Whiteboard
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <TabsContent value="description" className="m-0 animate-in fade-in duration-500">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">{currentData?.problem_title}</h1>
                  <button
                    onClick={handleCrawlerRefresh}
                    disabled={loading}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${loading ? 'animate-spin' : ''}`}
                  >
                    <RotateCcw className={`size-5 ${loading ? 'text-blue-500' : 'text-gray-300'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {currentData?.properties?.map((prop: any) => (
                    <div key={prop.property_id} className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{prop.title}</p>
                      <p className="text-sm font-bold text-gray-700">{prop.content}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-10">
                  {isMounted && currentData?.sections?.sort((a: any, b: any) => a.order_index - b.order_index).map((section: any) => {
                    const combinedContent = (section.contents || section.content_scrape_dtos || [])
                      .sort((a: any, b: any) => a.order_index - b.order_index)
                      .map((c: any) => c.content)
                      .join("");

                    return (
                      <MathJax key={section.section_id} dynamic>
                        <div className="mb-8">
                          {section.title && (
                            <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">
                              {section.title}
                            </h3>
                          )}
                          <div
                            className="text-[15px] text-gray-700 leading-relaxed font-normal problem-html-content"
                            dangerouslySetInnerHTML={{ __html: normalizeHtml(combinedContent) }}
                          />
                        </div>
                      </MathJax>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="tab-style">
               <AllSubmit/>
              </TabsContent>

              <TabsContent value="whiteboard" className="tab-style">
                <Whiteboard />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Side: Editor + IO Sections */}
        <div className="w-1/2 flex flex-col bg-[#1e1e1e] border-l border-white/5 h-full">
          <div className="h-10 bg-[#252526] flex items-center justify-between px-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
                Main.{currentLangObj?.name || 'cpp'}
              </span>
            </div>
            <Settings className="size-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          </div>

          <div className="flex-1 border-b border-white/5 overflow-hidden">
            <Editor
              height="100%"
              language={currentLangObj?.monaco_name || "cpp"}
              theme="vs-dark"
              value={sourceCode}
              onChange={(value) => setSourceCode(value || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 20 }
              }}
            />
          </div>

          <div className="h-56 bg-[#1e1e1e] flex flex-col shrink-0">
            <div className="flex h-full border-t border-white/10">
              {/* Custom Input */}
              <div className="w-1/2 flex flex-col border-r border-white/10">
                <div className="px-4 py-2 bg-gray-100 flex items-center gap-2 ">
                  <Database className="size-3.5 text-blue-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter my-2">Custom Input</span>
                </div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 bg-gray-200 p-4 text-gray-900 font-mono text-[12px] outline-none resize-none placeholder:text-gray-700 custom-scrollbar "
                  placeholder="Enter input parameters here..."
                />
              </div>

              {/* Output */}
              <div className="w-1/2 flex flex-col bg-gray-200">
                <div className="px-4 py-2 bg-gray-100 flex items-center gap-2">
                  <Play className="size-3.5 text-green-400 my-2" />
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">Execution Output</span>
                </div>

                <div className="flex-1 p-4 font-mono text-[12px] text-gray-900 overflow-y-auto custom-scrollbar bg-gray-200">
                  {testCaseResults.length > 0 && customInput.trim() === "" && (
                    <div className="mb-4 space-y-2">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Sample Cases Status:</p>
                      {testCaseResults.map((res, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-300 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400">SAMPLE {index + 1}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${Number(res.status.id) === 3 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {res.status.description}
                          </span>
                        </div>
                      ))}
                      <div className="h-[1px] bg-gray-300 my-4" />
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-bold">
                    {executionOutput || 'Output will appear here after clicking "Run Samples"...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---- الـ Pop-up Window (Modal) ---- */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-[90%] max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Send className="size-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-800">New Submission</h3>
              </div>
              <button 
                onClick={() => setIsSubmitOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 hover:bg-gray-200 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar text-black">
              <Submissions /> 
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .tab-style {
          @apply rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 text-[12px] font-bold text-gray-400 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .problem-html-content p { margin-bottom: 1rem; }
        .problem-html-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .problem-html-content pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; font-family: monospace; }
      `}</style>
    </div>
  );
}