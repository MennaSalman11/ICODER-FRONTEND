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


export async function getRawStats(userId: string) {
  try {
    const { token } = await getUserToken();

    const res = await fetch(`http://localhost:9090/api/v1/summary/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message || `Error: ${res.status}` };
    }

    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function getAiSummary(userId: string): Promise<{ ok: true; data: AiSummaryData } | { ok: false; error: string }> {
  try {
    const { token } = await getUserToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/summary/${userId}`, {
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