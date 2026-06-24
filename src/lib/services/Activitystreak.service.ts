import { getUserToken } from '../server-utils';


export interface StreakData {
  current_streak: number;
  max_streak: number;
  last_accepted_at: string;
  today_utc: string;
}

export interface ActivityGridDay {
  date: string;
  accepted_count: number;
  attempted_count: number;
}

async function fetchWithAuth(endpoint: string): Promise<any> {
  const { token } = await getUserToken();
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API Error [${res.status}]: Failed to fetch from ${endpoint}`);
  }

  return res.json();
}

export async function getActivityStreak(timezone = "UTC"): Promise<StreakData> {
  return fetchWithAuth(`/api/v1/activity-streak?timezone=${timezone}`);
}

export async function getActivityGrid(year: number, timezone = "UTC"): Promise<ActivityGridDay[]> {
  return fetchWithAuth(`/api/v1/activity-logs/grid?year=${year}&timezone=${timezone}`);
}