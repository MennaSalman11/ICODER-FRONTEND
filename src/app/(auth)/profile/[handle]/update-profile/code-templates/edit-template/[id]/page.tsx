"use client";

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronRight, Code2, ClipboardList, Type, Clipboard, Sparkles } from 'lucide-react';
import { useProblem } from '@/src/components/context/problemContext';
import { useTemplateContext } from '@/src/components/context/TemplatesContext';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {  editTemplate } from '@/src/lib/services/templates.services';
import { useRouter } from 'next/navigation'; // اختياري للتحويل بعد النجاح
import { Editor } from '@monaco-editor/react';

// Schema
const templateSchema = z.object({
  template_name: z.string().min(3, "the template name should be at least 3 characters"),
  language_id: z.string().min(1, "choose a programming language"),
  code: z.string().min(5, "write the code for your template"),

});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function CreateTemplatePage() {
  const { data: session } = useSession();
  const { languages , selectedLanguage} = useProblem();
  const { setPage ,  selectedTemplate
  } = useTemplateContext(); 
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form Setup
  const { register, handleSubmit, watch, control,reset ,formState: { errors } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      code:selectedTemplate?.code ,
      language_id:selectedTemplate?.language_id.toString(),
      template_name: selectedTemplate?.template_name
    }
  });
const selectedLanguageId = watch("language_id");
const currentLanguage = languages.find(lang => lang.id === (selectedLanguageId));
  const onSubmit = async (data: TemplateFormData) => {
    const token = (session as any)?.accessToken;
if (!selectedTemplate?.template_id) {
    toast.error("Template selection error");
    return;
  }
    if (!token) {
      toast.error("no token found, please login again");
      return;
    }
const templateIdAsNumber = Number(selectedTemplate.template_id);
    try {
      setIsLoading(true);
      
      const Payload = {
        template_name: data.template_name,
        language_id: Number(data.language_id), 
        code: data.code,
        created_and_updated_at: new Date().toISOString()
      };

      await editTemplate(Payload, templateIdAsNumber);
      
      toast.success("Edit Templates successfully");
      
      setPage(0); 
            setTimeout(() => router.back(), 1500);

    } catch (error) {
      console.error(error);
      toast.error("Failed to edit template");
    } finally {
      setIsLoading(false);
    }
   
  };

const handleReset =() =>{
reset();
router.back();
};
useEffect(()=>{
  console.log("Selected Template Data:", selectedTemplate);
  if(selectedTemplate){
    reset({
      code:selectedTemplate?.code ,
      language_id:selectedTemplate?.language_id.toString(),
      template_name: selectedTemplate?.template_name
    })
  }
},[selectedTemplate , reset])
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Update Template</h1>
          <p className="text-slate-500 mt-2">
            Modify your existing code snippet. Changes will be saved immediately.
          </p>
        </div>

        {/* Main Card */}
        <form onSubmit={handleSubmit(onSubmit )} className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Template Name */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Type size={16} className="text-slate-400" /> Template Name
              </label>
              <div className="relative">
                <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  {...register("template_name")}
                  placeholder="e.g. React Functional Component"
                  className={`w-full pl-12 pr-4 py-3 bg-white border ${errors.template_name ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                />
              </div>
              {errors.template_name && <p className="text-red-500 text-xs">{errors.template_name.message}</p>}
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Code2 size={16} className="text-slate-400" /> Programming Language
              </label>
              <div className="relative">
                <select 
                  {...register("language_id")}
                  className={`w-full pl-12 pr-10 py-3 bg-white border ${errors.language_id ? 'border-red-500' : 'border-slate-200'} rounded-2xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-600`}
                >
                  <option value="">Select a language</option>
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                   <ChevronRight className="text-slate-300" size={18} />
                </div>
              </div>
              {errors.language_id && <p className="text-red-500 text-xs">{errors.language_id.message}</p>}
            </div>
          </div>

          {/* Editor Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
               <span className="flex items-center gap-2"><ClipboardList size={16} className="text-slate-400" /> Code Snippet</span>
            </div>

            <div className="bg-[#1E1E1E] rounded-[24px] overflow-hidden shadow-xl border border-slate-800">
              <div className="bg-[#2D2D2D] px-5 py-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                  <span className="text-xs text-slate-400 ml-4 font-mono">editor.js</span>
                </div>
              </div>
              <Controller
              name ='code'
              control={control}
              render={({ field }) => (

                     <Editor
              height="400px"
              language={currentLanguage?.monaco_name || "javascript"}
              theme="vs-dark"
             value={field.value}
              onChange={(value) => field.onChange(value || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 20 }
              }}
            />
              )}
              />
                     
            </div>
            {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-10">
            <button 
              type="button"
              onClick={handleReset}
              className="px-10 py-3.5 rounded-2xl font-bold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-all"
            >
             Reset Changes
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className={`px-10 py-3.5 rounded-2xl font-bold text-white bg-[#FF824D] hover:bg-[#f3723a] shadow-lg transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}