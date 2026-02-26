"use client";

import React, { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link'; 


const initialTemplates = [
  { id: 1, name: "React Functional Component", autoApply: true, language: "JavaScript", color: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Python Data Analysis Setup", autoApply: false, language: "Python", color: "bg-indigo-100 text-indigo-700" },
  { id: 3, name: "Tailwind Flex Container", autoApply: false, language: "HTML", color: "bg-purple-100 text-purple-700" },
  { id: 4, name: "Node.js Express Basic", autoApply: true, language: "Node.js", color: "bg-slate-100 text-slate-700" },
  { id: 5, name: "C++ Basic Template", autoApply: true, language: "C++", color: "bg-blue-100 text-blue-700" },
  { id: 6, name: "C# Console Starter", autoApply: false, language: "C#", color: "bg-indigo-100 text-indigo-700" },
  { id: 7, name: "Java Basic Setup", autoApply: true, language: "Java", color: "bg-purple-100 text-purple-700" },
];

export default function CodeTemplatePage() {
  const [templates, setTemplates] = useState(initialTemplates);

  const handleToggle = (id: number) => {
    setTemplates(prev => prev.map(item => 
      item.id === id ? { ...item, autoApply: !item.autoApply } : item
    ));
    
    // هنا تقدر تنادي الـ API بتاعك
    // console.log("Updating template:", id);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Code Templates</h1>
            <p className="text-slate-500 mt-2 max-w-md">
              Manage your reusable code snippets to speed up your development workflow.
            </p>
          </div>
          <Button asChild className="bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-6 rounded-xl flex gap-2 shrink-0">
            <Link href="code-templates/create-template">  
              <Plus size={22} /> Create New Template
            </Link>
          </Button>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-4 md:p-8 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[13px] uppercase tracking-wider font-bold">
                <th className="pb-4 px-6">Template Name</th>
                <th className="pb-4 px-6">Auto-apply</th>
                <th className="pb-4 px-6 text-center">Language</th>
                <th className="pb-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="py-5 px-6 font-bold text-[#1e293b]  bg-white group-hover:bg-slate-50/80 rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100">
                    {item.name}
                  </td>
                  <td className="py-5 px-6 bg-white group-hover:bg-slate-50/80 border-y border-transparent group-hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={item.autoApply} 
                        onCheckedChange={() => handleToggle(item.id)}
                      />
                      <span className={`text-sm font-bold w-8 ${item.autoApply ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.autoApply ? 'On' : 'Off'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center bg-white group-hover:bg-slate-50/80 border-y border-transparent group-hover:border-slate-100">
                    <Badge variant="secondary" className={`${item.color} px-4 py-1.5 rounded-full text-xs font-bold border-none`}>
                      {item.language}
                    </Badge>
                  </td>
                  <td className="py-5 px-6 bg-white group-hover:bg-slate-50/80 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100">
                    <div className="flex items-center justify-center gap-4">
                      <button className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-white rounded-full shadow-sm">
                        <Pencil size={20} strokeWidth={2} />
                      </button>
                      <button className="text-red-300 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-full shadow-sm">
                        <Trash2 size={20} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Bottom */}
          <div className="flex items-center gap-2 mt-8">
            <Button variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 px-3">
              <ChevronLeft size={16} className="mr-1"/> Prev
            </Button>
            <Button className="bg-[#1e3a8a] hover:bg-blue-900 w-10 h-10 rounded-xl shadow-md shadow-blue-100">1</Button>
            <Button variant="ghost" className="text-slate-500 w-10 h-10 hover:bg-slate-100 rounded-xl font-bold">2</Button>
            <Button variant="ghost" className="text-slate-500 w-10 h-10 hover:bg-slate-100 rounded-xl font-bold">3</Button>
            <span className="text-slate-400 px-2 font-bold">..</span>
            <Button variant="ghost" className="text-slate-500 w-10 h-10 hover:bg-slate-100 rounded-xl font-bold">5</Button>
            <Button variant="ghost" className="text-slate-900 font-bold hover:bg-slate-100 px-3">
              Next <ChevronRight size={16} className="ml-1"/>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}