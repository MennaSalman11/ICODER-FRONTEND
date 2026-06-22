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
    judge_type?: string;
    origin?: string;
    problem_origin?: string;
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

export default function ProblemsTable({ problems, beginTime, endTime ,contestId}: ProblemsTableProps) {
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
        const interval = setInterval(checkStatus, 10000);

        return () => clearInterval(interval);
    }, [beginTime, endTime]);

    console.log(problems);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
            {/* ── Table header bar ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                        <FontAwesomeIcon icon={faCode} className="text-orange-500 text-sm block" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 tracking-tight">Contest Problems</h3>
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                    <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-100 select-none">
                            <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-20 text-center">Status</th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center">#</th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Problem Title</th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-28 text-center">Origin</th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-24 text-center">Solved</th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-24 text-center">Attempts</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50 bg-white ">
                        {(!problems || problems.length === 0) ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center text-gray-400 text-sm italic font-medium">
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

                                const featureProblemPath = `/problems/${problem.judge_type}/${problem.problem_code}?contestId=${contestId}`;

                                return (
                                    <tr 
                                        key={problem.id || problem.problem_id || idx} 
                                        className="group hover:bg-orange-50/20 transition-colors duration-150"
                                    >
                                        {/* 1. أيقونة الحالة */}
                                        <td className="px-6 py-4 text-center vertical-middle">
                                            <div className="flex items-center justify-center">
                                                {isSolved ? (
                                                    <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-[17px]" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="text-gray-300 text-[17px] group-hover:text-gray-400 transition-colors" />
                                                )}
                                            </div>
                                        </td>

                                        {/* 2. رمز المسألة A, B, C */}
                                        <td className="px-6 py-4 text-center vertical-middle">
                                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide bg-gray-50 group-hover:bg-white border border-gray-100 px-2.5 py-1 rounded-md transition-colors">
                                                {autoIndexLabel}
                                            </span>
                                        </td>

                                        {/* 3. التايتل والتحكم في اللينك */}
                                        <td className="px-6 py-4 vertical-middle">
                                            {contestStatus === "upcoming" ? (
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 select-none cursor-not-allowed" title="Contest has not started yet">
                                                    <span>{displayTitle}</span>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60 uppercase tracking-wide">
                                                        Not Started Yet
                                                    </span>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={featureProblemPath}
                                                    className="text-sm font-semibold text-[#1b4583] hover:text-blue-700 hover:underline transition-colors block duration-150"
                                                >
                                                    {displayTitle}
                                                </Link>
                                            )}
                                        </td>

                                        {/* 4. عمود الأوريجين الأورنج بالسهم (يظهر فقط في الـ ended وموزون المساحة دائماً) */}
                                        <td className="px-6 py-4 text-center vertical-middle">
                                            {contestStatus === "ended" && (problem.origin || problem.problem_origin) ? (
                                                <Link
                                                    href={problem.origin || problem.problem_origin || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors bg-orange-50/60 hover:bg-orange-50  px-2.5 py-1 "
                                                >
                                                    <span>{problem.judge_type}</span>
                                                    <svg 
                                                        className="w-3 h-3 stroke-[2.5]" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                    </svg>
                                                </Link>
                                            ) : (
                                                <span className="text-gray-300 font-medium select-none">—</span>
                                            )}
                                        </td>

                                        {/* 5. عدد الحلول الصحيحة */}
                                        <td className="px-6 py-4 text-center vertical-middle text-sm font-bold text-gray-600">
                                            {solvedCount}
                                        </td>

                                        {/* 6. عدد المحاولات */}
                                        <td className="px-6 py-4 text-center vertical-middle text-sm font-bold text-gray-600">
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