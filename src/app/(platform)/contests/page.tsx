"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ContestService } from "@/src/lib/services/contest-services";
import ContestCard, { Contest } from "@/src/app/(platform)/contests/components/ContestCard";
import ContestFilterBar from "@/src/app/(platform)/contests/components/ContestFilterBar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterState {
    title: string;
    group_name: string;
    openness: string;
    status: string; // "running" | "ended" | "scheduled" | ""
}

const emptyFilters: FilterState = {
    title: "",
    group_name: "",
    openness: "",
    status: "",
};

// ─── Compute status client-side so we can filter it ─────────────────────────

function getStatus(c: Contest): "running" | "ended" | "scheduled" {
    const now = Date.now();
    const s = new Date(c.begin_time).getTime();
    const e = new Date(c.end_time).getTime();
    if (now < s) return "scheduled";
    if (now > e) return "ended";
    return "running";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContestsPage() {
    const { data: session } = useSession();
    const token = (session as any)?.accessToken as string | undefined;

    // ── Raw data from API ─────────────────────────────────────────────────────
    const [allContests, setAllContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Filter state: "draft" (what user types) vs "applied" (what drives API) ─
    const [draft, setDraft] = useState<FilterState>(emptyFilters);
    const [applied, setApplied] = useState<FilterState>(emptyFilters);

    // ── Fetch from backend ────────────────────────────────────────────────────
    const fetchContests = useCallback(async (f: FilterState) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await ContestService.getAllContestsGlobal(
                {
                    title: f.title.trim() || undefined,
                    group_name: f.group_name.trim() || undefined,
                    size: 50,
                },
                token
            );
            // API returns paginated response: { content: Contest[], totalPages, ... }
            const raw: Contest[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.content)
                    ? data.content
                    : [];
            setAllContests(raw);
        } catch (err: any) {
            setError(err?.message ?? "Failed to load contests.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Initial load
    useEffect(() => {
        fetchContests(applied);
    }, [fetchContests]);  // intentionally only on mount / token change

    // ── Client-side filtering (openness + status) ─────────────────────────────
    const displayed = allContests.filter((c) => {
        if (applied.openness && c.openness !== applied.openness) return false;
        if (applied.status && getStatus(c) !== applied.status) return false;
        return true;
    });

    // ── Filter handlers ───────────────────────────────────────────────────────
    const handleDraftChange = (key: keyof FilterState, value: string) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        setApplied(draft);
        fetchContests(draft);
    };

    const handleReset = () => {
        setDraft(emptyFilters);
        setApplied(emptyFilters);
        fetchContests(emptyFilters);
    };
console.log(allContests);
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f4f5f7] mt-20 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ── Page header ─────────────────────────────────────────── */}
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Contests
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Browse and join programming contests.
                    </p>
                </div>

                {/* ── Filter bar ───────────────────────────────────────────── */}
                <ContestFilterBar
                    filters={applied}
                    draft={draft}
                    onDraftChange={handleDraftChange}
                    onApply={handleApply}
                    onReset={handleReset}
                />

                {/* ── Contest list ─────────────────────────────────────────── */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-400 font-medium">Loading contests...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm px-6 py-10 text-center">
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                        <button
                            onClick={() => fetchContests(applied)}
                            className="mt-3 text-xs font-semibold text-[#1b3f82] hover:underline cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 text-center">
                        <p className="text-gray-400 text-sm">No contests found matching the selected filters.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayed.map((contest) => (
                            <ContestCard key={contest.id} contest={contest} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}