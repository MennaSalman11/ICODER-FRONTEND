// src/types/contest.ts

export type ContestType = 'CLASSICAL' | 'GROUP';
export type ContestOpenness = 'public' | 'protected' | 'private';

// هيبعته في الـ Request Body للإنشاء
export interface ProblemSetItem {
  problem_id: number;
  problem_alias: string;
  problem_weight: string;
}

// الـ Interface الكامل اللي الباكند مستنيه بناءً على الـ Swagger
export interface SaveContestRequest {
  group_id: number;
  title: string;
  description: string;
  begin_time: string; // ISO String
  length: string;     // HH:mm:ss
  contest_type: ContestType;
  contest_openness: ContestOpenness;
  password?: string;
  history_rank: boolean;
  problem_set: ProblemSetItem[];
}