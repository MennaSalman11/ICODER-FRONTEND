"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faVideo,
    faChevronLeft,
    faChevronRight,
    faCircle
} from "@fortawesome/free-solid-svg-icons";
import { MeetingsService, MeetingResponse } from "@/src/lib/services/meetings-services";
import QuickSessionModal from "./quick-session-modal";
import CreateOfficialMeetingModal from "./create-official-meeting-modal";

// ─── Components ────────────────────────────────────────────────────────────────

interface GroupMeetingsTableProps {
    groupId: number;
    groupName: string;
    token?: string;
}

export default function GroupMeetingsTable({ groupId, groupName, token }: GroupMeetingsTableProps) {
    const [isQuickModalOpen, setIsQuickModalOpen] = React.useState(false);
    const [isOfficialModalOpen, setIsOfficialModalOpen] = React.useState(false);

    // ─── Real Data State ──────────────────────────────────────────────────────
    const [meetings, setMeetings] = React.useState<MeetingResponse[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(0);
    const pageSize = 5;

    const fetchMeetings = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await MeetingsService.getGroupMeetings(
                groupId,
                { page: currentPage, size: pageSize },
                token
            );
            setMeetings(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch meetings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId, currentPage, token]);

    React.useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    const formatMeetingTime = (meeting: MeetingResponse) => {
        const isQuick = meeting.type === "quick_session";
        const dateStr = isQuick ? meeting.created_at : meeting.scheduled_start_time;

        if (!dateStr) return "N/A";

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "N/A";

        if (isQuick) {
            return `Started at ${date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })}`;
        }

        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            {/* Header Section */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="text-[#1b3f82] text-xl">
                        <FontAwesomeIcon icon={faVideo} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Meetings</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOfficialModalOpen(true)}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-[#1b3f82] hover:bg-[#152f61] rounded-lg transition-colors cursor-pointer"
                    >
                        Create Official Meeting
                    </button>
                    <button
                        onClick={() => setIsQuickModalOpen(true)}
                        className="px-5 py-2.5 text-sm font-bold text-[#1b3f82] bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    >
                        Quick Session
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafd]">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                Begin/End Time
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100  relative">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-[3px] border-[#1b3f82] border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm text-gray-400 font-medium">Loading meetings...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : meetings.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center text-gray-400 text-sm">
                                    No meetings found for this group.
                                </td>
                            </tr>
                        ) : (
                            meetings.map((meeting) => (
                                <tr key={meeting.id} className={` transition-colors ${meeting.status.toLowerCase() === "ongoing" ? "bg-gray-100" : ""} `}>
                                    <td className="px-6 py-5 ">
                                        <div className="flex items-start gap-3 ">
                                            {meeting.status.toLowerCase() === "ongoing" && (
                                                <div className="mt-1.7 ">
                                                    <FontAwesomeIcon
                                                        icon={faCircle}
                                                        className="text-[10px] text-lime-400 animate-pulse"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                {meeting.status.toLowerCase() === "ongoing" ? (
                                                    <a
                                                        href={`https://meet.jit.si/${meeting.room_name}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[15px] font-bold text-[#1b3f82] hover:underline transition-all"
                                                    >
                                                        {meeting.title}
                                                    </a>
                                                ) : (
                                                    <span className="text-[15px] font-bold text-[#1b3f82]">
                                                        {meeting.title}
                                                    </span>
                                                )}

                                                {/* Subtext based on status */}
                                                
                                                {meeting.status.toLowerCase() === "scheduled" && (
                                                    <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                        🔒 Meeting hasn&apos;t started yet
                                                    </span>
                                                )}
                                                {meeting.status.toLowerCase() === "ended" && (
                                                    <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                        ⌛ Session ended
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-gray-500 not-italic">
                                            {meeting.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap not-italic">

                                            {formatMeetingTime(meeting)}

                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center ">
                                        <StatusBadge status={meeting.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0 || isLoading}
                        className="p-2 text-gray-400 hover:text-[#1b3f82] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx)}
                            disabled={isLoading}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer
                                ${currentPage === idx
                                    ? "bg-[#1b3f82] text-white"
                                    : "text-gray-500 hover:bg-gray-100"}
                                disabled:opacity-50
                            `}
                        >
                            {idx + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage >= totalPages - 1 || isLoading}
                        className="p-2 text-gray-400 hover:text-[#1b3f82] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                </div>
            </div>

            {/* Quick Session Modal */}
            <QuickSessionModal
                isOpen={isQuickModalOpen}
                onClose={() => setIsQuickModalOpen(false)}
                groupId={groupId}
                token={token}
                onSuccess={fetchMeetings}
            />

            {/* Create Official Meeting Modal */}
            <CreateOfficialMeetingModal
                isOpen={isOfficialModalOpen}
                onClose={() => setIsOfficialModalOpen(false)}
                groupId={groupId}
                groupName={groupName}
                token={token}
                onSuccess={fetchMeetings}
            />
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, string> = {
        "ongoing": "bg-lime-200 text-lime-700",
        "scheduled": "bg-blue-50 text-blue-600",
        "ended": "bg-gray-100 text-gray-500",
    };

    const colorClasses = configs[status] || "bg-gray-100 text-gray-500";

    return (
        <span className={`inline-flex px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${colorClasses}`}>
            {status}
        </span>
    );
}
