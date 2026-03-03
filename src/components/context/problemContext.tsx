// "use client";
// import { getLanguageList, getLanguageById } from "@/src/lib/services/codingEditor.services";
// import { createContext, useContext, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// interface Language {
//   id: string;
//   name: string;
//   monaco_name: string;
// }
// interface ProblemContextType {
//   languages: Language[];
//   isLoading: boolean;
//   selectedLanguage: string;
//   sourceCode: string;
//   setSourceCode: (code: string) => void;
//   changeLanguage: (languageId: string) => Promise<void>
// }

// const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

// export default function ProblemProvider({ children }: { children: React.ReactNode }) {

//   const [sourceCode, setSourceCode] = useState(""); // لتخزين الكود اللي اليوزر بيكتبه
//   const [languages, setLanguages] = useState<Language[]>([]);
//   const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
//     return Cookies.get("selected_lang_id") || '';
//   }); const [isLoading, setIsLoading] = useState<boolean>(false);

//   useEffect(() => {

//     const fetchLanguages = async () => {
//       setIsLoading(true);
//       try {
//         const res = await getLanguageList();
//         setLanguages(res);
//         const cookieLangId = Cookies.get("selected_lang_id");
//         if (cookieLangId && res.find((l: Language) => l.id === cookieLangId)) {
//           setSelectedLanguage(cookieLangId);
//         } else if (res.length > 0) {
//           setSelectedLanguage(res[0].id); // تعيين أول لغة بشكل افتراضي
//         }
//       } catch (error) {
//         console.log("Error fetching languages:", error);
//       }
//       finally {
//         setIsLoading(false);
//       }
//     }
//     fetchLanguages();
//   }, []);

//   const changeLanguage = async (languageId: string) => {
//     try {
//       setSelectedLanguage(languageId);

//       // 3. احفظي الـ ID في الكوكيز عشان الريفريش
//       Cookies.set("selected_lang_id", languageId); // يعيش سنة

//       // نادي الـ API اللي بيطبع في الـ Console عندك
//       const details = await getLanguageById(languageId);
//       console.log("Selected language details:", details);

//     } catch (error) {
//       console.log("Error changing language:", error);
//     }
//   };
//   return (
//     <ProblemContext.Provider value={{
//       languages,
//       isLoading,
//       selectedLanguage,
//       changeLanguage,
//       sourceCode,
//       setSourceCode
//     }}>
//       {children}
//     </ProblemContext.Provider>
//   )
// }
// export const useProblem = () => {
//   const context = useContext(ProblemContext);
//   if (!context) {
//     throw new Error("useProblem must be used within a ProblemProvider");
//   }
//   return context;
// }
"use client";

import { getLanguageById, getLanguageList } from "@/src/lib/services/codingEditor.services";
import { error } from "console";
import { createContext, use, useContext, useEffect, useState } from "react";
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
  changeLanguage: (languageId: string) => Promise<void>
}
const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

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
  return (
    <ProblemContext.Provider value ={{
      languages,
      isLoading,
      selectedLanguage,
      sourceCode,
      setSourceCode,
      changeLanguage
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