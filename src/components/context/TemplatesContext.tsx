// "use client";

// import { useContext , createContext, useEffect, useState} from "react";
// import { Template , TemplateContent} from "@/src/types/templates.interface";
// import getAllTemplates from "@/src/lib/services/templates.services";
// import { useSession } from "next-auth/react";

// interface TemplateContextType {
//     templates: TemplateContent[],
//     setTemplates: React.Dispatch<React.SetStateAction<TemplateContent[]>>;
//     selectedTemplate: TemplateContent | null;
//     setSelectedTemplate: (template: TemplateContent | null) => void;
//     loading: boolean,
//     setPage: (page: number) => void,
//     page: number
// }
// const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// export default function TemplateProvider({children}:{children: React.ReactNode}){
//     const { data: session } = useSession();
//     const [page, setPage] = useState(0);
//     const [templates, setTemplates] = useState<TemplateContent[]>([]);
//     const [selectedTemplate, setSelectedTemplate] = useState<TemplateContent | null>(null);
//     const [loading, setLoading] = useState(false);
// useEffect(() => {
//     const fetchTemplates = async () => {
//         const token = (session as any)?.accessToken; 

//         if (token) {
//             try {
//                 setLoading(true);
//                 console.log("Fetching templates with token:", token);
//                 const data = await getAllTemplates(page, token);
//                 setTemplates(data.content);
//             } catch (error) {
//                 console.error("Fetch Error:", error);
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             console.log("No token found in session yet...");
//         }
//     };

//     fetchTemplates();
// }, [page, session]);
//     return (
//         <TemplateContext.Provider value ={{ page, setPage, templates,setTemplates, selectedTemplate, setSelectedTemplate ,loading  }}>
//             {children}
//         </TemplateContext.Provider>
//     )
// }

// export const useTemplateContext =() =>{
//     const context = useContext(TemplateContext);
//     if (!context){
//         throw new Error("useTemplateContext must be used within a TemplateProvider");
//     }
//     return context;
// }

"use client";

import { useContext, createContext, useEffect, useState, useCallback } from "react";
import { Template, TemplateContent } from "@/src/types/templates.interface";
import getAllTemplates from "@/src/lib/services/templates.services";
import { useSession } from "next-auth/react";

interface TemplateContextType {
  templates: TemplateContent[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateContent[]>>;

  selectedTemplate: TemplateContent | null;
  setSelectedTemplate: (template: TemplateContent | null) => void;

  loading: boolean;

  page: number;
  setPage: (page: number) => void;

  // pagination metadata
  totalPages: number;
  totalElements: number;
  isFirstPage: boolean;
  isLastPage: boolean;

  refetchTemplates: () => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export default function TemplateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  const [page, setPage] = useState(0);
  const [templates, setTemplates] = useState<TemplateContent[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateContent | null>(null);
  const [loading, setLoading] = useState(false);

  // pagination states
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(true);

  const refetchTemplates = useCallback(async () => {
    const token = (session as any)?.accessToken;

    if (!token) return;

    try {
      setLoading(true);

      const data: Template = await getAllTemplates(page, token);

      setTemplates(data.content || []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setIsFirstPage(data.first ?? page === 0);
      setIsLastPage(data.last ?? true);

      // لو الصفحة الحالية بقت فاضية بعد حذف مثلًا، ارجع لآخر صفحة متاحة
      if ((data.content?.length ?? 0) === 0 && page > 0 && data.totalPages > 0) {
        setPage(data.totalPages - 1);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setTemplates([]);
      setTotalPages(0);
      setTotalElements(0);
      setIsFirstPage(true);
      setIsLastPage(true);
    } finally {
      setLoading(false);
    }
  }, [page, session]);

  useEffect(() => {
    refetchTemplates();
  }, [refetchTemplates]);

  return (
    <TemplateContext.Provider
      value={{
        templates,
        setTemplates,
        selectedTemplate,
        setSelectedTemplate,
        loading,
        page,
        setPage,
        totalPages,
        totalElements,
        isFirstPage,
        isLastPage,
        refetchTemplates,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplateContext must be used within a TemplateProvider");
  }
  return context;
};