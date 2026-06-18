"use client";

import { Content } from '@/src/types/submitCode.interface';
import { formatDistanceToNow } from 'date-fns';
interface Props {
  submissions: Content[];
  loading: boolean;
  filters?: React.ReactNode; 
  onPageChange: (page: number) => void;
  currentPage: number;
}

export default function SubmissionsTable({ 
  submissions, 
  loading, 
  filters, 
  onPageChange, 
  currentPage 
}: Props) {
  
  const getVerdictStyle = (v: string) => {
    const status = v.toLowerCase();
    if (status === 'accepted') return 'text-emerald-600 font-bold';
    if (status.includes('runtime')) return 'text-orange-500 font-bold';
    if (status === 'failed') return 'text-red-500 font-bold';
    return 'text-gray-700';
  };

  const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return dateString; 
  }
};
  return (
    <div className="w-full">
 
      {filters && <div className="mb-6">{filters}</div>}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">OJ</th>
              <th className="py-3 px-4">Prob</th>
              <th className="py-3 px-4">Result</th>
              <th className="py-3 px-4">Lang</th>
              <th className="py-3 px-4">Time (ms)</th>
              <th className="py-3 px-4">Submit Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-500">Loading...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-500">No submissions found.</td></tr>
            ) : (
            submissions.map((sub) => (
  <tr key={sub.id} className="text-sm hover:bg-gray-50 transition-colors">
    <td className="py-3 px-4 text-blue-600 font-medium">{sub.userHandle}</td>
    <td className="py-3 px-4">{sub.onlineJudge}</td>
    <td className="py-3 px-4 text-blue-600 font-medium">{sub.problemCode}</td>
    <td className={`py-3 px-4 ${getVerdictStyle(sub.verdict)}`}>{sub.verdict}</td>
    <td className="py-3 px-4">{sub.language}</td>
    
    {/* استخدام timeUsage الفعلي */}
    <td className="py-3 px-4 text-gray-500">
      {sub.timeUsage} <span className="text-gray-400">ms</span>
    </td>
    
    {/* استخدام submittedAt الفعلي */}
   <td className="py-3 px-4 text-gray-500">
  {formatTimeAgo(sub.submittedAt)}
</td>
  </tr>
))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-6 justify-center items-center">
        <button 
            disabled={currentPage === 0}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50" 
            onClick={() => onPageChange(currentPage - 1)}>Prev</button>
        <span className="px-4 py-2 bg-blue-900 text-white rounded font-bold">{currentPage + 1}</span>
        <button 
            className="px-4 py-2 border rounded hover:bg-gray-100" 
            onClick={() => onPageChange(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
}