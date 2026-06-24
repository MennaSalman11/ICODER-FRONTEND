// "use client";

// import { useState } from 'react';
// import { Content } from '@/src/types/submitCode.interface';
// import { formatDistanceToNow } from 'date-fns';
// import { useSession } from 'next-auth/react';
// import { toggleSubmissionOpenness } from '@/src/lib/services/submitCode.services';
// import CodeModal from './CodeModal';

// interface Props {
//   submissions: Content[];
//   loading: boolean;
//   filters?: React.ReactNode;
//   onPageChange: (page: number) => void;
//   currentPage: number;
// }

// export default function SubmissionsTable({
//   submissions,
//   loading,
//   filters,
//   onPageChange,
//   currentPage,
// }: Props) {
//   const { data: session } = useSession();
//   const currentUserHandle = session?.user?.handle || session?.user?.name || '';

//   const [selectedSubmission, setSelectedSubmission] = useState<{
//     id: number;
//     verdict: string;
//     isOpen: boolean;
//   } | null>(null);

//   // Local openness state to reflect toggle without refetch
//   const [opennessMap, setOpennessMap] = useState<Record<number, boolean>>({});
//   const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

//   const getIsOpen = (sub: Content) =>
//     opennessMap[sub.id] !== undefined ? opennessMap[sub.id] : sub.isOpen;

//   const handleToggle = async (sub: Content) => {
//     if (togglingIds.has(sub.id)) return;
//     setTogglingIds((prev) => new Set(prev).add(sub.id));
//     try {
//       const newValue = await toggleSubmissionOpenness(sub.id);
//       setOpennessMap((prev) => ({ ...prev, [sub.id]: newValue }));
//     } catch (err) {
//       console.error('Toggle failed:', err);
//     } finally {
//       setTogglingIds((prev) => {
//         const next = new Set(prev);
//         next.delete(sub.id);
//         return next;
//       });
//     }
//   };

//   const getVerdictStyle = (v: string) => {
//     const status = v.toLowerCase();
//     if (status === 'accepted') return 'text-emerald-600 font-bold';
//     if (status.includes('wrong')) return 'text-red-400 font-bold';
//     if (status.includes('runtime')) return 'text-orange-500 font-bold';
//     if (status === 'failed') return 'text-red-500 font-bold';
//     return 'text-gray-700';
//   };

//   const formatTimeAgo = (dateString: string) => {
//     try {
//       return formatDistanceToNow(new Date(dateString), { addSuffix: true });
//     } catch {
//       return dateString;
//     }
//   };

//   const handleResultClick = (sub: Content) => {
//     setSelectedSubmission({
//       id: sub.id,
//       verdict: sub.verdict,
//       isOpen: getIsOpen(sub),
//     });
//   };

//   // Check if any row belongs to current user (to show/hide Open column)
//   const hasOwnSubmissions = submissions.some(
//     (sub) => sub.userHandle === currentUserHandle
//   );

//   return (
//     <div className="w-full">
//       {filters && <div className="mb-6">{filters}</div>}

//       <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-gray-50 text-gray-600 text-sm border-b">
//               <th className="py-3 px-4">Username</th>
//               <th className="py-3 px-4">OJ</th>
//               <th className="py-3 px-4">Prob</th>
//               <th className="py-3 px-4">Result</th>
//               <th className="py-3 px-4">Lang</th>
//               <th className="py-3 px-4">Time (ms)</th>
//               <th className="py-3 px-4">Submit Time</th>
//               {hasOwnSubmissions && (
//                 <th className="py-3 px-4 text-center">Open</th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={hasOwnSubmissions ? 8 : 7} className="py-10 text-center text-gray-500">
//                   Loading...
//                 </td>
//               </tr>
//             ) : submissions.length === 0 ? (
//               <tr>
//                 <td colSpan={hasOwnSubmissions ? 8 : 7} className="py-10 text-center text-gray-500">
//                   No submissions found.
//                 </td>
//               </tr>
//             ) : (
//               submissions.map((sub) => {
//                 const isOwner = sub.userHandle === currentUserHandle;
//                 const isOpen = getIsOpen(sub);
//                 const isToggling = togglingIds.has(sub.id);

//                 return (
//                   <tr key={sub.id} className="text-sm hover:bg-gray-50 transition-colors">
//                     <td className="py-3 px-4 text-blue-600 font-medium">{sub.userHandle}</td>
//                     <td className="py-3 px-4">{sub.onlineJudge}</td>
//                     <td className="py-3 px-4 text-blue-600 font-medium">{sub.problemCode}</td>

//                     {/* Clickable Result */}
//                     <td className="py-3 px-4">
//                       <button
//                         onClick={() => handleResultClick(sub)}
//                         className={`${getVerdictStyle(sub.verdict)} hover:underline hover:opacity-80 transition-opacity cursor-pointer text-left`}
//                         title="Click to view submitted code"
//                       >
//                         {sub.verdict}
//                       </button>
//                     </td>

//                     <td className="py-3 px-4">{sub.language}</td>
//                     <td className="py-3 px-4 text-gray-500">
//                       {sub.timeUsage} <span className="text-gray-400">ms</span>
//                     </td>
//                     <td className="py-3 px-4 text-gray-500">
//                       {formatTimeAgo(sub.submittedAt)}
//                     </td>

//                     {/* Open toggle — owner only */}
//                     {hasOwnSubmissions && (
//                       <td className="py-3 px-4 text-center">
//                         {isOwner ? (
//                           <button
//                             onClick={() => handleToggle(sub)}
//                             disabled={isToggling}
//                             title={isOpen ? 'Public — click to make private' : 'Private — click to make public'}
//                             className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none
//                               ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
//                               ${isOpen ? 'bg-blue-900' : 'bg-gray-300'}
//                             `}
//                           >
//                             <span
//                               className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200
//                                 ${isOpen ? 'translate-x-4' : 'translate-x-1'}
//                               `}
//                             />
//                           </button>
//                         ) : (
//                           // Non-owner: show static indicator
//                           <span className={`inline-block w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-gray-300'}`} />
//                         )}
//                       </td>
//                     )}
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex gap-2 mt-6 justify-center items-center">
//         <button
//           disabled={currentPage === 0}
//           className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
//           onClick={() => onPageChange(currentPage - 1)}
//         >
//           Prev
//         </button>
//         <span className="px-4 py-2 bg-blue-900 text-white rounded font-bold">
//           {currentPage + 1}
//         </span>
//         <button
//           className="px-4 py-2 border rounded hover:bg-gray-100"
//           onClick={() => onPageChange(currentPage + 1)}
//         >
//           Next
//         </button>
//       </div>

//       {/* Code Modal */}
//       {selectedSubmission && (
//         <CodeModal
//           submissionId={selectedSubmission.id}
//           verdict={selectedSubmission.verdict}
//           isOpen={selectedSubmission.isOpen}
//           onClose={() => setSelectedSubmission(null)}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from 'react';
import { Content } from '@/src/types/submitCode.interface';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { toggleSubmissionOpenness } from '@/src/lib/services/submitCode.services';
import CodeModal from './CodeModal';

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
  currentPage,
}: Props) {
  const { data: session } = useSession();
  const currentUserHandle = session?.user?.handle || session?.user?.name || '';

  const [selectedSubmission, setSelectedSubmission] = useState<{
    id: number;
    verdict: string;
    isOpen: boolean;
    ownerHandle: string;
  } | null>(null);

  // Local openness state to reflect toggle without refetch
  const [opennessMap, setOpennessMap] = useState<Record<number, boolean>>({});
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const getIsOpen = (sub: Content) =>
    opennessMap[sub.id] !== undefined ? opennessMap[sub.id] : sub.isOpen;

  const handleToggle = async (sub: Content) => {
    if (togglingIds.has(sub.id)) return;
    setTogglingIds((prev) => new Set(prev).add(sub.id));
    try {
      const newValue = await toggleSubmissionOpenness(sub.id);
      setOpennessMap((prev) => ({ ...prev, [sub.id]: newValue }));
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(sub.id);
        return next;
      });
    }
  };

  const getVerdictStyle = (v: string) => {
    const status = v.toLowerCase();
    if (status === 'accepted') return 'text-emerald-600 font-bold';
    if (status.includes('wrong')) return 'text-red-400 font-bold';
    if (status.includes('runtime')) return 'text-orange-500 font-bold';
    if (status === 'failed') return 'text-red-500 font-bold';
    return 'text-gray-700';
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const handleResultClick = (sub: Content) => {
    setSelectedSubmission({
      id: sub.id,
      verdict: sub.verdict,
      isOpen: getIsOpen(sub),
      ownerHandle: sub.userHandle,
    });
  };

  // Check if any row belongs to current user (to show/hide Open column)
  const hasOwnSubmissions = submissions.some(
    (sub) => sub.userHandle === currentUserHandle
  );

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
              <tr>
                <td colSpan={hasOwnSubmissions ? 8 : 7} className="py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={hasOwnSubmissions ? 8 : 7} className="py-10 text-center text-gray-500">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const isOwner = sub.userHandle === currentUserHandle;
                const isOpen = getIsOpen(sub);
                const isToggling = togglingIds.has(sub.id);

                return (
                  <tr key={sub.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-blue-600 font-medium">{sub.userHandle}</td>
                    <td className="py-3 px-4">{sub.onlineJudge}</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">{sub.problemCode}</td>

                    {/* Clickable Result */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleResultClick(sub)}
                        className={`${getVerdictStyle(sub.verdict)} hover:underline hover:opacity-80 transition-opacity cursor-pointer text-left`}
                        title="Click to view submitted code"
                      >
                        {sub.verdict}
                      </button>
                    </td>

                    <td className="py-3 px-4">{sub.language}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {sub.timeUsage} <span className="text-gray-400">ms</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatTimeAgo(sub.submittedAt)}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-6 justify-center items-center">
        <button
          disabled={currentPage === 0}
          className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>
        <span className="px-4 py-2 bg-blue-900 text-white rounded font-bold">
          {currentPage + 1}
        </span>
        <button
          className="px-4 py-2 border rounded hover:bg-gray-100"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Code Modal */}
      {selectedSubmission && (
        <CodeModal
          submissionId={selectedSubmission.id}
          verdict={selectedSubmission.verdict}
          isOpen={selectedSubmission.isOpen}
          ownerHandle={selectedSubmission.ownerHandle}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}

