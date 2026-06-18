"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface Problem {
    id?: string | number;
    problem_id?: number;
    problem_alias?: string;
    title?: string;
    solved_count?: number;
    attempted_count?: number;
    solved?: boolean;
    alias?: string;
    status?: string;
    online_judge?: string;
    problem_code?: string;
}

interface ProblemsTableProps {
    problems: Problem[];
    beginTime?: string;
    endTime?: string;
    contestId?: string;
}

function getAlphaLabel(index: number): string {
    let label = "";
    let temp = index;

    while (temp >= 0) {
        label = String.fromCharCode((temp % 26) + 65) + label;
        temp = Math.floor(temp / 26) - 1;
    }
    return label;
}

export default function ProblemsTable({ problems, beginTime, endTime }: ProblemsTableProps) {
    const [contestStatus, setContestStatus] = useState<"upcoming" | "running" | "ended">("upcoming");

    useEffect(() => {
        if (!endTime) return;

        const checkStatus = () => {
            const now = new Date();
            const start = beginTime ? new Date(beginTime) : new Date();
            const end = new Date(endTime);

            if (now < start) {
                setContestStatus("upcoming");
            } else if (now >= start && now <= end) {
                setContestStatus("running");
            } else {
                setContestStatus("ended");
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 10000); // تحديث الحالة تلقائياً كل 10 ثواني

        return () => clearInterval(interval);
    }, [beginTime, endTime]);

    console.log(problems);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* ── Table header bar ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCode} className="text-orange-500 text-sm" />
                    <h3 className="text-sm font-bold text-gray-800">Contest Problems</h3>
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-100">
                            <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16">Status</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-20">#</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Problem Title</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-24 text-center">Solved</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-24 text-center">Attempts</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                        {(!problems || problems.length === 0) ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                                    No problems added to this contest yet.
                                </td>
                            </tr>
                        ) : (
                            problems.map((problem, idx) => {
                                const autoIndexLabel = getAlphaLabel(idx);
                                const displayTitle = problem.title || `Problem ${autoIndexLabel}`;
                                const isSolved = problem.solved === true || problem.status === "solved";

                                const solvedCount = problem.solved_count ?? "—";
                                const attemptCount = problem.attempted_count ?? "—";

                                // حماية ضد الـ undefined: بياخد المتاح من الـ API سواء id أو problem_id
                                const problemCode = problem.problem_code || problem.problem_id || problem.id;

                                // المسار النهائي اللي هيطلع بالظبط زي الصورة: /problems/CODEFORCES/71A
                                const featureProblemPath = `/problems/${problem.online_judge}/${problemCode}`;

                                return (
                                    <tr key={problem.id || problem.problem_id || idx} className="group hover:bg-orange-50/30 transition-colors duration-150">
                                        {/* أيقونة الحالة */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                {isSolved ? (
                                                    <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-lg" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="text-gray-300 text-lg group-hover:text-gray-400 transition-colors" />
                                                )}
                                            </div>
                                        </td>

                                        {/* رمز المسألة A, B, C */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-700 uppercase">{autoIndexLabel}</span>
                                        </td>

                                        {/* التايتل والتحكم في اللينك حسب حالة الكونتست */}
                                        <td className="px-6 py-4">
                                            {contestStatus === "upcoming" ? (
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 select-none cursor-not-allowed" title="Contest has not started yet">
                                                    <span>{displayTitle}</span>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200/60">
                                                        Not Started Yet
                                                    </span>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={featureProblemPath}
                                                    className="text-sm font-semibold text-[#1b4583] hover:text-blue-700 hover:underline transition-colors"
                                                >
                                                    {displayTitle}
                                                </Link>
                                            )}
                                        </td>

                                        {/* عدد الحلول الصحيحة */}
                                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                                            {solvedCount}
                                        </td>

                                        {/* عدد المحاولات */}
                                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                                            {attemptCount}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}