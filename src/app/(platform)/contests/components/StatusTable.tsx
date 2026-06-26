"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ContestService } from "@/src/lib/services/contest-services";
import { Submission, SubmissionFilters } from "@/src/types/contest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faChevronDown,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";

import CodeModal from "../../../../components/CodeModal";


interface StatusTableProps {
    contestId: string | number;
}

const LANGUAGES = ["ALL", "C++", "Java", "Python", "C", "GO"];
const RESULTS = [
    { label: "ALL", value: "" },
    { label: "ACCEPTED", value: "ACCEPTED" },
    { label: "WRONG ANSWER", value: "FAILED" },
    { label: "RUNTIME ERROR", value: "FAILED" },
    { label: "TIME LIMIT EXCEEDED", value: "FAILED" },
    { label: "MEMORY LIMIT EXCEEDED", value: "FAILED" },
    { label: "COMPILATION ERROR", value: "FAILED" },
    { label: "PENDING", value: "PENDING" },
];

export default function StatusTable({ contestId }: StatusTableProps) {
    const { data: session } = useSession();
    const token = (session as any)?.accessToken as string | undefined;



    // State Management
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

    // Filter States
    const [usernameInput, setUsernameInput] = useState("");
    const [debouncedUsername, setDebouncedUsername] = useState("");
    const [selectedProblem, setSelectedProblem] = useState("");
    const [selectedResult, setSelectedResult] = useState("");
    const [selectedLang, setSelectedLang] = useState("");

    // Problems for the dropdown
    const [problems, setProblems] = useState<{ problem_id: number, problem_alias: string }[]>([]);

    // Load problems for filtering
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const data = await ContestService.getContestProblems(contestId, token);
                // تأكدي من عمل حماية لو الداتا رجعت null أو مش Array
                setProblems(Array.isArray(data) ? data : (data?.content || []));
            } catch (err) {
                console.error("Failed to fetch problems", err);
            }
        };
        if (token) fetchProblems();
    }, [contestId, token]);

    console.log(problems);

    // Debounce Username Input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUsername(usernameInput);
            setCurrentPage(0); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [usernameInput]);

    // Data Fetching
    const fetchSubmissions = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            // تنظيف الفلاتر وضمان عدم إرسال قيم تعطل الـ Backend
            const filters: SubmissionFilters = {
                page: currentPage,
                size: pageSize,
                handle: debouncedUsername.trim() || undefined,
                result: (selectedResult === "ALL" || !selectedResult) ? undefined : selectedResult,
                language: (selectedLang === "ALL" || !selectedLang) ? undefined : selectedLang,
                problem_id: selectedProblem || undefined,
            };

            const response = await ContestService.getContestSubmissions(contestId, filters, token);
            setSubmissions(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (err) {
            console.error("Failed to fetch submissions", err);
        } finally {
            setIsLoading(false);
        }
    }, [contestId, token, currentPage, pageSize, debouncedUsername, selectedResult, selectedLang, selectedProblem]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    // Verdict Color Formatting
    const getVerdictStyle = (verdict: string) => {
        if (!verdict) return "text-gray-500";
        if (verdict.toUpperCase() === "ACCEPTED") return "text-green-600 font-semibold";
        return "text-red-500 font-semibold";
    };

    const formatVerdict = (verdict: string) => {
        if (!verdict) return "—";
        return verdict.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Safe Date Formatter (لحماية الـ UI من الـ Microseconds الطويلة والـ Invalid Date)
    const formatSubmissionDate = (dateString: string) => {
        try {
            if (!dateString) return "—";
            // تنظيف الـ String وقص جزء الملي ثانية الزائد إن وجد
            const cleanString = dateString.includes('.') ? dateString.split('.')[0] + 'Z' : dateString;
            const date = new Date(cleanString);

            if (isNaN(date.getTime())) return "—";

            return date.toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(',', '');
        } catch {
            return "—";
        }
    };

    // Pagination Helper
    const renderPagination = () => {
        const pages = [];
        const maxVisible = 3;

        for (let i = 0; i < Math.min(maxVisible, totalPages); i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === i
                        ? "bg-[#1b3f82] text-white font-bold"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    {i + 1}
                </button>
            );
        }

        if (totalPages > maxVisible + 1) {
            pages.push(<span key="dots" className="text-gray-400 px-1">..</span>);
            pages.push(
                <button
                    key={totalPages - 1}
                    onClick={() => setCurrentPage(totalPages - 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === totalPages - 1
                        ? "bg-[#1b3f82] text-white font-bold"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    {totalPages}
                </button>
            );
        } else if (totalPages > maxVisible) {
            pages.push(
                <button
                    key={totalPages - 1}
                    onClick={() => setCurrentPage(totalPages - 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === totalPages - 1
                        ? "bg-[#1b3f82] text-white font-bold"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Title */}
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-[#1b3f82]">Contest Submissions</h2>
                {isLoading && (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500" />
                )}
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f8faff] text-[11px] font-bold text-[#1b3f82] uppercase tracking-wider">
                            <th className="px-6 py-4">
                                <div className="mb-2">Username</div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        className="w-full pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] font-normal lowercase focus:outline-none focus:ring-1 focus:ring-[#1b3f82]/30 focus:border-[#1b3f82]"
                                    />
                                    <FontAwesomeIcon icon={faSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]" />
                                </div>
                            </th>
                            <th className="px-6 py-4">
                                <div className="mb-2 text-center">Prob</div>
                                <div className="relative">
                                    <select
                                        value={selectedProblem}
                                        onChange={(e) => { setSelectedProblem(e.target.value); setCurrentPage(0); }}
                                        className="w-full appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] font-normal focus:outline-none focus:ring-1 focus:ring-[#1b3f82]/30 text-center cursor-pointer"
                                    >
                                        <option value="" className="text-center text-gray-500">ALL</option>
                                        {problems && problems.map((p: any) => {
                                            // لقط المعرف والاسم سواء كاموا بـ CamelCase أو Underscore
                                            const pId = p.problemId || p.problem_id;
                                            const pTitle = p.title || p.title;

                                            return (
                                                <option key={pId} value={pId}>
                                                    {pTitle}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] pointer-events-none" />
                                </div>
                            </th>
                            <th className="px-6 py-4">
                                <div className="mb-2 text-center">Result</div>
                                <div className="relative">
                                    <select
                                        value={selectedResult}
                                        onChange={(e) => { setSelectedResult(e.target.value); setCurrentPage(0); }}
                                        className="w-full appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] font-normal focus:outline-none focus:ring-1 focus:ring-[#1b3f82]/30 text-center"
                                    >
                                        {RESULTS.map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] pointer-events-none" />
                                </div>
                            </th>
                            <th className="px-6 py-4">
                                <div className="mb-2 text-center">Lang</div>
                                <div className="relative">
                                    <select
                                        value={selectedLang}
                                        onChange={(e) => { setSelectedLang(e.target.value); setCurrentPage(0); }}
                                        className="w-full appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] font-normal focus:outline-none focus:ring-1 focus:ring-[#1b3f82]/30 text-center"
                                    >
                                        <option value="ALL">ALL</option>
                                        {LANGUAGES.slice(1).map((lang) => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] pointer-events-none" />
                                </div>
                            </th>

                            <th className="px-6 py-4 text-center">Submit Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {submissions.length > 0 ? (
                            submissions.map((submission) => (
                                <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[13px] font-semibold text-[#1b3f82] hover:underline cursor-pointer">
                                            {submission.userHandle}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[13px] font-bold text-[#1b3f82]">
                                            {submission.problemAlias}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setIsCodeModalOpen(true);
                                            }}
                                            className={`text-[13px] hover:underline cursor-pointer ${getVerdictStyle(submission.verdict)}`}
                                        >
                                            {formatVerdict(submission.verdict)}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className="text-[13px] text-gray-600">
                                            {submission.language}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center text-[13px] text-gray-400 whitespace-nowrap">
                                        {formatSubmissionDate(submission.submittedAt)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                                    {isLoading ? "Fetching submissions..." : "No submissions found matching the criteria."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 0 && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
                    <div className="flex items-center bg-[#f0f4ff] rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="px-3 py-1.5 text-[13px] font-semibold text-gray-600 hover:text-[#1b3f82] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                        >
                            Prev
                        </button>

                        <div className="flex items-center gap-1">
                            {renderPagination()}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="px-3 py-1.5 text-[13px] font-semibold text-gray-600 hover:text-[#1b3f82] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <CodeModal
                submissionId={selectedSubmission ? Number(selectedSubmission.id) : null}
                verdict={selectedSubmission?.verdict ?? ""}
                ownerHandle={selectedSubmission?.userHandle ?? ""}
                isOpen={isCodeModalOpen}
                onClose={() => {
                    setIsCodeModalOpen(false);
                    setSelectedSubmission(null);
                }}
            />
        </div>
    );
}