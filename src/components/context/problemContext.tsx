"use client";

import { getLanguageById, getLanguageList } from "@/src/lib/services/codingEditor.services";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface Languge {
  id : string,
  name : string ,
  monaco_name : string
}

interface ProblemContextType {
  languages: Languge[],
  isLoading: boolean,
  selectedLanguage: string,
  sourceCode: string,
  setSourceCode: (code: string) => void,
  changeLanguage: (languageId: string) => Promise<void>,
  // 🆕 جديد: بنحفظ ونجيب الكود بناءً على problem_id + language_id
  saveCodeForProblem: (problemId: string, languageId: string, code: string) => void,
  getSavedCodeForProblem: (problemId: string, languageId: string) => string | null,
  clearSavedCodeForProblem: (problemId: string, languageId: string) => void,
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

const CODE_STORAGE_PREFIX = "code_draft_";

const buildStorageKey = (problemId: string, languageId: string) =>
  `${CODE_STORAGE_PREFIX}${problemId}_${languageId}`;

export default function ProblemProvider({children}:{children :React.ReactNode}) {
  const [sourceCode, setSourceCode] = useState("");
  const [languages, setLanguage] = useState<Languge[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoading(true);
      try {

        const res = await getLanguageList()
        setLanguage(res);
        console.log("Languages fetched:", res);
        const cookieLangId = Cookies.get("selected_lang_id");
        if(cookieLangId && res.find((l: Languge) => l.id === cookieLangId)) {
          setSelectedLanguage(cookieLangId);
        } else if (res.length > 0) {
          setSelectedLanguage(res[0].id);
        }
      }
      finally {
        setIsLoading(false);
      }
    }
    fetchLanguages();
  },[]);

  const changeLanguage = async (languageId: string) => {
    try {
      setSelectedLanguage(languageId);
      Cookies.set("selected_lang_id", languageId);
      const details = await getLanguageById(languageId);
      console.log("Selected language details:", details);
    } catch (error) {
      console.log("Error changing language:", error);
    }
  } ;

  // 🆕 حفظ الكود في localStorage بمفتاح خاص بالمشكلة + اللغة
  const saveCodeForProblem = (problemId: string, languageId: string, code: string) => {
    if (typeof window === "undefined") return;
    if (!problemId || !languageId) return;
    try {
      localStorage.setItem(buildStorageKey(problemId, languageId), code);
    } catch (error) {
      console.log("Error saving code draft:", error);
    }
  };

  // 🆕 جلب الكود المحفوظ لمشكلة معينة + لغة معينة (null لو مفيش)
  const getSavedCodeForProblem = (problemId: string, languageId: string): string | null => {
    if (typeof window === "undefined") return null;
    if (!problemId || !languageId) return null;
    try {
      return localStorage.getItem(buildStorageKey(problemId, languageId));
    } catch (error) {
      console.log("Error reading code draft:", error);
      return null;
    }
  };

  // 🆕 مسح الكود المحفوظ (مثلاً بعد submit ناجح)
  const clearSavedCodeForProblem = (problemId: string, languageId: string) => {
    if (typeof window === "undefined") return;
    if (!problemId || !languageId) return;
    try {
      localStorage.removeItem(buildStorageKey(problemId, languageId));
    } catch (error) {
      console.log("Error clearing code draft:", error);
    }
  };

  return (
    <ProblemContext.Provider value ={{
      languages,
      isLoading,
      selectedLanguage,
      sourceCode,
      setSourceCode,
      changeLanguage,
      saveCodeForProblem,
      getSavedCodeForProblem,
      clearSavedCodeForProblem,
    }}>
      {children}
    </ProblemContext.Provider>
  )
} 

export const useProblem = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error("useProblem must be used within a ProblemProvider");
  }
  return context;
}
