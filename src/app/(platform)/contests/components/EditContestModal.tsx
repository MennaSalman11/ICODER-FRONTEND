"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JudgeType = "CODEFORCES" | "CSES" | "V_JUDGE";
type VerifyStatus = "idle" | "loading" | "success" | "error";

interface Problem {
    id: string;
    judgeType: JudgeType;
    problemCode: string;    // e.g. "1030A"
    verifiedId: number | null; // resolved from API — sent on submit
    verifyStatus: VerifyStatus;
    alias: string;
    weight: number | "";
}

interface ContestFormData {
    title: string;
    description: string;
    beginTime: string;
    length: string;
    contestType: "CLASSICAL" | "GROUP";
    openness: "public" | "protected" | "private";
    password?: string;
    historyRank: boolean;
}

interface EditContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any;
    onSave: (formData: any) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 9);
const PROBLEMS_API_BASE = "http://localhost:9090/api/v1/problems";

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditContestModal({ isOpen, onClose, initialData, onSave }: EditContestModalProps) {
    const { data: session } = useSession();
    const token = (session as any)?.accessToken as string | undefined;

    const [formData, setFormData] = useState<ContestFormData>({
        title: "",
        description: "",
        beginTime: "",
        length: "",
        contestType: "CLASSICAL",
        openness: "public",
        password: "",
        historyRank: false,
    });
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Seed form from initialData when modal opens ───────────────────────────

    useEffect(() => {
        if (isOpen && initialData) {
            console.log("Initial Data Received in Modal:", initialData);

            // 1. Safe date conversion
            let localISOTime = "";
            const rawDate = initialData.begin_time || initialData.beginTime;
            if (rawDate) {
                const date = new Date(rawDate);
                if (!isNaN(date.getTime())) {
                    const offset = date.getTimezoneOffset() * 60000;
                    localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
                }
            }

            const currentContestType = initialData.contest_type || initialData.contestType ;
            const currentOpenness =
                initialData.contest_openness || initialData.contestOpenness || initialData.openness ;

            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                beginTime: localISOTime,
                length: initialData.length || "",
                contestType: initialData.contest_type,
                openness: initialData.contest_openness,
                password: initialData.password || "",
                historyRank:
                    initialData.history_rank !== undefined
                        ? !!initialData.history_rank
                        : !!initialData.historyRank,
            });

            // 2. Map existing problem set — existing problems are treated as pre-verified
            //    We store judgeType/problemCode as empty and mark as "success" so the
            //    row is valid; the verifiedId is set from the stored problem_id.
            const rawProblemSet = initialData.problem_set || initialData.problemSet;
            if (rawProblemSet && Array.isArray(rawProblemSet)) {
                setProblems(
                    rawProblemSet.map((p: any) => ({
                        id: generateId(),
                        judgeType: (p.judge_type || p.judgeType || "CODEFORCES") as JudgeType,
                        problemCode: p.problem_code || p.problemCode || "",
                        verifiedId:
                            p.problem_id !== undefined
                                ? Number(p.problem_id)
                                : p.problemId !== undefined
                                    ? Number(p.problemId)
                                    : null,
                        // Existing problems from the backend are considered verified
                        verifyStatus: "success",
                        alias: p.problem_alias || p.problemAlias || p.alias || "",
                        weight:
                            p.problem_weight !== undefined
                                ? p.problem_weight
                                : p.problemWeight !== undefined
                                    ? p.problemWeight
                                    : "",
                    }))
                );
            } else {
                setProblems([]);
            }
        }
    }, [isOpen, initialData]);

    // ── Form helpers ──────────────────────────────────────────────────────────

    const handleChange = <K extends keyof ContestFormData>(key: K, value: ContestFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const updateProblemField = (id: string, updates: Partial<Omit<Problem, "id">>) => {
        setProblems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const addProblem = () => {
        setProblems((prev) => [
            ...prev,
            {
                id: generateId(),
                judgeType: "CODEFORCES",
                problemCode: "",
                verifiedId: null,
                verifyStatus: "idle",
                alias: "",
                weight: "",
            },
        ]);
    };

    const removeProblem = (id: string) => {
        setProblems((prev) => prev.filter((p) => p.id !== id));
    };

    // ── Problem Metadata API ──────────────────────────────────────────────────

    const verifyProblem = useCallback(
        async (id: string, judgeType: JudgeType, problemCode: string) => {
            const code = problemCode.trim();
            if (!code) return;

            updateProblemField(id, { verifyStatus: "loading", verifiedId: null });

            try {
                const headers: Record<string, string> = {};
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const response = await fetch(
                    `${PROBLEMS_API_BASE}/${judgeType}/${encodeURIComponent(code)}/metadata`,
                    { method: "GET", headers }
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                const resolvedId = data?.problem_id ?? data?.id ?? null;

                if (resolvedId === null) throw new Error("problem_id missing in response");

                updateProblemField(id, {
                    verifyStatus: "success",
                    verifiedId: Number(resolvedId),
                });
            } catch {
                updateProblemField(id, { verifyStatus: "error", verifiedId: null });
            }
        },
        [token]
    );

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Please enter a contest title.");
            return;
        }

        if (!formData.beginTime) {
            toast.error("Please enter a begin time.");
            return;
        }

        const isGroupPrivate =
            initialData?.group_openness === "private" || initialData?.group?.openness === "private";
        if (isGroupPrivate && formData.openness !== "private") {
            toast.error("This contest belongs to a private group. Openness must be set to PRIVATE.");
            return;
        }

        const rawLength = formData.length.trim();
        const lengthRegex = /^([0-9]{1,2}):([0-5][0-9])(:([0-5][0-9]))?$/;
        if (!lengthRegex.test(rawLength)) {
            toast.error("Length must be in HH:mm or HH:mm:ss format.");
            return;
        }

        // Guard: no unverified or broken rows
        const hasUnverified = problems.some((p) => p.verifyStatus !== "success");
        if (problems.length > 0 && hasUnverified) {
            toast.error("Please verify all problems before saving.");
            return;
        }

        const beginTimeISO = new Date(formData.beginTime).toISOString();
        const lengthFormatted = rawLength.split(":").length === 2 ? `${rawLength}:00` : rawLength;

        const payload = {
            id: Number(initialData?.id),
            contestId: Number(initialData?.id),
            contest_id: Number(initialData?.id),

            group_id:
                initialData?.group_id !== undefined
                    ? Number(initialData.group_id)
                    : initialData?.groupId !== undefined
                        ? Number(initialData.groupId)
                        : null,

            title: formData.title.trim(),
            description: formData.description.trim(),
            begin_time: beginTimeISO,
            length: lengthFormatted,
            contest_type: formData.contestType,
            contest_openness: formData.openness,
            history_rank: formData.historyRank,

            // Map using verified IDs from the API
            problem_set: problems.map((p) => ({
                problem_id: p.verifiedId!,
                problem_alias: p.alias.trim(),
                problem_weight: String(p.weight),
            })),

            ...(formData.openness === "protected" && { password: formData.password }),
        };

        setIsSubmitting(true);
        try {
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error("Error updating contest:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // ── Derived state ─────────────────────────────────────────────────────────
    const hasInvalidProblem = problems.some(
        (p) => p.verifyStatus === "error" || (p.problemCode.trim() && p.verifyStatus === "idle")
    );

    // ── Style tokens ──────────────────────────────────────────────────────────
    const inputCls =
        "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition placeholder:text-gray-400 text-gray-900";
    const selectCls =
        "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition bg-white text-gray-900 cursor-pointer";
    const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Contest</h2>
                            <p className="text-sm text-gray-500 mt-1">Update the contest details below.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="px-6 pb-6 space-y-5">

                            {/* Title */}
                            <div>
                                <label className={labelCls}>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            {/* Begin Time + Length */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Begin Time</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.beginTime}
                                        onChange={(e) => handleChange("beginTime", e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Length (HH:mm:ss)</label>
                                    <input
                                        type="text"
                                        value={formData.length}
                                        onChange={(e) => handleChange("length", e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Contest Type + Openness */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Contest Type</label>
                                    <select
                                        value={formData.contestType}
                                        onChange={(e) => handleChange("contestType", e.target.value as any)}
                                        className={selectCls}
                                    >
                                        <option value="CLASSICAL">CLASSICAL</option>
                                        <option value="GROUP">GROUP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Openness</label>
                                    <select
                                        value={formData.openness}
                                        onChange={(e) => handleChange("openness", e.target.value as any)}
                                        className={selectCls}
                                    >
                                        <option value="public">PUBLIC</option>
                                        <option value="protected">PROTECTED</option>
                                        <option value="private">PRIVATE</option>
                                    </select>
                                </div>
                            </div>

                            {/* Password */}
                            {formData.openness === "protected" && (
                                <div>
                                    <label className={labelCls}>Password</label>
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                            )}

                            {/* ── Problem Set ──────────────────────────── */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Problem Set
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addProblem}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1b4583] border border-[#1b4583] rounded-lg hover:bg-[#1b4583]/5 transition cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                        Add Problem
                                    </button>
                                </div>

                                {problems.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                        No problems added yet. Click &quot;+ Add Problem&quot; to start.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Column headers */}
                                        <div className="grid grid-cols-[120px_1fr_70px_70px_36px] gap-2 px-1">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                Judge
                                            </span>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                Problem Code
                                            </span>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                Alias
                                            </span>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                Weight
                                            </span>
                                            <span />
                                        </div>

                                        {problems.map((problem) => (
                                            <div
                                                key={problem.id}
                                                className="animate-in fade-in slide-in-from-top-1 duration-150"
                                            >
                                                {/* Input row */}
                                                <div className="grid grid-cols-[120px_1fr_70px_70px_36px] gap-2 items-center">
                                                    {/* Judge Type Dropdown */}
                                                    <select
                                                        value={problem.judgeType}
                                                        onChange={(e) => {
                                                            const newJudge = e.target.value as JudgeType;
                                                            updateProblemField(problem.id, {
                                                                judgeType: newJudge,
                                                                verifyStatus: "idle",
                                                                verifiedId: null,
                                                            });
                                                            if (problem.problemCode.trim()) {
                                                                verifyProblem(problem.id, newJudge, problem.problemCode);
                                                            }
                                                        }}
                                                        className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition bg-white text-gray-700 cursor-pointer w-full"
                                                    >
                                                        <option value="CODEFORCES">CODEFORCES</option>
                                                        <option value="CSES">CSES</option>
                                                        <option value="V_JUDGE">V_JUDGE</option>
                                                    </select>

                                                    {/* Problem Code Input */}
                                                    <input
                                                        type="text"
                                                        value={problem.problemCode}
                                                        onChange={(e) =>
                                                            updateProblemField(problem.id, {
                                                                problemCode: e.target.value,
                                                                verifyStatus: "idle",
                                                                verifiedId: null,
                                                            })
                                                        }
                                                        onBlur={() =>
                                                            verifyProblem(problem.id, problem.judgeType, problem.problemCode)
                                                        }
                                                        placeholder="e.g. 1030A"
                                                        className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition placeholder:text-gray-400 w-full font-mono ${problem.verifyStatus === "error"
                                                                ? "border-red-400 bg-red-50"
                                                                : problem.verifyStatus === "success"
                                                                    ? "border-green-400 bg-green-50"
                                                                    : "border-gray-300"
                                                            }`}
                                                    />

                                                    {/* Alias */}
                                                    <input
                                                        type="text"
                                                        value={problem.alias}
                                                        onChange={(e) =>
                                                            updateProblemField(problem.id, { alias: e.target.value })
                                                        }
                                                        placeholder="A"
                                                        maxLength={5}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition placeholder:text-gray-400 w-full text-center font-mono"
                                                    />

                                                    {/* Weight */}
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={problem.weight}
                                                        onChange={(e) =>
                                                            updateProblemField(problem.id, {
                                                                weight: e.target.value === "" ? "" : Number(e.target.value),
                                                            })
                                                        }
                                                        placeholder="1"
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition placeholder:text-gray-400 w-full text-center"
                                                    />

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProblem(problem.id)}
                                                        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                                        title="Remove problem"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Verification status feedback */}
                                                {problem.verifyStatus === "loading" && (
                                                    <p className="text-xs text-blue-500 mt-1 pl-1 flex items-center gap-1">
                                                        <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                        Loading...
                                                    </p>
                                                )}
                                                {problem.verifyStatus === "success" && (
                                                    <p className="text-xs text-green-600 mt-1 pl-1">
                                                        ✅ Verified (ID: {problem.verifiedId})
                                                    </p>
                                                )}
                                                {problem.verifyStatus === "error" && (
                                                    <p className="text-xs text-red-500 mt-1 pl-1">
                                                        ⚠️ Invalid Judge or Problem Code
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Footer ─────────────────────────────────────────── */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || hasInvalidProblem}
                                title={hasInvalidProblem ? "Verify all problems before saving" : undefined}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-[#1b4583] hover:bg-[#163a6e] rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}