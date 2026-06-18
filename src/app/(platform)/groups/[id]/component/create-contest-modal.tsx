"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ContestService } from "@/src/lib/services/contest-services";
import { SaveContestRequest, ProblemSetItem } from "@/src/types/contest";
import { toast } from "sonner";
import { group } from "console";

// ─── Types ────────────────────────────────────────────────────────────────────

type JudgeType = "CODEFORCES" | "SCES" | "V_JUDGE";
type VerifyStatus = "idle" | "loading" | "success" | "error";

/** Local UI row — maps to ProblemSetItem on submit */
interface Problem {
    id: string;             // internal React key
    judgeType: JudgeType;
    problemCode: string;    // e.g. "1030A"
    verifiedId: number | null; // resolved from API — sent on submit
    verifyStatus: VerifyStatus;
    alias: string;
    weight: number | "";
}

/** Local form state (camelCase for controlled inputs) */
interface ContestFormData {
    title: string;
    description: string;
    beginTime: string;           // value from datetime-local input
    length: string;              // HH:mm:ss
    contestType: "CLASSICAL" | "GROUP";
    openness: "public" | "protected" | "private";
    password: string;
    historyRank: boolean;
}

interface CreateContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (newContest?: any) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 9);

const initialFormState: ContestFormData = {
    title: "",
    description: "",
    beginTime: "",
    length: "",
    contestType: "CLASSICAL",
    openness: "public",
    password: "",
    historyRank: false,
};

const PROBLEMS_API_BASE = "http://localhost:9090/api/v1/problems";

// ─── Component ────────────────────────────────────────────────────────────────

const CreateContestModal = ({ isOpen, onClose, onSuccess }: CreateContestModalProps) => {
    // ── Extract group ID from the URL (e.g., /groups/[id]) ───────────────────
    const params = useParams();
    const groupId = Number(params.id);

    // ── Auth token — same pattern used across all authenticated components ────
    const { data: session } = useSession();
    const token = (session as any)?.accessToken as string | undefined;

    const [formData, setFormData] = useState<ContestFormData>(initialFormState);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Form helpers ──────────────────────────────────────────────────────────

    const handleChange = <K extends keyof ContestFormData>(key: K, value: ContestFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setProblems([]);
    };

    // ── Problem set helpers ───────────────────────────────────────────────────

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

    const updateProblemField = (id: string, updates: Partial<Omit<Problem, "id">>) => {
        setProblems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const removeProblem = (id: string) => {
        setProblems((prev) => prev.filter((p) => p.id !== id));
    };

    // ── Problem Metadata API ──────────────────────────────────────────────────

    const verifyProblem = useCallback(async (id: string, judgeType: JudgeType, problemCode: string) => {
        const code = problemCode.trim();
        if (!code) return; // Nothing to verify

        updateProblemField(id, { verifyStatus: "loading", verifiedId: null });

        try {
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(
                `${PROBLEMS_API_BASE}/${judgeType}/${encodeURIComponent(code)}/metadata`,
                { method: "GET", headers }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

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
    }, [token]);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ── Client-side validation ────────────────────────────────────────
        if (!formData.title.trim()) {
            toast.error("Please enter a contest title.");
            return;
        }
        if (!formData.beginTime) {
            toast.error("Please set a begin time.");
            return;
        }
        if (!formData.length.trim()) {
            toast.error("Please enter the contest duration (HH:mm:ss).");
            return;
        }
        if (formData.openness === "protected" && !formData.password.trim()) {
            toast.error("A password is required for protected contests.");
            return;
        }

        // Guard: no unverified or broken rows
        const hasUnverified = problems.some((p) => p.verifyStatus !== "success");
        if (problems.length > 0 && hasUnverified) {
            toast.error("Please verify all problems before submitting.");
            return;
        }

        // ── Build the backend payload (snake_case per SaveContestRequest) ─────
        const problemSet: ProblemSetItem[] = problems.map((p) => ({
            problem_id: p.verifiedId!,
            problem_alias: p.alias.trim(),
            problem_weight: String(p.weight),
        }));

        const beginTimeISO = formData.beginTime
            ? new Date(formData.beginTime).toISOString()
            : "";

        const rawLength = formData.length.trim();
        const lengthFormatted = rawLength.split(":").length === 2
            ? `${rawLength}:00`
            : rawLength;

        const payload: SaveContestRequest = {
            group_id: Number(groupId),
            title: formData.title.trim(),
            description: formData.description.trim(),
            begin_time: beginTimeISO,
            length: lengthFormatted,
            contest_type: formData.contestType,
            contest_openness: formData.openness,
            history_rank: formData.historyRank,
            problem_set: problemSet,
            ...(formData.openness === "protected" && { password: formData.password }),
        };

        console.log("CONTEST PAYLOAD:", JSON.stringify(payload, null, 2));

        setIsSubmitting(true);
        try {
            const result = await ContestService.createContest(payload, token);
            toast.success(`Contest "${formData.title}" created successfully!`);
            onSuccess?.(result);
            onClose();
            resetForm();
        } catch (error: any) {
            const msg = error?.message ?? "Failed to create contest. Please try again.";
            toast.error(msg);
            console.log("error", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // ── Derived state ─────────────────────────────────────────────────────────
    const hasInvalidProblem = problems.some(
        (p) => p.verifyStatus === "error" || (p.problemCode.trim() && p.verifyStatus === "idle")
    );

    // ── Shared input class ────────────────────────────────────────────────────
    const inputCls =
        "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition placeholder:text-gray-400";
    const selectCls =
        "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition bg-white text-gray-700 cursor-pointer";
    const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <>
            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* ── Modal ────────────────────────────────────────────────────── */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Header ───────────────────────────────────────────── */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Create New Contest
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Set up a competitive programming contest.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-lg" />
                        </button>
                    </div>

                    {/* ── Body ─────────────────────────────────────────────── */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 pb-6 space-y-5">

                            {/* Title */}
                            <div>
                                <label className={labelCls}>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    placeholder="e.g. Round #42 — Div. 1"
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
                                    placeholder="A brief description of the contest..."
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            {/* Begin Time */}
                            <div>
                                <label className={labelCls}>Begin Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.beginTime}
                                    onChange={(e) => handleChange("beginTime", e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            {/* Length */}
                            <div>
                                <label className={labelCls}>
                                    Length{" "}
                                    <span className="text-gray-400 font-normal">(HH:mm:ss)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.length}
                                    onChange={(e) => handleChange("length", e.target.value)}
                                    placeholder="e.g. 02:00:00"
                                    className={inputCls}
                                />
                            </div>

                            {/* Contest Type */}
                            <div>
                                <label className={labelCls}>Contest Type</label>
                                <select
                                    value={formData.contestType}
                                    onChange={(e) =>
                                        handleChange("contestType", e.target.value as ContestFormData["contestType"])
                                    }
                                    className={selectCls}
                                >
                                    <option value="CLASSICAL">CLASSICAL</option>
                                    <option value="GROUP">GROUP</option>
                                </select>
                            </div>

                            {/* Contest Openness */}
                            <div>
                                <label className={labelCls}>Contest Openness</label>
                                <select
                                    value={formData.openness}
                                    onChange={(e) =>
                                        handleChange("openness", e.target.value as ContestFormData["openness"])
                                    }
                                    className={selectCls}
                                >
                                    <option value="public">PUBLIC</option>
                                    <option value="protected">PROTECTED</option>
                                    {/* <option value="private">PRIVATE</option> */}
                                   
                                        <option value="private">PRIVATE</option>
                                  
                                </select>
                            </div>

                            {/* Password — visible only when PRIVATE */}
                            {formData.openness === "protected" && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    <label className={labelCls}>Password</label>
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        placeholder="Contest access password"
                                        className={inputCls}
                                    />
                                </div>
                            )}

                            {/* ── Problem Set ──────────────────────────────── */}
                            <div>
                                {/* Section header */}
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

                                {/* Problem rows */}
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
                                                            // Re-verify if there's already a code entered
                                                            if (problem.problemCode.trim()) {
                                                                verifyProblem(problem.id, newJudge, problem.problemCode);
                                                            }
                                                        }}
                                                        className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition bg-white text-gray-700 cursor-pointer w-full"
                                                    >
                                                        <option value="CODEFORCES">CODEFORCES</option>
                                                        <option value="SCES">SCES</option>
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

                        {/* ── Footer ───────────────────────────────────────── */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => { onClose(); resetForm(); }}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || hasInvalidProblem}
                                title={hasInvalidProblem ? "Verify all problems before submitting" : undefined}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-[#1b4583] hover:bg-[#163a6e] rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating..." : "Create Contest"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateContestModal;
