"use client";

import React, { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link'; 
import { useTemplateContext } from '@/src/components/context/TemplatesContext';
import { TemplateContent } from '@/src/types/templates.interface';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteTemplate, getTemplateById, toggleTemplateStatus } from '@/src/lib/services/templates.services';

export default function CodeTemplatePage() {
  const { page, setPage, templates,setTemplates, setSelectedTemplate, loading } = useTemplateContext();
  const router = useRouter();
  // States for delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // states for retrieve
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
const [viewingTemplate, setViewingTemplate] = useState<TemplateContent | null>(null);
const [isFetchingDetails, setIsFetchingDetails] = useState(false);

const handleViewDetails = async (id: number) => {
  try {
    setIsFetchingDetails(true);
    const data = await getTemplateById(id);
    setViewingTemplate(data);
    setIsViewModalOpen(true);
  } catch (error) {
    toast.error("Could not load template details");
  } finally {
    setIsFetchingDetails(false);
  }
};

  const handleClickEdit = (template: TemplateContent) => {
    setSelectedTemplate(template);
    router.push(`code-templates/edit-template/${template.template_id}`)
  }

  const openDeleteModal = (id: number) => {
    setIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      try {
        await deleteTemplate(idToDelete);
        toast.success("Template deleted successfully");
        setIsDeleteDialogOpen(false);
        router.refresh(); 
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete template");
      }
    }
  };

const handleToggle = async (id: number, force: boolean) => {
  try {
    await toggleTemplateStatus(id, force);

    const updatedTemplates = templates.map((t) => 
      Number(t.template_id) === id ? { ...t, enabled: force } : t
    );
    
    setTemplates(updatedTemplates);

    toast.success(`Template ${force ? 'Enabled' : 'Disabled'} successfully`);
    
    router.refresh();

  } catch (error) {
    console.log(error);
    toast.error(`Failed to update template status`);
  }
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
          <Button asChild className="bg-[#314b87] hover:bg-[#4766af] text-white px-6 py-6 rounded-xl flex gap-2 shrink-0">
            <Link href="code-templates/create-template">  
              <Plus size={22} /> Create New Template
            </Link>
          </Button>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-4 md:p-8 overflow-hidden">
          <div className="overflow-x-auto">
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
                {loading ? (
                  /* 1. Loading State (Skeleton) */
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="py-5 px-6 bg-white rounded-l-2xl border-y border-l border-slate-50">
                        <div className="h-5 bg-slate-100 rounded-lg w-3/4"></div>
                      </td>
                      <td className="py-5 px-6 bg-white border-y border-slate-50">
                        <div className="h-6 w-12 bg-slate-100 rounded-full"></div>
                      </td>
                      <td className="py-5 px-6 bg-white border-y border-slate-50">
                        <div className="flex justify-center">
                          <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                        </div>
                      </td>
                      <td className="py-5 px-6 bg-white rounded-r-2xl border-y border-r border-slate-50">
                        <div className="flex justify-center gap-4">
                          <div className="h-8 w-8 bg-slate-50 rounded-full"></div>
                          <div className="h-8 w-8 bg-slate-50 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : templates.length > 0 ? (
                  /* 2. Success State (Data list) */
                  templates.map((template) => (
                    <tr key={template.template_id} className="group hover:bg-slate-50/80 transition-all">
                     <td 
  onClick={() => handleViewDetails(Number(template.template_id))}
  className="py-5 px-6 font-bold text-lg text-[#2d4a78] bg-white group-hover:bg-slate-50/80 rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100 cursor-pointer hover:underline"
>
  {template.template_name}
</td>
                      <td className="py-5 px-6 bg-white group-hover:bg-slate-50/80 border-y border-transparent group-hover:border-slate-100">
                        <div className="flex items-center gap-3 ">
                          <Switch checked={template.enabled} 
                          onCheckedChange={(checked) => handleToggle(Number(template.template_id), checked)}
                          className="data-[state=checked]:bg-[#30548f] data-[state=unchecked]:bg-slate-200"
                          />
                          <span className={`text-sm font-bold w-8 ${template.enabled ? 'text-[#1e3d6e]' : 'text-slate-400'}`}>
                            {template.enabled ? 'On' : 'Off'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center bg-white group-hover:bg-slate-50/80 border-y border-transparent group-hover:border-slate-100">
                        <Badge variant="secondary" className="bg-blue-100 px-4 py-1.5 rounded-full text-xs font-bold border-none capitalize text-blue-700">
                          {template.monaco_name}
                        </Badge>
                      </td>
                      <td className="py-5 px-6 bg-white group-hover:bg-slate-50/80 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => handleClickEdit(template)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-white rounded-full">
                            <Pencil size={20} />
                          </button>
                          <button onClick={() => openDeleteModal(Number(template.template_id))} className="text-red-300 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-full">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* 3. Empty State (No Data) */
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                          <ClipboardList size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Templates Found</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
                          Start by creating your first code snippet to speed up your workflow.
                        </p>
                        <Button asChild className="bg-[#314b87] hover:bg-[#3b5aa2] text-white rounded-2xl px-8 py-6 shadow-lg shadow-indigo-100 transition-transform hover:scale-105">
                           <Link href="code-templates/create-template" className="flex items-center gap-2">
                            <Plus size={20}/> Create Template
                           </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table> 
          </div>

          {/* Pagination */}
          {!loading && templates.length > 0 && (
            <div className="flex items-center gap-2 mt-8">
              <Button 
                variant="ghost" 
                onClick={() => setPage(Math.max(0, page - 1))}
                className="text-slate-500 font-bold hover:bg-slate-100 px-3"
              >
                <ChevronLeft size={16} className="mr-1"/> Prev
              </Button>
              <Button className="bg-[#1e3a8a] hover:bg-blue-900 w-10 h-10 rounded-xl shadow-md shadow-blue-100">
                {page + 1}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setPage(page + 1)}
                className="text-slate-900 font-bold hover:bg-slate-100 px-3"
              >
                Next <ChevronRight size={16} className="ml-1"/>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsDeleteDialogOpen(false)} />
          <div className="relative bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full border border-slate-100 animate-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Template?</h2>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">This action cannot be undone. It will permanently remove this snippet from your library.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all text-sm">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {isViewModalOpen && viewingTemplate && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsViewModalOpen(false)} />
    <div className="relative bg-white p-8 rounded-[32px] shadow-2xl max-w-2xl w-full border border-slate-100 animate-in zoom-in duration-200 max-h-[80vh] overflow-y-auto">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Badge className="mb-2 bg-blue-50 text-blue-600 border-none">{viewingTemplate.monaco_name}</Badge>
          <h2 className="text-2xl font-bold text-slate-900">{viewingTemplate.template_name}</h2>
        </div>
        <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
           <Plus className="rotate-45" size={28} /> {/* Close button icon */}
        </button>
      </div>

      {/* Details Area */}
      <div className="space-y-6">
        <div>
          <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-2">Source Code</label>
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl font-mono text-sm overflow-x-auto">
            <pre>{viewingTemplate.code || "// No code available"}</pre>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">Status</span>
            <span className="font-bold text-slate-700">{viewingTemplate.enabled ? "Active" : "Inactive"}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">Last Updated</span>
            <span className="font-bold text-slate-700 text-sm">
              {new Date(viewingTemplate.created_and_updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={() => setIsViewModalOpen(false)} className="w-full bg-[#314b87] hover:bg-[#3b5aa2] text-white py-6 rounded-2xl font-bold">
          Close Preview
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
} 