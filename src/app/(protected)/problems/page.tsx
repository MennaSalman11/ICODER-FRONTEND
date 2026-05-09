"use client";
import React, { useEffect, useState } from 'react';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Clock, Star, Link, SwitchCamera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { favoriteProblem, getAttemptedProblems, getFavoriteProblems, getProblems, getProblemsWithoutFilters, getSingleProblem, getSolvedProblems } from '@/src/lib/services/problems.services';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
// import { is } from 'zod/v4/locales';
// import ProblemsTable from '@/src/components/problemTable';
import ProblemTable from '@/src/components/problemTable';
// import { getSharp } from 'next/dist/server/image-optimizer';

interface ProblemFilters {
  online_judge: string;
  searchTerm: string;
  size: number;
  page: number;
  sort: string;
}
interface Problem {
  problem_id: string;
  favorite: boolean;
  online_judge: string;
  problem_code: string;
  searchTerm: string;
  size: number;
  page: number;
  sort: string;
  problem_title: string;
  problem_link: string;
  solved_count: number;
  updated_at: string;
}
interface ProblemWithoutFilters {
  size: number;
  sort: string;
  page: number;
}
// import { useContext } from 'react';
// import { getProblems } from "@/src/lib/services/problems.services";
export default function ProblemPage() {
  const [newProblemCode, setNewProblemCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: session } = useSession();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [load, setLoad] = useState(false);
  const [filters, setFilters] = useState<ProblemFilters>({
    online_judge: 'All Judges',
    sort: 'id,desc',
    searchTerm: '',
    size: 10,
    page: 1
  });
  const [problemWithoutFilters, setProblemWithoutFilters] = useState<ProblemWithoutFilters>({
    size: 10,
    page: 1,
    sort: 'id,desc'
  });
  const [activeTab, setActiveTab] = useState('All');
  // fetch problems with filters


  const handleLoadData = async () => {
    setLoad(true);
    try {
      const data = await getProblems(filters);

      if (data && data.content) {
        setProblems(data.content);
        console.log("Fetched problems:", data);
        console.log("First Problem Fav Status:", data.content[0]?.is_favourite);
      } else {
        setProblems([]);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoad(false);
    }
  };

  // handle reset button click
  const handleProblemWithoutFilters = async () => {
    setLoad(true);
    try {
      const data = await getProblemsWithoutFilters({
        page: problemWithoutFilters.page,
        size: problemWithoutFilters.size,
        sort: problemWithoutFilters.sort
      });
      if (data && data.content) {
        setProblems(data.content);
        console.log("Fetched problems without filters:", data);
      }
    } catch (error) {
      console.error('Fetch without filters failed:', error);
    } finally {
      setLoad(false);
    }
  };

  // handle filter button click
const onFilterClick = async () => {
  // 1. التحقق من أن السيرش يحتوي على أرقام فقط
  const isNumbersOnly = /^[0-9]+$/.test(filters.searchTerm);

  if (filters.searchTerm && !isNumbersOnly) {
    // إظهار توست بالإنجليزية لو دخل حروف
    toast.error("Please enter numbers only for the problem code.");
    return; // توقف عن التنفيذ
  }

  if (filters.online_judge && filters.online_judge !== 'All Judges' && filters.searchTerm) {
    setLoad(true);
    try {
      const judgeParam = filters.online_judge.toLowerCase();
      const result = await getSingleProblem(judgeParam, filters.searchTerm);

      if (result) {
        setProblems([result]);
      } else {
        setProblems([]);
        toast.error("No problem found with this code. Make sure you selected the correct Judge.");
      }
    } catch (error) {
      console.error("Error fetching specific problem:", error);
      setProblems([]);
      toast.error("An error occurred while fetching the problem.");
    } finally {
      setLoad(false);
    }
  } else {
    handleLoadData();
  }
};

  // favorite problem
  const handleFavorite = async (problemId: string, currentState: boolean) => {
    const nextStatus = !currentState;

    try {
      const res = await favoriteProblem(problemId, nextStatus);
      if (res.ok) {
        setProblems((prev) =>
          prev.map((p: any) =>
            (p.problem_id === problemId)
              ? { ...p, favorite: nextStatus }
              : p
          )
        );

        toast.success(nextStatus ? `problem ${problemId} added to favorites` : `problem ${problemId} removed from favorites`);
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status");
    }
  };
  useEffect(() => {

    const loadData = async () => {
      setLoad(true);
      try {
        let data;
        switch (activeTab) {
          case 'All':
            data = await getProblems(filters);
            break;
          case 'Solved':
            data = await getSolvedProblems(filters);
            break;
          case 'Attempted':
            data = await getAttemptedProblems(filters);
            break;
          case 'Favorite':
            data = await getFavoriteProblems(filters);
            break;
          default:
            data = await getProblems(filters);
        }
        if (data && data.content) {
          setProblems(data.content);
          const mappedProblems = data.content.map((p: any) => ({
            ...p,
            favorite: activeTab === 'Favorite' ? true : (p.favorite ?? false)
          }));
          setProblems(mappedProblems);
          console.log("Fetched problems:", data);
        }
      }
      catch (error) {
        console.error('Fetch failed:', error);
      } finally {
        setLoad(false);
      }
    }
    loadData();
  }, [activeTab, filters.page, session]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
    <div className="max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex justify-between items-start mb-8 ">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Problem Set</h1>
          <p className="text-slate-500 mt-1">Hone your skills with thousands of curated problems.</p>
        </div>

        {/* Pagination Top*/}
        {/* <div className="flex items-center gap-1 bg-white p-1 rounded-lg border shadow-sm">
          <Button variant="ghost" size="sm" className="text-slate-400"><ChevronLeft size={16} /> Prev</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">1</Button>
          <Button variant="ghost" size="sm">2</Button>
          <Button variant="ghost" size="sm">3</Button>
          <span className="px-2 text-slate-400">...</span>
          <Button variant="ghost" size="sm">12</Button>
          <Button variant="ghost" size="sm" className="text-slate-600">Next <ChevronRight size={16} /></Button>
        </div> */}
      </div>

      {/* 2. Filters Box */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Online Judge</label>
            <select
              value={filters.online_judge}
              onChange={(e) => setFilters({ ...filters, online_judge: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Judges</option>
              <option>Codeforces</option>
              <option>CSES</option>
            </select>
          </div>

          <div className="md:col-span-6 relative">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Search Problem</label>
            <Search className="absolute left-3 bottom-3 text-slate-400" size={18} />
           <Input
  value={filters.searchTerm}
  onChange={(e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]+$/.test(val)) {
      setFilters({ ...filters, searchTerm: val });
    }
  }}
  className="pl-10 bg-slate-50"
  placeholder="Enter Problem Code (Numbers)..."
/>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <Button
              disabled={load}
              className="flex-1 bg-[#1b4583] hover:bg-[#08316e] gap-2"
              onClick={onFilterClick}
            >
              {load ? (
                <>filtering...</>
              ) : (
                <>
                  <Filter size={18} /> Filter
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="text-slate-400"
              onClick={() => {
                handleProblemWithoutFilters();
              }}
            >
              <RotateCcw size={18} />
            </Button>

          </div>
        </div>
      </div>

      {/* 3. Tabs */}
      <div className="flex gap-8 border-b mb-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('All')}
          className={`pb-4 border-b-2 ${activeTab === 'All' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'} transition`}>
          All
        </button>

        <button
          onClick={() => setActiveTab('Solved')}
          className={`pb-4 transition ${activeTab === 'Solved' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          Solved
        </button>

        <button
          onClick={() => setActiveTab('Attempted')}
          className={`pb-4 transition ${activeTab === 'Attempted' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          Attempted
        </button>
        <button
          onClick={() => setActiveTab('Favorite')}
          className={`pb-4 transition ${activeTab === 'Favorite' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          Favorite
        </button>

      </div>
      {load ? (
        // loader
        <div className="flex flex-col items-center justify-center py-20 w-full">
          {/* spinner */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900"></div>


          <p className="mt-4 text-slate-500 font-medium animate-pulse">
            Loading problems, please wait...
          </p>
        </div>
      ) :
        problems.length > 0 ? (
          <ProblemTable problems={problems} handleFavorite={handleFavorite} load={load} />
        )
          : (

            <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed">
              <p className="text-slate-400">
                No problems found. Try adjusting your filters or check back later for new additions!
              </p>
            </div>
          )}


      {/* Footer info */}
      <p className="text-center text-slate-400 text-xs mt-12 mb-8">
        © 2025 ICoder. Built for excellence in competitive programming.
      </p>
    </div>
    </div>
  );
}
