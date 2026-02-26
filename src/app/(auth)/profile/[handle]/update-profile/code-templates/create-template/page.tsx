import React from 'react';
import { Lightbulb, Code2, Terminal, Copy, Check, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function CreateTemplatePage() {
return (
    <>
    <div className="min-h-screen bg-[#f9fafb] p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumbs */}
        <nav className="text-sm text-slate-400 mb-4 flex gap-2">
          <span>Settings</span> <span>›</span> 
          <span>Code Templates</span> <span>›</span> 
          <span className="text-slate-600 font-medium">Create New</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Create New Template</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Define a reusable code snippet for your projects. Save time by automating your most used patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form (Takes 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 space-y-8">
              
              {/* Row 1: Name & Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Template Name</label>
                  <div className="relative">
                    <Copy className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input className="pl-10 bg-slate-50 border-slate-100 h-12 rounded-xl" placeholder="e.g. React Functional Component" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Programming Language</label>
                  <div className="relative">
                    <Code2 className="absolute left-3 top-3 text-slate-400" size={18} />
                    <select className="w-full pl-10 h-12 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                      <option>Select a language</option>
                      <option>JavaScript</option>
                      <option>TypeScript</option>
                      <option>Python</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Code Snippet Editor Area */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Code Snippet</label>
                <div className="bg-[#1e293b] rounded-2xl overflow-hidden shadow-lg">
                  {/* Editor Header */}
                  <div className="bg-[#0f172a] px-4 py-3 flex justify-between items-center border-b border-slate-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-400 text-xs ml-4 font-mono">index.js</span>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-xs gap-1">
                         <Copy size={14} /> Paste
                       </Button>
                       <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white text-xs gap-1">
                         <Terminal size={14} /> Format
                       </Button>
                    </div>
                  </div>
                  {/* Editor Body */}
                  <div className="p-6 font-mono text-sm leading-relaxed">
                    <div className="flex gap-4">
                      <div className="text-slate-600 text-right select-none">
                        1<br/>2<br/>3<br/>4<br/>5<br/>6
                      </div>
                      <div className="text-slate-300 italic">
                        // Start typing your code template here...
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Use placeholders like <code className="text-blue-500 font-bold">{"${variable}"}</code> for dynamic content insertion.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 px-8">
                Cancel
              </Button>
              <Button className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-10 py-6 rounded-xl font-bold shadow-lg shadow-indigo-100">
                Save Template
              </Button>
            </div>
          </div>

          {/* Right Column: Sidebar (Takes 1/3) */}
          <div className="space-y-6">
            {/* Pro Tip Card */}
            <div className="bg-[#fcfdfd] border border-slate-100 rounded-[24px] p-8 shadow-sm">
              <div className="bg-slate-100 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Lightbulb className="text-slate-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Pro Tip</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Templates are most effective when they are generic enough to be reused but specific enough to save setup time.
              </p>
              
              <div className="h-px bg-slate-100 my-6"></div>
              
              <h4 className="text-sm font-bold text-slate-800 mb-4">Recently Used Variables</h4>
              <div className="flex flex-wrap gap-2">
                {['${componentName}', '${date}', '${author}'].map(v => (
                  <span key={v} className="bg-white border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-500">
                    {v}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                 <h4 className="text-sm font-bold text-slate-800 mb-4">Preview</h4>
                 <div className="bg-slate-200 rounded-xl aspect-video overflow-hidden relative group cursor-pointer">
                    <div className="absolute inset-0 bg-slate-800/20 group-hover:bg-slate-800/10 transition-colors"></div>
                    <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop" 
                         className="w-full h-full object-cover opacity-50" alt="preview" />
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
);
}