"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; 
import { getProfile } from "@/src/lib/services/profile.services";

// استيراد الخدمة الرئيسية المحدثة
import { getRawStats } from "@/src/lib/services/SummaryAi.services"; 

// 🎯 استيراد الأيقونات المتوافقة 100% مع الإصدار v3 في مشروعكِ
import { 
  FaUser as FaUserIcon, 
  FaCode, 
  FaFire, 
  FaCheckCircle,       
  FaTimesCircle,       
  FaClock, 
  FaExclamationTriangle, 
  FaChartLine,          // تم تعديل الاسم هنا ليطابق الحزمة لديكِ وعرض الرسم البياني
  FaMagic,              
  FaBullseye,
  FaEdit               
} from "react-icons/fa";

import Link from "next/link";
import ActivityHeatmap from "@/src/components/ActivityHeatmap";

export default function ProfilePage() {
  const params = useParams();
  const handleFromUrl = params.handle; 
  const [userData, setUserData] = useState<any>(null);

  // قراءة بيانات السيشن
  const { data: session } = useSession();
  const userId = (session?.user as any)?.numericId;

  // Modals & States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  const [statsData, setStatsData] = useState<any>(null);
  const [aiSummaryText, setAiSummaryText] = useState<string>("");
  const [streakData, setStreakData] = useState<any>(null);
  
  const [statsLoading, setStatsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (handleFromUrl) {
      const fetchProfile = async () => {
        const res = await getProfile(handleFromUrl as string);
        if (res.ok) {
          setUserData(res.data);
        }
      };
      fetchProfile();
    }
  }, [handleFromUrl]);

  const handleOpenAnalysis = async () => {
    setIsModalOpen(true);
    if (!userId || statsData) return; 

    try {
      setStatsLoading(true);
      setHasError(false);
      
      const res = await getRawStats(userId);
      
      console.log("🔍 FULL RESPONSE REAL OBJECT:", res);

      if (res.ok && res.data) {
        setStatsData(res.data.stats || null);
        setAiSummaryText(res.data.summary || "No summary found.");
        setStreakData(res.data.streakData || null);
      } else {
        setHasError(true);
      }
    } catch (err) {
      console.error("Error in handleOpenAnalysis:", err);
      setHasError(true);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleToggleAiSummary = () => {
    setIsSummaryOpen(!isSummaryOpen);
  };

  if (!userData) return <div className="text-white text-center py-20">Loading Profile...</div>;

  const displayedStrengths = statsData?.strengths || []; 
  const displayedWeaknesses = statsData?.weaknesses || []; 

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* سيكشن البروفايل الرئيسي */}
      <section className="pt-24 px-4"> 
        <div className="max-w-7xl mx-auto rounded-xl shadow-md p-6 flex justify-between items-center bg-white">
          
          {/* Left Side */}
          <div className="flex items-center space-x-4 space-y-3">
            {userData.picture_url ? (
              <img src={userData.picture_url} alt="profileImg" className="w-16 h-16 rounded-full" />
            ) : (
              <div>
                <FaUserIcon className="w-16 h-16 text-gray-400 rounded-full bg-gray-200 p-2" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{userData.nickname}</h2>
              <p className="text-sm text-gray-600">{userData.handle}</p>
              <p className="text-sm text-gray-600">{userData.email}</p>
              {userData.school ? <p className="text-sm text-gray-600">{userData.school}</p> : <p className="text-sm text-gray-600">No School</p>}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col space-y-2 self-center">
            <button className="bg-[#011f4b] hover:bg-[#203b62] text-white py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap text-sm font-medium flex items-center justify-center gap-2">
              <FaEdit className="text-xs" />
              <Link href={`/profile/${userData.handle}/update-profile`}>
                Edit Profile
              </Link>
            </button>

            <button 
              onClick={handleOpenAnalysis}
              className="border border-[#FF7D40] text-[#FF7D40] hover:bg-orange-50 py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap"
            >
              <FaMagic className="animate-pulse text-[#FF7D40]" /> Analyze My Progress
            </button>
          </div>

        </div>
      </section>

      {/* سيكشن الهيت ماب */}
      <section className="pt-12 px-4 max-w-7xl mx-auto">
        <ActivityHeatmap />
      </section>

      {/* نافذة الـ Progress Analysis المنبثقة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl">
              <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-lg">
                <FaChartLine className="text-[#FF7D40]" /> Progress Analysis
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setIsSummaryOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-medium transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {statsLoading ? (
                <div className="text-center py-12 text-gray-500 font-medium animate-pulse flex flex-col items-center justify-center gap-3">
                  <span className="text-2xl animate-spin">🔄</span>
                  Aggregating submissions data... Please wait.
                </div>
              ) : hasError ? (
                <div className="text-center py-6 text-red-500 font-medium flex items-center justify-center gap-2">
                  <FaTimesCircle /> Failed to load statistics. Please try again later.
                </div>
              ) : statsData ? (
                <>
                  {/* Performance Overview Grid */}
                  <div>
                    <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">Performance Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Total Submissions</p>
                          <p className="text-lg text-green-600 font-bold">{statsData.totalSubmissions || 0}</p>
                        </div>
                        <FaCode className="text-gray-300 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Overall Acceptance</p>
                          <p className="text-lg text-blue-600 font-bold">{statsData.overallAcRate || 0}%</p>
                        </div>
                        <FaCheckCircle className="text-blue-200 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Recent Acceptance</p>
                          <p className="text-lg text-orange-500 font-bold">{statsData.recentAcRate || 0}%</p>
                        </div>
                        <FaCheckCircle className="text-orange-200 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Current Streak</p>
                          <p className="text-lg text-red-500 font-bold">
                            {streakData?.current_streak || 0} Days
                          </p>
                        </div>
                        <FaFire className="text-red-400 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Time Limit Exceeded</p>
                          <p className="text-lg text-amber-500 font-bold">{statsData.tleCount || 0}</p>
                        </div>
                        <FaClock className="text-amber-200 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Runtime Error</p>
                          <p className="text-lg text-red-500 font-bold">{statsData.rteCount || 0}</p>
                        </div>
                        <FaExclamationTriangle className="text-red-200 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Memory Limit Exceeded</p>
                          <p className="text-lg text-purple-600 font-bold">{statsData.mleCount || 0}</p>
                        </div>
                        <FaExclamationTriangle className="text-purple-200 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Compilation Errors</p>
                          <p className="text-lg text-rose-600 font-bold">{statsData.compilationErrorCount || 0}</p>
                        </div>
                        <FaTimesCircle className="text-rose-200 text-lg mt-0.5" />
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight mb-1">Most Used Language</p>
                          <p className="text-lg text-orange-600 font-bold">{statsData.mostUsedLanguage || "N/A"}</p>
                        </div>
                        <FaCode className="text-orange-200 text-lg mt-0.5" />
                      </div>

                    </div>
                  </div>

                  {/* سيكشن الـ Strengths & Areas to Improve */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="text-sm font-bold text-green-600 flex items-center gap-1.5 mb-2">
                        <FaChartLine className="text-xs" /> Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {displayedStrengths.length > 0 ? (
                          displayedStrengths.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 text-xs font-semibold rounded-md shadow-2xs">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No specific strengths calculated yet.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-red-600 flex items-center gap-1.5 mb-2">
                        <FaBullseye className="text-xs" /> Areas to Improve
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {displayedWeaknesses.length > 0 ? (
                          displayedWeaknesses.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-md shadow-2xs">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No specific weaknesses calculated yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {/* سيكشن الـ AI Summary المنسدل */}
              <div className="pt-4 flex flex-col items-center border-t border-gray-100">
                <button
                  onClick={handleToggleAiSummary}
                  className="px-6 py-2 bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] text-xs font-bold rounded-lg flex items-center gap-4 transition-all hover:bg-gray-200 shadow-2xs"
                >
                  <span className="flex items-center gap-1.5"><FaMagic className="text-orange-500" /> AI Summary</span>
                  <span className="text-[10px] transition-transform duration-200">
                    {isSummaryOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isSummaryOpen && (
                  <div className="w-full mt-4 bg-white border border-gray-200 rounded-xl p-5 text-gray-700 text-xs leading-relaxed shadow-inner">
                    <div className="flex items-center gap-1.5 font-bold text-[#FF7A38] mb-3 text-sm">
                      <FaMagic /> AI Coaching Summary
                    </div>
                    <p className="whitespace-pre-line text-left text-gray-600 font-normal">
                      {aiSummaryText}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}