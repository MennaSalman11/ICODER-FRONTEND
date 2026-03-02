"use client";

import Editor from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Send, Presentation, Settings, RotateCcw, 
  MessageSquare, Play, Database, ChevronLeft, Clock 
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Whiteboard from "./Whiteboard";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

import { MathJax } from "better-react-mathjax";
import { getSpecificProblemByCrawler } from "@/src/lib/services/specificProblem.services";
import { useProblem } from "@/src/components/context/problemContext";
import { getBatchSubmissionResult, getSubmissionResult, submitBatchCode, submitCode } from "@/src/lib/services/codingEditor.services";
import { BatchSubmissionSchema, SubmissionSchema } from "@/src/schema/submission.schema";
import { set } from "zod";
import test from "node:test";

const normalizeHtml = (html = "") => {
  return html
    .replace(/<span class="math math-inline">(.*?)<\/span>/g, (_, expr) => `\\(${expr}\\)`)
    .replace(/<\/p>\s*\\\((.*?)\\\)\s*<p>/g, (_, expr) => ` \\(${expr}\\) `);
};

export default function ProblemUI({ data, languagesList }: { data: any, languagesList: any }) {
  
  const {
    languages,
     selectedLanguage,
      changeLanguage,
      sourceCode,
      setSourceCode
  } =useProblem();
  // ✅ 1. لمنع Hydration Error
  const [isMounted, setIsMounted] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [executionOutput, setExecutionOutput] = useState("");
  const currentLangObj = languages.find((l: any) => l.id === selectedLanguage);
console.log("Current language object:", currentLangObj);
  const [currentData, setCurrentData] = useState(data);
  const [loading, setLoading] = useState(false);
 // لتخزين الكود اللي اليوزر بيكتبه
console.log('currentData:', currentData);
  useEffect(() => {
    setIsMounted(true); // أول ما الـ Component يفتح في المتصفح
    if (data?.problem_title) {
      toast.success(`Loaded: ${data.problem_title}`, {
        position: 'top-right',
      });
    }
  }, [data]);
const [testCaseResults, setTestCaseResults] = useState<any[]>([]);
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
  // 1. البحث عن سيكشن الأمثلة
  const exampleSection = currentData?.sections?.find(
    (s: any) => s.title === "Example" || s.title === "Sample"
  );
  
  if (!exampleSection || !exampleSection.contents) return [];

  const testCases: any[] = [];
  const contents = exampleSection.contents;

  // 2. Loop على المحتويات لسحب كل Input وما يليه من Output
  for (let i = 0; i < contents.length; i++) {
    const text = contents[i].content || "";
    
    // لو لقينا كلمة Input في المحتوى، غالباً اللي بعدها هو الـ Input واللي بعد بعده هو الـ Output
    if (text.includes("Input:")) {
      const inputRaw = contents[i + 1]?.content || "";
      const outputRaw = contents[i + 3]?.content || ""; // تخطي كلمة "Output:" للوصول للمحتوى

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

  // ملحوظة: لو الطريقة اللي فوق منفعش مع شكل الـ HTML المعين بتاع الـ Judge ده
  // ممكن نستخدم fallback بسيط بياخد أول مثال كاحتياطي:
  if (testCases.length === 0) {
     const cleanInput = (contents[1]?.content || "").replace(/<[^>]*>/g, "").trim();
     const cleanOutput = (contents[3]?.content || "").replace(/<[^>]*>/g, "").trim();
     if(cleanInput) testCases.push({ input: cleanInput, expected_output: cleanOutput });
  }

  console.log("Extracted Test Cases:", testCases);
  return testCases;
};

const handleRunSamples = async () => {
  setLoading(true);
  setExecutionOutput("Processing... ⏳");
  setTestCaseResults([]); // تصفير نتائج الباتش القديمة

  try {
    // --- الحالة الأولى: تجربة Input يدوي (نقطة 3 و 4 في الريكورد) ---
    if (customInput.trim() !== "") {
      const payload = {
        source_code: sourceCode,
        language_id: Number(selectedLanguage),
        stdin: customInput,
      };

      const res = await submitCode(payload);
      if (!res.token) {
        setExecutionOutput(res.stdout || "Error: No token received");
        setLoading(false);
        return;
      }

      let isFinished = false;
      while (!isFinished) {
        const result = await getSubmissionResult(res.token);
        if (result.status && result.status.id >= 3) {
          // عرض النتيجة الفردية مباشرة في الـ Output
          setExecutionOutput(result.stdout || result.stderr || result.compile_output || "No output");
          isFinished = true;
          toast.success("Single test executed!");
        } else {
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    } 
    
    // --- الحالة الثانية: تجربة كل الأمثلة "Batch" (نقطة 5 و 6 في الريكورد) ---
    else {
      const tests = extractTestCases(); // سحب الـ Examples من المسألة
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

      // 1. إرسال طلب الباتش (POST)
console.log("Payload being sent:", batchPayload);
      // 1. إرسال طلب الباتش (POST)
const tokensRes = await submitBatchCode(batchPayload);

// تأكدي إننا بناخد المصفوفة صح (سواء كانت هي الرد مباشرة أو جوه property)
const tokens = Array.isArray(tokensRes) 
  ? tokensRes.map((t: any) => t.token) 
  : (tokensRes.tokens || []).map((t: any) => t.token);

if (tokens.length === 0) {
  setExecutionOutput("Error: No tokens received from server.");
  setLoading(false);
  return;
}
      let isFinished = false;
      while (!isFinished) {
        // 2. متابعة النتائج (GET Batch) باستخدام الـ Service اللي عندك
        const resultData = await getBatchSubmissionResult(tokens);
        const submissions = resultData.submissions || [];
        setTestCaseResults(submissions);

        // هل كل الـ Tokens خلصت؟ (status.id >= 3)
        isFinished = submissions.every((s: any) => s.status.id >= 3);

if (isFinished) {
    const finalData = submissions || []; 

    // بنستخدم Number() عشان نضمن إن '3' تتحول لـ 3
    const failedSubmissions = finalData.filter((s: any) => Number(s.status.id) > 3);
    const passedSubmissions = finalData.filter((s: any) => Number(s.status.id) === 3);

    if (failedSubmissions.length > 0) {
        const failedCase = failedSubmissions[0];
        setExecutionOutput(`❌ Error: Failed on ${failedSubmissions.length} samples.\nStatus: ${failedCase.status.description}`);
        toast.error("Some samples failed.");
    } else if (passedSubmissions.length > 0) {
        // مبروك! دي اللي هتشتغل دلوقتي لأن Number('3') === 3
        setExecutionOutput("✅ Success: All sample test cases passed!");
        toast.success("Perfect! All samples passed.");
    } else {
        setExecutionOutput("Results processed, but no matching status found.");
    }
}
else {
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



  useEffect(() => {
    if (currentLangObj) {
      setSourceCode(`// Welcome to ${currentLangObj.name}\n\nint main() {\n    return 0;\n}`);
    }
  }, [selectedLanguage]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] overflow-hidden text-black mt-14">
      
      {/* --- Header --- */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="size-5 text-gray-500" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-sm tracking-tight">
                {currentData?.problem_code}. {currentData?.problem_title}
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100 uppercase">
                {currentData?.online_judge}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
               <span className="flex items-center gap-1"><Clock className="size-3" /> 1.00 S</span>
               <span className="flex items-center gap-1"><Database className="size-3" /> 512 MB</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ تعديل الـ Select لاستخدام الحقول الصحيحة */}
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
     <button
  onClick={handleRunSamples}
  disabled={loading} // منعي الضغط أثناء التحميل
  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-all border 
    ${loading ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
>
  <Play className={`size-3.5 ${loading ? 'text-green-400' : 'fill-green-600'}`} />
  {loading ? "Running..." : "Run Samples"}
</button>
          <button 
          disabled={loading} 
            className="cursor-pointer flex items-center gap-2 bg-[#1a4b8f] text-white px-5 py-1.5 rounded text-[11px] font-bold hover:bg-[#153a6f] shadow-sm transition-all"
          >
            <Send className="size-3.5" /> {loading ? "Submitting..." : "Submit"}
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

                {/* ✅ حماية الـ MathJax بـ isMounted */}
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

                  <MessageSquare className="size-4 mr-2" /> Submissions

                </TabsContent>
                <TabsContent value="whiteboard" className="tab-style">

                  <Whiteboard />
                </TabsContent>
              {/* ... باقي التابات كما هي ... */}
            </div>
          </Tabs>
        </div>

     {/* Right Side: Editor + IO Sections */}
<div className="w-1/2 flex flex-col bg-[#1e1e1e] border-l border-white/5 h-full">
  
  {/* Header (زي ما هو) */}
  <div className="h-10 bg-[#252526] flex items-center justify-between px-4 border-b border-white/5 shrink-0">
     <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
          Main.{currentLangObj?.name || 'cpp'}
        </span>
     </div>
     <Settings className="size-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
  </div>
  
  {/* 1. مساحة الـ Editor (هتآخد المساحة اللي فوق كلها) */}
<div className="flex-1 border-b border-white/5 overflow-hidden">
      <Editor
        height="100%"
        // الربط الديناميكي باللغة من الـ Context
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

  {/* 2. منطقة الـ Input والـ Output (زي الصورة اللي بعتيها) */}
  <div className="h-56 bg-[#1e1e1e] flex flex-col shrink-0">
    <div className="flex h-full border-t border-white/10">
      
      {/* قسم الـ Custom Input */}
      <div className="w-1/2 flex flex-col border-r border-white/10">
        <div className="px-4 py-2 bg-gray-100 flex items-center gap-2 ">
          <Database className="size-3.5 text-blue-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter my-2">Custom Input</span>
        </div>
        <textarea 
        value={customInput}
        onChange={(e)=>setCustomInput(e.target.value)}
          className="flex-1 bg-gray-200 p-4 text-gray-900 font-mono text-[12px] outline-none resize-none placeholder:text-gray-700 custom-scrollbar "
          placeholder="Enter input parameters here..."
        />
      </div>

      {/* قسم الـ Output */}
     {/* قسم الـ Output */}
      <div className="w-1/2 flex flex-col bg-gray-200">
        <div className="px-4 py-2 bg-gray-100 flex items-center gap-2">
          <Play className="size-3.5 text-green-400 my-2" />
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">Execution Output</span>
        </div>

        {/* الكود اللي سألتي عليه يتحط هنا بدل الـ div القديم */}
        <div className="flex-1 p-4 font-mono text-[12px] text-gray-900 overflow-y-auto custom-scrollbar bg-gray-200">
          
          {/* عرض نتائج الـ Batch لو موجودة */}
          {testCaseResults.length > 0 && customInput.trim() === "" && (
            <div className="mb-4 space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Sample Cases Status:</p>
              {testCaseResults.map((res, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-300 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400">SAMPLE {index + 1}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
  Number(res.status.id) === 3 
    ? 'bg-green-100 text-green-600' 
    : 'bg-red-100 text-red-600'
}`}>
  {res.status.description}
</span>
                </div>
              ))}
              <div className="h-[1px] bg-gray-300 my-4" />
            </div>
          )}

          {/* عرض النص النهائي (stdout أو رسائل الخطأ) */}
          <div className="whitespace-pre-wrap font-bold">
            {executionOutput || 'Output will appear here after clicking "Run Samples"...'}
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
      </main>

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
