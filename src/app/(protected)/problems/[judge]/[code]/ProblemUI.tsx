"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Send, Presentation, Settings, RotateCcw, 
  MessageSquare, Play, Database, ChevronLeft, Clock 
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {Whiteboard} from "Whiteboard"
import dynamic from "next/dynamic";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

import { MathJax } from "better-react-mathjax";
const normalizeHtml = (html = "") => {
  return html
    .replace(/<span class="math math-inline">(.*?)<\/span>/g, (_, expr) => `\\(${expr}\\)`)
    .replace(/<\/p>\s*\\\((.*?)\\\)\s*<p>/g, (_, expr) => ` \\(${expr}\\) `);
};

export default function ProblemUI({ data }: { data: any }) {
  const [language, setLanguage] = useState("C++ (G++ 11)");

  useEffect(() => {
    if (data?.problem_title) {
      toast.success(`Loaded: ${data.problem_title}`, {
        position: 'top-right',
      });
    }
  }, [data]);

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
                {data?.problem_code}. {data?.problem_title}
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100 uppercase">
                {data?.online_judge}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
               <span className="flex items-center gap-1"><Clock className="size-3" /> 1.00 S</span>
               <span className="flex items-center gap-1"><Database className="size-3" /> 512 MB</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            className="bg-gray-100 text-[11px] border-none rounded px-2 py-1.5 font-semibold focus:ring-0 cursor-pointer"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>C++ (G++ 11)</option>
            <option>Python 3.10</option>
            <option>Java 17</option>
          </select>
          <button className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded text-[11px] font-bold transition-all border">
            <Play className="size-3.5 fill-gray-600" /> Run Samples
          </button>
          <button 
            onClick={() => toast.success("Submitting solution...")}
            className="flex items-center gap-2 bg-[#1a4b8f] text-white px-5 py-1.5 rounded text-[11px] font-bold hover:bg-[#153a6f] shadow-sm transition-all"
          >
            <Send className="size-3.5" /> Submit
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
              
              {/* --- تابة الوصف --- */}
              <TabsContent value="description" className="m-0 animate-in fade-in duration-500">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">{data?.problem_title}</h1>
                  <RotateCcw className="size-5 text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" />
                </div>

                {/* Properties Cards */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                  {data?.properties?.map((prop: any) => (
                    <div key={prop.property_id} className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{prop.title}</p>
                      <p className="text-sm font-bold text-gray-700">{prop.content}</p>
                    </div>
                  ))}
                </div>

                {/* Sections with MathJax */}
                <div className="space-y-10">
                  {data?.sections?.sort((a: any, b: any) => a.order_index - b.order_index).map((section: any) => {
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

              {/* --- submission tab  --- */}
              <TabsContent value="submissions" className="m-0 animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center py-20 w-full text-center">
                  <div className="size-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin mb-4"></div>
                  <p className="text-slate-500 font-medium">Loading submissions...</p>
                  <span className="text-xs text-slate-400">Fetching your previous attempts</span>
                </div>
              </TabsContent>

              {/* ---whiteboard tab --- */}
             <TabsContent value="whiteboard" className="m-0 h-full flex-1 animate-in fade-in duration-500 overflow-hidden">
  <Whiteboard/>
</TabsContent>

            </div>
          </Tabs>
        </div>

        {/* Right Side: Mock Editor */}
        <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
          <div className="h-10 bg-[#252526] flex items-center justify-between px-4 border-b border-white/5">
             <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Main.cpp</span>
             </div>
             <Settings className="size-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          </div>
          
          <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed select-none">
             <p className="text-pink-500">#include <span className="text-orange-300">&lt;iostream&gt;</span></p>
             <p className="text-blue-400">using namespace <span className="text-green-300">std</span>;</p>
             <br />
             <p className="text-blue-400">int <span className="text-yellow-400">main</span>() {"{"}</p>
             <p className="pl-6 text-gray-500 italic">// Start solving "{data?.problem_title}"</p>
             <p className="pl-6 text-white tracking-wider">&nbsp;&nbsp;cout &lt;&lt; "Happy Coding!" &lt;&lt; endl;</p>
             <p className="pl-6 text-blue-400">&nbsp;&nbsp;return <span className="text-orange-300">0</span>;</p>
             <p className="text-white">{"}"}</p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .tab-style {
          @apply rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 text-[12px] font-bold text-gray-400 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        /* ستايل إضافي عشان الـ HTML اللي جاي من الباك ميبقاش لازق في بعضه */
        .problem-html-content p { margin-bottom: 1rem; }
        .problem-html-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .problem-html-content pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; font-family: monospace; }
      `}</style>
    </div>
  );
}