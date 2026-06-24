"use client";
import { useState, useEffect } from 'react';
import { getSubmissions } from "@/src/lib/services/submitCode.services";
import { Content } from '@/src/types/submitCode.interface';
import SubmissionsTable from '@/src/components/SubmissionsTable';
import { useSession } from "next-auth/react";

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  "C++": ["g++", "c++", "c23", "gcc"],
  "Python": ["python", "pypy", "cpython"],
  "Java": ["java"],
  "C#": ["c#"],
  "Kotlin": ["kotlin"],
  "Scala": ["scala"],
  "JavaScript": ["javascript", "node.js"],
  "TypeScript": ["typescript"],
  "Rust": ["rust"],
  "Go": ["go"],
  "PHP": ["php"],
  "Ruby": ["ruby"],
  "Haskell": ["haskell"],
  "Pascal": ["pascal", "delphi"],
  "Assembly": ["assembly"],
  "D": ["dmd"],
  "F#": ["f#"],
  "OCaml": ["ocaml"],
  "Perl": ["perl"],
  "Swift": ["swift"]
};

const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_KEYWORDS);

export default function SubmissionsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<'all' | 'mine'>('all');
  const [filters, setFilters] = useState({
    problem_code: '',
    online_judge: '',
    page: 0,
    size: 10,
    handle: '',       // ✅ كان userHandle — صح دلوقتي
    language: '',
  });

  const handleViewChange = (type: 'all' | 'mine') => {
    setViewType(type);
    setFilters(prev => ({
      ...prev,
      page: 0,
      handle: type === 'mine'
        ? (session?.user?.handle || session?.user?.name || '')
        : '',
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSubmissions(filters);

        if (filters.language) {
          const keywords = LANGUAGE_KEYWORDS[filters.language] || [filters.language.toLowerCase()];
          const filtered = data.content.filter((sub: Content) => {
            const subLang = sub.language.toLowerCase();
            return keywords.some(k => subLang.includes(k.toLowerCase()));
          });
          setSubmissions(filtered);
        } else {
          setSubmissions(data.content || []);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="container mx-auto px-4 py-18">
      <div className="flex gap-8 p-8">
        <div className="w-48 flex flex-col gap-2">
          <button
            onClick={() => handleViewChange('all')}
            className={`p-3 rounded text-left ${viewType === 'all' ? 'bg-blue-900 text-white' : 'hover:bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => handleViewChange('mine')}
            className={`p-3 rounded text-left ${viewType === 'mine' ? 'bg-blue-900 text-white' : 'hover:bg-gray-100'}`}
          >
            Mine
          </button>
        </div>

        <SubmissionsTable
          submissions={submissions}
          loading={loading}
          currentPage={filters.page}
          onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
          filters={
            <div className="flex flex-wrap gap-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm items-end">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
            <input
  className={`border border-gray-300 rounded-md p-2 w-48 focus:ring-2 focus:ring-blue-500 outline-none ${
    viewType === 'mine' ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
  }`}
  placeholder="Search user..."
  value={filters.handle}
  readOnly={viewType === 'mine'} // ✅
  onChange={(e) => {
    if (viewType === 'mine') return; // ✅
    setFilters(prev => ({ ...prev, handle: e.target.value, page: 0 }));
  }}
/>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2">OJ</label>
                <select
                  className="border border-gray-300 rounded-md p-2 w-32 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filters.online_judge || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, online_judge: e.target.value, page: 0 }))}
                >
                  <option value="">All</option>
                  <option value="CSES">CSES</option>
                  <option value="CODEFORCES">Codeforces</option>
                  <option value="atcoder">AtCoder</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2">Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value, page: 0 }))}
                  className="border border-gray-300 rounded-md p-2 w-32 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All</option>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
