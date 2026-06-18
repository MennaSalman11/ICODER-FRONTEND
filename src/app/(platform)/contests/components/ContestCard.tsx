"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faPeopleGroup,
    faGlobe,
    faLock,
    faShield,
    faLayerGroup,
    faUsers,
    faCheckCircle,
    faClock,
    faCalendarDays,
    faArrowRight,
    faChartBar,
    faXmark,
    faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";
import StatusBadge from "./StatusBadge";
import { ContestService } from "@/src/lib/services/contest-services";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Contest {
    id: number;
    title: string;
    begin_time: string;
    end_time: string;
    contest_type: "CLASSICAL" | "GROUP";
    openness: string; // تم تعميمها لتفادي مشاكل الـ Upper/Lowercase من الـ Backend
    owner_handle?: string;
    group_name?: string;
    group_id?: number;
    solved?: boolean; // بيان حالة الدخول المسبق
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getContestStatus(begin: string, end: string): "running" | "ended" | "scheduled" {
    const now = Date.now();
    const s = new Date(begin).getTime();
    const e = new Date(end).getTime();
    if (now < s) return "scheduled";
    if (now > e) return "ended";
    return "running";
}

function formatTimeRemaining(begin: string, end: string): { text: string; colorCls: string; icon: any } {
    const now = Date.now();
    const s = new Date(begin).getTime();
    const e = new Date(end).getTime();

    if (now < s) {
        const diff = s - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return {
            text: `Starts in ${days} Day${days !== 1 ? "s" : ""}`,
            colorCls: "text-orange-500",
            icon: faCalendarDays,
        };
    }

    if (now > e) {
        const diff = now - e;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const text = days > 0 ? `Ended ${days} day${days !== 1 ? "s" : ""} ago` : `Ended ${hours}h ago`;
        return { text, colorCls: "text-red-500", icon: faCheckCircle };
    }

    const diff = e - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const text = `${days}d ${hours}h ${minutes}m`;
    return { text, colorCls: "text-green-600", icon: faClock };
}

const opennessIcon: Record<string, any> = {
    PUBLIC: faGlobe,
    PROTECTED: faShield,
    PRIVATE: faLock,
};

const typeIcon: Record<string, any> = {
    CLASSICAL: faLayerGroup,
    GROUP: faUsers,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContestCard({ contest }: { contest: Contest }) {
    const router = useRouter();
    const { data: session } = useSession();
    const token = (session as any)?.accessToken as string | undefined;

    // ── State for Password Modal ─────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState("");
    const [targetUrl, setTargetUrl] = useState("");

    const status = useMemo(
        () => getContestStatus(contest.begin_time, contest.end_time),
        [contest.begin_time, contest.end_time]
    );
    const timeInfo = useMemo(
        () => formatTimeRemaining(contest.begin_time, contest.end_time),
        [contest.begin_time, contest.end_time]
    );

    // ── Handler for Navigation ────────────────────────────────────────────────
   // ── Handler for Navigation ────────────────────────────────────────────────
const handleNavigate = (queryString: string = "") => {
    const isOpennessProtected = contest.openness?.toUpperCase() === "PROTECTED";

    // دائماً المسار الموحد، الـ Backend هو المسؤول عن السماح بالدخول
    const finalPath = `/contests/${contest.id}${queryString}`;

    // إذا كانت المسابقة محمية والمستخدم لم يقم بعمل Join مسبقاً، نفتح المودال
    if (isOpennessProtected && !contest.solved) {
        setTargetUrl(finalPath);
        setIsModalOpen(true);
        setError("");
        setPassword("");
    } else {
        // إذا كانت عامة، أو محمية وقد تم الانضمام لها، نتجه للمسار مباشرة
        router.push(finalPath);
    }
};

// ── Handler for joining protected contest ────────────────────────────────
const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
        setError("Password is required");
        return;
    }

    setIsJoining(true);
    setError("");

    try {
        // نرسل الباسوورد للـ API
        await ContestService.joinProtectedContest(contest.id, password, token);

        // عند النجاح، نغلق المودال ونتوجه للمسار الموحد
        setIsModalOpen(false);
        router.push(targetUrl);
    } catch (err: any) {
        console.error("Join Error:", err);
        setError(err.message.error || "Incorrect password or error joining contest");
    } finally {
        setIsJoining(false);
    }
};

    const borderColorCls =
        status === "running" ? "border-l-orange-500" :
            status === "ended" ? "border-l-gray-300" :
                "border-l-orange-300";

    return (
        <>
            <div
                className={`
                    bg-white rounded-xl border border-gray-100 border-l-4 ${borderColorCls}
                    shadow-sm hover:shadow-md transition-shadow duration-200
                    flex items-center gap-6 px-5 py-4
                `}
            >
                {/* ── Status badge + Title + Badges ─────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    {/* Row 1: status + title */}
                    <div className="flex items-center gap-2.5 mb-1">
                        <StatusBadge status={status} />
                        <h3
                            className="text-[15px] font-bold text-[#1b3f82] truncate cursor-pointer hover:underline"
                            onClick={() => handleNavigate("")}
                        >
                            {contest.title}
                        </h3>
                    </div>

                    {/* Row 2: type + openness badges */}
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <FontAwesomeIcon icon={typeIcon[contest.contest_type?.toUpperCase()] ?? faLayerGroup} className="text-[11px]" />
                            {contest.contest_type}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <FontAwesomeIcon icon={opennessIcon[contest.openness?.toUpperCase()] ?? faGlobe} className="text-[11px]" />
                            {contest.openness}
                        </span>
                    </div>
                </div>

                {/* ── Meta: creator ────────────────────────────────────────────── */}
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap shrink-0 w-36">
                    <FontAwesomeIcon icon={faUser} className="text-gray-300 text-xs" />
                    <span>{contest.owner_handle || "—"}</span>
                </div>

                {/* ── Meta: group ──────────────────────────────────────────────── */}
                <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap shrink-0 w-40">
                    <FontAwesomeIcon icon={faPeopleGroup} className="text-gray-300 text-xs" />
                    <span>{contest.group_name || "—"}</span>
                </div>

                {/* ── Timer ────────────────────────────────────────────────────── */}
                <div className={`hidden lg:flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap shrink-0 w-40 ${timeInfo.colorCls}`}>
                    <FontAwesomeIcon icon={timeInfo.icon} className="text-xs" />
                    <span>{timeInfo.text}</span>
                </div>

                {/* ── CTA button ────────────────────────────────────────────────── */}
                <div className="shrink-0 w-40 flex justify-end">
                    {status === "running" && (
                        <button
                            onClick={() => handleNavigate("")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1b3f82] hover:bg-[#152f61] rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                            View Contest
                            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </button>
                    )}

                    {status === "ended" && (
                        <button
                            onClick={() => handleNavigate("?tab=rank")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1b3f82] bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                            View Standings
                            <FontAwesomeIcon icon={faChartBar} className="text-xs" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Password Modal ───────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => !isJoining && setIsModalOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3 text-[#1b3f82]">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faShield} className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Protected Contest</h3>
                                    <p className="text-xs text-gray-500">Authentication required to join</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isJoining}
                                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-50 rounded-lg disabled:opacity-30"
                            >
                                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleJoinSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Contest Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FontAwesomeIcon icon={faLock} className="text-sm" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        autoFocus
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isJoining}
                                        placeholder="Enter password..."
                                        className={`
                                            w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all outline-none
                                            ${error ? "border-red-500 ring-4 ring-red-500/10" : "border-gray-200 focus:border-[#1b3f82] focus:ring-4 focus:ring-blue-500/10"}
                                            disabled:opacity-50 disabled:bg-gray-100
                                        `}
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <span className="text-[11px] font-medium">⚠️ {error}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-[11px] text-gray-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                                Note: You only need to enter the password once. After joining, you will have regular access to this contest.
                            </p>

                            {/* Footer / Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isJoining}
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isJoining}
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#1b3f82] hover:bg-[#152f61] rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isJoining ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Joining...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faUnlockAlt} className="text-[13px]" />
                                            Join Contest
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}