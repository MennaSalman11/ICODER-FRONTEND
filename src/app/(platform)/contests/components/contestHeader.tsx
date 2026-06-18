"use client";

import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faArrowLeft,
    faStar,
    faGear,
    faClone,
    faRotateRight,
    faTrash,
    faPenToSquare,
    faCalendarDays,
    faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";


interface ContestHeaderProps {
    contest: {
        title: string;
        begin_time: string;
        end_time: string;
        owner_handle: string;
        owner_id: string;

    };
    onDelete?: () => Promise<void>;
    onEditClick?: () => void;
    
}


// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(begin: string, end: string): string {
    const opts: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    };
    const b = new Date(begin).toLocaleString("en-US", opts);
    const e = new Date(end).toLocaleString("en-US", opts);
    return `${b} UTC – ${e} UTC`;
}



// ─────────────────────────────────────────────────────────────────────────────

export default function ContestHeader({ contest, onDelete, onEditClick }: ContestHeaderProps) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState("");
    const [progress, setProgress] = useState(0);
    const [contestStatus, setContestStatus] = useState<"Running" | "Scheduled" | "Ended">("Scheduled");

    const start = useMemo(() => new Date(contest.begin_time).getTime(), [contest.begin_time]);
    const end = useMemo(() => new Date(contest.end_time).getTime(), [contest.end_time]);

    // ── Countdown + progress + status (logic untouched) ──────────────────────
    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const totalDuration = end - start;
            const elapsed = now - start;

            // Progress calculation
            if (now < start) {
                setProgress(0);
                setContestStatus("Scheduled");
            } else if (now > end) {
                setProgress(100);
                setContestStatus("Ended");
            } else {
                setProgress((elapsed / totalDuration) * 100);
                setContestStatus("Running");
            }

            // Countdown calculation
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft("Ended");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m Remaining`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s Remaining`);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [start, end]);

    // ── Status pill styles ────────────────────────────────────────────────────
    const statusStyles: Record<string, string> = {
        Running: "bg-green-100 text-green-700 border border-green-200",
        Scheduled: "bg-blue-50  text-blue-600  border border-blue-200",
        Ended: "bg-gray-100 text-gray-500  border border-gray-200",
    };

    const statusDot: Record<string, string> = {
        Running: "bg-green-500",
        Scheduled: "bg-blue-400",
        Ended: "bg-gray-400",
    };

    // Determine if contest hasn't started yet (for "Starts in" prefix)
    const now = Date.now();
    const notStarted = now < start;

    // "Starts in …" countdown when not yet started
    const startsIn = (() => {
        if (!notStarted) return "";
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `Starts in ${days}d ${hours}h ${minutes}m`;
    })();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 pt-5 pb-4">

                {/* ── Status badge + creator line ─────────────────────────── */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[contestStatus]}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[contestStatus]} ${contestStatus === "Running" ? "animate-pulse" : ""}`} />
                        {contestStatus}
                    </span>
                    <span className="text-gray-400 text-xs">Created by {contest.owner_handle}</span>
                </div>

                {/* ── Title row ───────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                        {/* Back button */}
                        <button
                            onClick={() => router.back()}
                            className="mt-1 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors cursor-pointer shrink-0"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                        </button>

                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight truncate">
                                {contest.title}
                            </h1>

                            {/* Date range */}
                            <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400 text-xs shrink-0" />
                                {formatDateRange(contest.begin_time, contest.end_time)}
                            </p>

                            {/* Timer — orange with clock icon */}
                            {timeLeft && timeLeft !== "Ended" && (
                                <p className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 mt-0.5">
                                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                                    {notStarted ? startsIn : timeLeft}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Action buttons ───────────────────────────────────── */}
                    
                    <div className="flex items-center gap-1 shrink-0 mt-1">
                        <button
                            onClick={onEditClick}
                            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            title="Edit contest"
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete contest"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                    </div>
                   
                </div>

                {/* ── Progress bar ─────────────────────────────────────────── */}
                <div className="mt-5">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400 font-medium">Contest Progress</span>
                        <span className="text-xs text-gray-500 font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(34,197,94,0.35)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}