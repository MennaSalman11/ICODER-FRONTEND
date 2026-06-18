"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { ContestService } from "@/src/lib/services/contest-services";

interface Contest {
    id: string;
    title: string;
    begin_time: string;
    length: string;
    status: string;
}

interface GroupContestsTableProps {
    groupName: string;
    token?: string;
}

const GroupContestsTable = ({ groupName, token }: GroupContestsTableProps) => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            setIsLoading(true);
            try {
                const response = await ContestService.getAllContests(
                    groupName,
                    currentPage,
                    5,
                    token
                );
                setContests(response.content);
                setTotalPages(response.totalPages);
            } catch (error) {
                console.error("Failed to fetch contests:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContests();
    }, [groupName, currentPage, token]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={faTrophy}
                        className="text-gray-700 text-base"
                    />
                    <h2 className="text-base font-bold text-gray-800">
                        Group Contests
                    </h2>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                Title
                            </th>
                            <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                Begin Time
                            </th>
                            <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                Length
                            </th>
                            <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-8 text-gray-400 text-sm"
                                >
                                    Loading contests...
                                </td>
                            </tr>
                        ) : contests.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-8 text-gray-400 text-sm"
                                >
                                    No contests yet.
                                </td>
                            </tr>
                        ) : (
                            contests.map((contest) => (
                                <tr
                                    key={contest.id}
                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-5 py-3">
                                        <Link
                                            href={`/contests/${contest.id}`}
                                            className="text-[#1b4583] font-medium hover:underline"
                                        >
                                            {contest.title}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3 text-green-500 font-medium">
                                        {formatDate(contest.begin_time)}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {contest.length}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600 uppercase text-xs font-semibold">
                                        {contest.status}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 0 || isLoading}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage >= totalPages - 1 || isLoading}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupContestsTable;
