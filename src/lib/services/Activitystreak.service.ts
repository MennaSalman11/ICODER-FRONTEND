const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090";
 import { getUserToken } from '../server-utils';

export interface StreakData {
  current_streak: number;
  max_streak: number;
  last_accepted_at: string;
  today_utc: string;
}
 
export async function getActivityStreak(timezone = "UTC"): Promise<StreakData> {
        const { token } = await getUserToken();

  const res = await fetch(
    `${BASE_URL}/api/v1/activity-streak?timezone=${timezone}`,
    {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      method: "GET",
    }
  );
 
  if (!res.ok) {
    throw new Error(`Failed to fetch streak: ${res.status}`);
  }
 
  return res.json();
}
 