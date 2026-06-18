"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSliders } from "@fortawesome/free-solid-svg-icons";

interface FilterState {
    title: string;
    group_name: string;
    openness: string;
    status: string;
}

interface ContestFilterBarProps {
    filters: FilterState;
    draft: FilterState;
    onDraftChange: (key: keyof FilterState, value: string) => void;
    onApply: () => void;
    onReset: () => void;
}

export default function ContestFilterBar({
    draft,
    onDraftChange,
    onApply,
    onReset,
}: ContestFilterBarProps) {
    const inputCls =
        "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b3f82]/30 focus:border-[#1b3f82] transition bg-white";

    const selectCls =
        "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b3f82]/30 focus:border-[#1b3f82] transition bg-white cursor-pointer appearance-none pr-8";

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <div className="flex flex-wrap items-end gap-3">

                {/* ── Search by contest name ──────────────────────────────── */}
                <div className="relative flex-1 min-w-[180px]">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm pointer-events-none"
                    />
                    <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => onDraftChange("title", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onApply()}
                        placeholder="Search by contest name"
                        className={inputCls}
                    />
                </div>

                {/* ── Search by group name ─────────────────────────────────── */}
                <div className="relative flex-1 min-w-[180px]">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm pointer-events-none"
                    />
                    <input
                        type="text"
                        value={draft.group_name}
                        onChange={(e) => onDraftChange("group_name", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onApply()}
                        placeholder="Search by group name"
                        className={inputCls}
                    />
                </div>

                {/* ── Openness dropdown ─────────────────────────────────────── */}
                <div className="min-w-[140px]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1 ml-0.5">
                        Openness
                    </p>
                    <div className="relative">
                        <select
                            value={draft.openness}
                            onChange={(e) => onDraftChange("openness", e.target.value)}
                            className={selectCls}
                        >
                            <option value="">All Types</option>
                            <option value="public">Public</option>
                            <option value="protected">Protected</option>
                            <option value="private">Private</option>
                        </select>
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                    </div>
                </div>

                {/* ── Status dropdown ──────────────────────────────────────── */}
                <div className="min-w-[140px]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1 ml-0.5">
                        Status
                    </p>
                    <div className="relative">
                        <select
                            value={draft.status}
                            onChange={(e) => onDraftChange("status", e.target.value)}
                            className={selectCls}
                        >
                            <option value="">All Types</option>
                            <option value="running">Running</option>
                            <option value="ended">Ended</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                    </div>
                </div>

                {/* ── Action buttons ────────────────────────────────────────── */}
                <div className="flex items-center gap-2 self-end pb-0">
                    <button
                        onClick={onApply}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1b3f82] hover:bg-[#152f61] rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                        <FontAwesomeIcon icon={faSliders} className="text-xs" />
                        Apply Filters
                    </button>
                    <button
                        onClick={onReset}
                        className="px-5 py-2.5 text-sm font-semibold text-[#1b3f82] bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
