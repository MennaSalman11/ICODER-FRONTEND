"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";

interface Contest {
    id: string;
    title: string;
    beginTime: string;
    length: string;
    participantsCount: number;
}

interface GroupContestsTableProps {
    contests: Contest[];
    groupId: string;
}

const GroupContestsTable = ({ contests, groupId }: GroupContestsTableProps) => {
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
                <Link
                    href={`/groups/${groupId}/contests`}
                    className="text-sm text-gray-500 hover:text-[#1b4583] transition-colors font-medium"
                >
                    View All
                </Link>
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
                                Participants
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {contests.length === 0 ? (
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
                                        {contest.beginTime}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {contest.length}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <FontAwesomeIcon
                                                icon={faTrophy}
                                                className="text-gray-400 text-xs"
                                            />
                                            x{contest.participantsCount}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupContestsTable;
