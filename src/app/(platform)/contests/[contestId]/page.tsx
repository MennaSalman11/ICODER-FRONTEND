"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ContestService } from "@/src/lib/services/contest-services";
import ContestHeader from "../components/contestHeader";
import ContestTabs from "../components/contestTaps";
import ProblemsTable from "../components/problemsTable";
import EditContestModal from "../components/EditContestModal";
import { toast } from "sonner";

// استيراد الأيقونات للكارت الجديد
import { 
    FiInfo, 
    FiUser, 
    FiUsers, 
    FiActivity, 
    FiClock, 
    FiArrowRight 
} from "react-icons/fi";
import ScoreBoard from "../components/scoreBoard";

export default function ContestDashboardPage() {
    const params = useParams();
    const contestId = params.contestId as string;

    // ── States ────────────────────────────────────────────────────────────
    const [contestData, setContestData] = useState<any>(null);
    const [problems, setProblems] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [fetchError, setFetchError] = useState<string>(""); // 🎯 تم حل مشكلة TypeScript هنا

    const { data: session } = useSession();
    const token = (session as any)?.accessToken;
    const router = useRouter();

    const handleDeleteContest = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this contest?");
        if (!confirmed) return;

        try {
            await ContestService.deleteContest(contestId, token);
            toast.success("Contest deleted successfully!");

            const groupName = contestData.group_name || contestData.groupName;
            router.push(`/groups/${groupName}`);
        } catch (error) {
            console.error("Failed to delete contest:", error);
            toast.error("Failed to delete contest. Please try again.");
        }
    };

    const handleUpdateContest = async (formData: any) => {
        try {
            const updated = await ContestService.updateContest(contestId, formData, token);
            setContestData(updated);
            toast.success("Contest updated successfully!");
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update contest:", error);
            toast.error("Failed to update contest. Please try again.");
            throw error;
        }
    };

    // ── Fetch Contest Data ─────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            if (!contestId || contestId === "undefined" || !token) return;

            setIsLoading(true);
            setFetchError("");
            try {
                // 1. جلب مسائل المسابقة في الخلفية
                const problemsPromise = ContestService.getContestProblems(contestId, token)
                    .catch(err => {
                        console.error("Failed to fetch problems:", err);
                        return []; 
                    });

                // 2. طلب الداتا من المسار العادي مباشرة (مع تمرير false لأن مفيش GET protected منفصل)
                // السيرفر طالما لقاكِ باعتة الـ Token وعاملة Join للمسابقة من الـ Swagger هيوافق يرجع الداتا فوراً
                const details = await ContestService.getContestById(contestId, token);
                
                // 3. انتظار داتا المسائل
                const problemsData = await problemsPromise;

                // 4. حفظ البيانات في الـ States
                setContestData(details);

                const mappedProblems = problemsData.map((p: any) => ({
                    problem_id: p.problem_id,
                    problem_alias: p.problem_alias,
                    title: p.title,
                    solved_count: p.solved_count,
                    attempted_count: p.attempted_count,
                    solved: p.solved,
                    origin: p.origin || p.problem_origin, 
                }));

                setProblems(mappedProblems);

            } catch (error: any) {
                console.error("Complete fetch error:", error);
                setFetchError(error.response?.data?.message || error.message || "Failed to load contest data.");
                toast.error("Failed to load contest data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [contestId, token]);

    // حساب الـ Duration تلقائياً
    const getDurationText = () => {
        if (contestData?.length) return contestData.length;
        if (contestData?.begin_time && contestData?.end_time) {
            const diff = new Date(contestData.end_time).getTime() - new Date(contestData.begin_time).getTime();
            const days = Math.round(diff / (1000 * 60 * 60 * 24));
            return days > 0 ? `${days} Days` : "1 Day";
        }
        return "7 Days";
    };

    // تحديد ستايل الـ Status للـ Badge الجانبي
    const getContestStatus = () => {
        const now = new Date();
        const start = new Date(contestData?.begin_time);
        const end = new Date(contestData?.end_time);

        if (now < start) {
            return { text: "Upcoming", styles: "text-blue-600 font-bold bg-blue-50/50 border border-blue-100" };
        } else if (now >= start && now <= end) {
            return { text: "Running", styles: "text-green-600 font-bold bg-green-50/50 border border-green-100" };
        } else {
            return { text: "Ended", styles: "text-gray-500 font-bold bg-gray-50 border border-gray-200" };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center mt-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading Contest Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!contestData) {
        return (
            <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center mt-20">
                <div className="text-red-500 font-medium">{fetchError || "Contest not found."}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f5f7] mt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ── 1. Contest Header ──────────────────────────────── */}
                <ContestHeader
                    contest={contestData}
                    onDelete={handleDeleteContest}
                    onEditClick={() => setIsEditModalOpen(true)}
                />

                {/* ── 2. Tabs Bar ─────────────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4">
                    <ContestTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        endTime={contestData.end_time}
                    />
                </div>

                {/* ── 3. Tab Content ───────────────────────────────────────── */}

                {/* ── Overview Tab ─────────────────────────────────────────── */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                            {/* الوصف (يمين الشاشة بالصورة الأصلية) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-4">
                                        <FiInfo className="text-orange-500 text-xl stroke-[2.5]" />
                                        <h2>About Contest</h2>
                                    </div>
                                    <p className="text-gray-600 text-[14.5px] leading-relaxed whitespace-pre-line">
                                        {contestData.description || "Welcome to this contest! No description provided."}
                                    </p>
                                </div>
                                <div className="bg-blue-50/40 border border-blue-100/70 rounded-xl p-4 flex items-start gap-3">
                                    <p className="text-blue-900 text-[13.5px] font-medium leading-relaxed">
                                        Pro-tip: Ensure your solutions account for tight memory limits, and make sure to test your code thoroughly before submitting.
                                    </p>
                                </div>
                            </div>

                            {/* معلومات الكونتست والزرار */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-full space-y-6">
                                <div className="space-y-5">
                                    <h3 className="text-gray-800 font-bold text-base tracking-tight">Contest Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-100"><FiUser className="text-lg stroke-[2.5]" /></div>
                                            <div>
                                                <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Owner</span>
                                                <span className="text-sm font-bold text-blue-950">{contestData.owner_handle || contestData.ownerName || "Admin"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-100"><FiUsers className="text-lg stroke-[2.5]" /></div>
                                            <div>
                                                <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Group</span>
                                                <span className="text-sm font-bold text-blue-950">{contestData.group_name || contestData.groupName || "Public Contest"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-100"><FiActivity className="text-lg stroke-[2.5]" /></div>
                                            <div>
                                                <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                                                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold mt-0.5 ${getContestStatus().styles}`}>
                                                    {getContestStatus().text}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-100"><FiClock className="text-lg stroke-[2.5]" /></div>
                                            <div>
                                                <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Duration</span>
                                                <span className="text-sm font-bold text-blue-950">{getDurationText()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab("problems")}
                                    className="w-full bg-[#1b4380] hover:bg-[#143464] text-white font-semibold text-sm py-3.5 px-4 rounded-xl shadow-md shadow-blue-900/10 transition-all duration-200 flex items-center justify-center gap-2 group"
                                >
                                    <span>Enter Workspace</span>
                                    <FiArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* جدول المسائل أسفل الكارت */}
                        <ProblemsTable problems={problems} endTime={contestData.end_time} contestId={contestId} />

                    </div>
                )}

                {/* ── Problems Tab ─────────────────────────────────────────── */}
                {activeTab === "problems" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <ProblemsTable problems={problems} endTime={contestData.end_time} contestId={contestId} />
                    </div>
                )}

                {/* ── Status Tab ───────────────────────────────────────────── */}
                {activeTab === "status" && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-12 text-center">
                        <p className="text-gray-400 text-sm">Submissions status coming soon...</p>
                    </div>
                )}

                {/* ── Rank Tab ─────────────────────────────────────────────── */}
                {activeTab === "rank" && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-12 text-center">
                       <ScoreBoard/>
                    </div>
                )}
            </div>

            {/* ── Edit Modal ───────────────────────────────────────────────── */}
            <EditContestModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={contestData}
                onSave={handleUpdateContest}
            />
        </div>
    );
}