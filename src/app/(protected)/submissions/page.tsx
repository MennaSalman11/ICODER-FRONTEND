"use client";
import { useState, useEffect } from 'react';
import { getSubmissions } from "@/src/lib/services/submitCode.services";
import { Content } from '@/src/types/submitCode.interface';
import SubmissionsTable from '@/src/components/SubmissionsTable';
import { useProblem } from "@/src/components/context/problemContext";
import {  useSession } from "next-auth/react";

export default function SubmissionsPage() {
  const { languages, isLoading } = useProblem();
  const [submissions, setSubmissions] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false); 
  
  const [viewType, setViewType] = useState<'all' | 'mine'>('all');

 const { data: session } = useSession();
const handleViewChange = (type: 'all' | 'mine') => {
  setViewType(type);
  
  if (type === 'mine') {
    const userHandle = session?.user?.handle || session?.user?.name || "";
    setFilters(prev => ({ ...prev, userHandle: userHandle }));
  } else {
    setFilters(prev => ({ ...prev, userHandle: '' }));
  }
};
  const [filters, setFilters] = useState({
    problem_code: '',
    online_judge: '',
    page: 0,
    size: 10,
    userHandle: '',
    language: '', 
  });

useEffect(() => {
  const fetchData = async () => {
    setLoading(true); 
    try {
      const data = await getSubmissions(filters);
      if (filters.language) {
        const filtered = data.content.filter((sub: Content) => sub.language === filters.language);
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
useEffect(() => {
  console.log("Languages from Context:", languages);
  console.log("Submissions data:", submissions);
}, [languages, submissions]);
  if (isLoading) return <div className="p-8 text-center">Loading languages...</div>;

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
        onPageChange={(p) => setFilters(prev => ({...prev, page: p}))}
        filters={
          <div className="flex flex-wrap gap-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm items-end transition-all">
            {/* Username Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
              <input 
                className="border border-gray-300 rounded-md p-2 w-48 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Search user..."
                value={filters.userHandle}
                onChange={(e) => setFilters(prev => ({...prev, userHandle: e.target.value}))}
              />
            </div>

            {/* OJ Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2">OJ</label>
              <select 
                className="border border-gray-300 rounded-md p-2 w-32 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={filters.online_judge || 'All'}
                onChange={(e) => setFilters(prev => ({...prev, online_judge: e.target.value === 'All' ? '' : e.target.value}))}
              >
                <option>All</option>
                <option>CSES</option>
                <option>CodeForce</option>
                <option>ATCODER</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2">Language</label>
             <select 
  value={filters.language}
  onChange={(e) => setFilters(prev => ({...prev, language: e.target.value}))}
  className="border border-gray-300 rounded-md p-2 w-32 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
>
  <option value="">All</option>
  {languages.map((lang) => (
    // تأكدي أنكِ تعرضين الـ name وتستخدمين الـ name كـ value
    <option key={lang.id} value={lang.name}>
      {lang.name}
    </option>
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