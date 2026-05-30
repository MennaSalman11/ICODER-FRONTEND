import { getUserToken } from '@/src/lib/server-utils';

// 1. تحديث واجهة الإحصائيات الفرعية لتطابق حقول الباك إند
export interface StatsDetails {
  totalSubmissions: number;
  overallAcRate: number;
  recentAcRate: number;
  tleCount: number;
  rteCount: number;
  mleCount: number;
  compilationErrorCount: number;
  strengths: string[];
  weaknesses: string[];
  mostUsedLanguage: string;
}

// 2. الواجهة الرئيسية الراجعة من الـ API (تجمع الـ Stats والـ Summary معاً)
export interface RawStatsResponse {
  stats: StatsDetails;
  summary: string;
  streakData?: {
    current_streak: number;
    max_streak: number;
  } | null;
}

export interface AiSummaryData {
  summaryText?: string;
  text?: string;
  [key: string]: any; 
}

/**
 * جلب البيانات الكاملة (الإحصائيات والملخص) بناءً على رد السيرفر الفعلي
 */
export async function getRawStats(userId: string): Promise<{ ok: true; data: RawStatsResponse } | { ok: false; error: string }> {
  try {
    const { token } = await getUserToken();

    // تم تعديل الرابط للمسار الذي يعطي الداتا كاملة كما ظهر بالكونسول
    const res = await fetch(`http://localhost:9090/api/v1/summary/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    
    const data: RawStatsResponse = await res.json();
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || "Failed to load stats" };
  }
}

/**
 * دالة احتياطية في حال رغبتِ في مناداة الذكاء الاصطناعي بشكل منفصل لاحقاً
 */
export async function getAiSummary(userId: string): Promise<{ ok: true; data: AiSummaryData } | { ok: false; error: string }> {
  try {
    const { token } = await getUserToken();

    const res = await fetch(`http://localhost:9090/api/v1/summary/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const data: AiSummaryData = await res.json();
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || "Failed to load AI summary" };
  }
}