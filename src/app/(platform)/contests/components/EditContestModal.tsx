"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JudgeType = "CODEFORCES" | "SCES" | "V_JUDGE";
type VerifyStatus = "idle" | "loading" | "success" | "error";

interface Problem {
    id: string;
    judgeType: JudgeType;
    problemCode: string;       
    verifiedId: number | null; 
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
    onSave: (payload: any) => Promise<void>;
    problems?: any[]; 
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 9);
const PROBLEMS_API_BASE = "http://localhost:9090/api/v1/problems";

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditContestModal({ 
    isOpen, 
    onClose, 
    initialData, 
    onSave, 
    problems: incomingProblems 
}: EditContestModalProps) {
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

    // ── Form helpers ──────────────────────────────────────────────────────────

    const handleChange = <K extends keyof ContestFormData>(key: K, value: ContestFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
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
        if (!code) return; 

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

    // ── Seed form from initialData ───────────────────────────────────────────

    useEffect(() => {
        if (isOpen && initialData) {
            let localISOTime = "";
            const rawDate = initialData.begin_time || initialData.beginTime;
            if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                    localISOTime = d.getFullYear() + "-" + 
                        String(d.getMonth() + 1).padStart(2, "0") + "-" + 
                        String(d.getDate()).padStart(2, "0") + "T" + 
                        String(d.getHours()).padStart(2, "0") + ":" + 
                        String(d.getMinutes()).padStart(2, "0");
                }
            }

            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                beginTime: localISOTime,
                length: initialData.length || "",
                contestType: initialData.contest_type || initialData.contestType || "CLASSICAL",
                openness: initialData.contest_openness || initialData.openness || "public",
                password: initialData.password || "",
                historyRank: !!(initialData.history_rank ?? initialData.historyRank),
            });

            if (incomingProblems && Array.isArray(incomingProblems)) {
                const mapped = incomingProblems.map((p: any) => {
                    const id = generateId();
                    const rawJudge = p.judge_type || p.judgeType || "CODEFORCES";
                    const judgeType = (typeof rawJudge === "string" ? rawJudge.toUpperCase() : "CODEFORCES") as JudgeType;
                    const problemCode = p.problem_code || p.problemCode || "";

                    if (problemCode.trim()) {
                        setTimeout(() => {
                            verifyProblem(id, judgeType, problemCode);
                        }, 50);
                    }

                    return {
                        id,
                        judgeType,
                        problemCode,
                        verifiedId: p.problem_id ?? p.problemId ?? p.id ?? null,
                        verifyStatus: "loading" as VerifyStatus, 
                        alias: p.problem_alias || p.alias || "",
                        weight: p.problem_weight ?? p.weight ?? "",
                    };
                });
                setProblems(mapped);
            }
        }
    }, [isOpen, initialData, incomingProblems, verifyProblem]);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
        if (formData.openness === "protected" && !formData.password?.trim()) {
            toast.error("A password is required for protected contests.");
            return;
        }

        const hasUnverified = problems.some((p) => p.verifyStatus !== "success");
        if (problems.length > 0 && hasUnverified) {
            toast.error("Please verify all problems before submitting.");
            return;
        }

        const problemSet = problems.map((p) => ({
            problem_id: p.verifiedId!,
            problem_alias: p.alias.trim(),
            problem_weight: String(p.weight),
        }));

        const beginTimeISO = formData.beginTime ? new Date(formData.beginTime).toISOString() : "";
        const rawLength = formData.length.trim();
        const lengthFormatted = rawLength.split(":").length === 2 ? `${rawLength}:00` : rawLength;

        const payload = {
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

        setIsSubmitting(true);
        try {
            await onSave(payload);
            toast.success("Contest updated successfully!");
            onClose();
        } catch (error: any) {
            const msg = error?.message || "Failed to update contest.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const hasInvalidProblem = problems.some(
        (p) => p.verifyStatus === "error" || (p.problemCode.trim() && p.verifyStatus === "idle")
    );

    // 🎨 تحسين الاستايلات لتكون أنعم ومريحة للعين (Soft borders, subtle shadow, clean text)
    const inputCls =
        "w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583]/20 focus:border-[#1b4583] transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-400 font-medium text-gray-800";
    const selectCls =
        "w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583]/20 focus:border-[#1b4583] transition-all bg-gray-50/50 focus:bg-white text-gray-700 font-medium cursor-pointer";
    const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-50">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Contest</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Update configuration and manage the problem set.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-2 hover:bg-gray-50 rounded-xl"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                        {/* 2-Column Responsive Grid to Avoid Scrolling */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            
                            {/* Left Column: Contest Info (5 Cols) */}
                            <div className="md:col-span-5 space-y-4">
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

                                <div>
                                    <label className={labelCls}>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        rows={2}
                                        placeholder="Brief contest overview..."
                                        className={`${inputCls} resize-none`}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 ">
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
                                        <label className={labelCls}>Length <span className="text-gray-400 font-normal">(HH:mm:ss)</span></label>
                                        <input
                                            type="text"
                                            value={formData.length}
                                            onChange={(e) => handleChange("length", e.target.value)}
                                            placeholder="02:00:00"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
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

                                {formData.openness === "protected" && (
                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                        <label className={labelCls}>Password</label>
                                        <input
                                            type="text"
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            placeholder="Access password"
                                            className={inputCls}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Problem Set (7 Cols) */}
                            <div className="md:col-span-7 border-l border-gray-100 pl-0 md:pl-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Problem Set</label>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Problems automatically verify on blur.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addProblem}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1b4583] bg-[#1b4583]/5 rounded-xl hover:bg-[#1b4583]/10 transition cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                                        Add Problem
                                    </button>
                                </div>

                                {/* Problem Row List container */}
                                <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                    {problems.length === 0 ? (
                                        <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                                            <p className="text-xs font-medium text-gray-400">
                                                No problems added yet. Click "+ Add Problem" to populate.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Table Headers */}
                                            <div className="grid grid-cols-[110px_1fr_65px_65px_36px] gap-2 px-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Judge</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Problem Code</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Alias</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Weight</span>
                                                <span />
                                            </div>

                                            {/* Rows */}
                                            {problems.map((problem) => (
                                                <div key={problem.id} className="space-y-1.5 animate-in fade-in duration-150">
                                                    <div className="grid grid-cols-[110px_1fr_65px_65px_36px] gap-2 items-center">
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
                                                            className="px-2 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/50 font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1b4583]/20"
                                                        >
                                                            <option value="CODEFORCES">CODEFORCES</option>
                                                            <option value="SCES">SCES</option>
                                                            <option value="V_JUDGE">V_JUDGE</option>
                                                        </select>

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
                                                            className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1b4583]/20 transition font-mono ${
                                                                problem.verifyStatus === "error"
                                                                    ? "border-red-200 bg-red-50/50 text-red-700"
                                                                    : problem.verifyStatus === "success"
                                                                    ? "border-green-200 bg-green-50/50 text-green-700"
                                                                    : "border-gray-200 bg-gray-50/50"
                                                            }`}
                                                        />

                                                        <input
                                                            type="text"
                                                            value={problem.alias}
                                                            onChange={(e) => updateProblemField(problem.id, { alias: e.target.value })}
                                                            placeholder="A"
                                                            maxLength={5}
                                                            className="px-2 py-2 border border-gray-200 bg-gray-50/50 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#1b4583]/20"
                                                        />

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
                                                            className="px-2 py-2 border border-gray-200 bg-gray-50/50 rounded-xl text-xs text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#1b4583]/20"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => removeProblem(problem.id)}
                                                            className="flex items-center justify-center w-8 h-8 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="w-3" />
                                                        </button>
                                                    </div>

                                                    {/* Clean Inline Badges for Verification Status */}
                                                    {problem.verifyStatus === "loading" && (
                                                        <div className="text-[11px] text-blue-500 pl-1 flex items-center gap-1.5 font-medium">
                                                            <span className="inline-block w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                            Checking backend...
                                                        </div>
                                                    )}
                                                    {problem.verifyStatus === "success" && (
                                                        <div className="text-[11px] text-green-600 pl-1 font-medium flex items-center gap-1">
                                                            <span>• Verified (ID: {problem.verifiedId})</span>
                                                        </div>
                                                    )}
                                                    {problem.verifyStatus === "error" && (
                                                        <div className="text-[11px] text-red-500 pl-1 font-medium flex items-center gap-1">
                                                            <span>• Invalid Judge or Code</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/30 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || hasInvalidProblem}
                                className="px-5 py-2 text-sm font-semibold text-white bg-[#1b4-[#1b4583] bg-[#1b4583] hover:bg-[#153769] rounded-xl transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Saving changes..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}