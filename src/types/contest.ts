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

export interface SubmissionFilters {
  handle?: string;
  result?: string; // الـ verdict مثل 'failed' أو 'accepted'
  language?: string;
  problem_id?: number | string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface Submission {
  id: string;
  userHandle: string;
  userId: string;
  onlineJudge: string;
  problemId: string;
  problemAlias: string;
  verdict: string;
  language: string;
  submittedAt: string;
  isOpen: boolean;
  timeUsage?: number;
  memoryUsage?: number;
}

export interface PaginatedSubmissionsResponse {
  content: Submission[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ProblemResult {
  solved: boolean;
  solvedTime: number;
  wrongAttempts: number;
  firstAccepted: boolean;
}


export interface LeaderboardRow {
  rank: number;
  userId: number;
  handle: string;
  totalScore: number;
  totalPenalty: number;
  // الـ Key هنا بيكون كود المسألة أو الـ property الـ dynamic زي ما واضح في السواجر
  problemResults: Record<string, ProblemResult>; 
}

