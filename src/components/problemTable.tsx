"use client";
import React from 'react';
import { Star, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

interface Problem {
  problem_id: string;
  favorite: boolean;
  online_judge: string;
  problem_code: string;
  problem_title: string;
  problem_link: string;
  solved_count: number;
  updated_at: string;
}

interface ProblemsTableProps {
  problems: Problem[];
  load: boolean;
  handleFavorite: (id: string, currentStatus: boolean) => void;
}

export default function ProblemsTable({ problems, load, handleFavorite }: ProblemsTableProps) {
  if (load) {
    return (
      <div className="flex flex-col items-center justify-center py-20 w-full">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">
          Loading problems, please wait...
        </p>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed">
        <p className="text-slate-400">
          No problems found. Try adjusting your filters or check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
          <tr>
            <th className="px-6 py-4">#</th>
            <th className="px-6 py-4">Fav</th>
            <th className="px-6 py-4">OJ</th>
            <th className="px-6 py-4">Code</th>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Source</th>
            <th className="px-6 py-4">Solved</th>
            <th className="px-6 py-4">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {problems.map((problem) => (
            <tr key={problem.problem_id} className="hover:bg-slate-50/50 transition cursor-pointer">
              <td className="px-6 py-5">{problem.problem_id}</td>
              <td className="px-6 py-5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(problem.problem_id, problem.favorite);
                  }}
                  className="hover:scale-110 transition-transform p-1"
                >
                  <Star 
                    className={problem.favorite ? "fill-yellow-400 text-yellow-400" : "text-slate-400"} 
                    size={18} 
                  />
                </button>
              </td>
              <td className="px-6 py-5 font-medium text-blue-600">{problem.online_judge.toUpperCase()}</td>
              <td className="px-6 py-5 text-blue-600 font-bold">
                <Link href={`/problems/${problem.online_judge.toUpperCase()}/${problem.problem_code}`} className="hover:underline">

                {problem.problem_code}
                </Link>
                </td>
              <td className="px-6 py-5 font-bold text-slate-800">{problem.problem_title}</td>
              <td className="px-6 py-5 text-slate-400 text-sm">
                <a 
                  className="flex items-center gap-1 text-blue-600" 
                  href={problem.problem_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <LinkIcon size={16} /> Link
                </a>
              </td>
              <td className="px-6 py-5">
                <span className="font-bold">x{problem.solved_count}</span> 
                <br/>
                <span className="text-[10px] text-slate-400 uppercase">Users</span>
              </td>
              <td className="px-6 py-5 text-slate-400 text-sm">
                {new Date(problem.updated_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}