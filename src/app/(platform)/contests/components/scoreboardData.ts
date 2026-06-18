// 1. تعريف بنية تفاصيل كل مسألة لكل مستخدم بالظبط كـ Swagger
export interface ProblemResult {
    solved: boolean;
    solvedTime: number;
    wrongAttempts: number;
    firstAccepted: boolean;
}

// 2. تعريف بيانات المتسابق بالكامل
export interface ContestantRank {
    rank: number;
    userId: number;
    handle: string;
    totalScore: number;     // بيمثل الـ SOLVED في الـ UI
    totalPenalty: number;   // بيمثل الـ PENALTY
    problemResults: Record<string, ProblemResult>; // ماب ديناميكية لأسماء المسائل (A, B, C...)
}

// 3. الموك داتا مطابقة تماماً للصورة اللي بعتاها عشان تشوفي الشكل النهائي حقيقي
export const mockScoreboard: ContestantRank[] = [
    {
        rank: 1,
        userId: 101,
        handle: "competitive_ace",
        totalScore: 8,
        totalPenalty: 1042,
        problemResults: {
            "A": { solved: true, solvedTime: 15, wrongAttempts: 0, firstAccepted: true },
            "B": { solved: true, solvedTime: 32, wrongAttempts: 0, firstAccepted: false },
            "C": { solved: true, solvedTime: 45, wrongAttempts: 0, firstAccepted: false },
            "D": { solved: true, solvedTime: 70, wrongAttempts: 0, firstAccepted: true },
            "E": { solved: true, solvedTime: 95, wrongAttempts: 0, firstAccepted: false },
            "F": { solved: true, solvedTime: 120, wrongAttempts: 0, firstAccepted: false },
            "G": { solved: true, solvedTime: 150, wrongAttempts: 0, firstAccepted: true },
            "H": { solved: true, solvedTime: 180, wrongAttempts: 0, firstAccepted: false },
        }
    },
    {
        rank: 2,
        userId: 102,
        handle: "algo_wizard",
        totalScore: 7,
        totalPenalty: 839,
        problemResults: {
            "A": { solved: true, solvedTime: 10, wrongAttempts: 0, firstAccepted: false },
            "B": { solved: true, solvedTime: 22, wrongAttempts: 0, firstAccepted: true },
            "C": { solved: true, solvedTime: 50, wrongAttempts: 0, firstAccepted: false },
            "D": { solved: true, solvedTime: 85, wrongAttempts: 0, firstAccepted: false },
            "E": { solved: true, solvedTime: 100, wrongAttempts: 0, firstAccepted: false },
            "F": { solved: true, solvedTime: 140, wrongAttempts: 0, firstAccepted: false },
            "G": { solved: true, solvedTime: 165, wrongAttempts: 0, firstAccepted: false },
            "H": { solved: false, solvedTime: 0, wrongAttempts: 1, firstAccepted: false },
        }
    },
    {
        rank: 3,
        userId: 103,
        handle: "code_storm",
        totalScore: 5,
        totalPenalty: 612,
        problemResults: {
            "A": { solved: true, solvedTime: 20, wrongAttempts: 0, firstAccepted: false },
            "B": { solved: true, solvedTime: 40, wrongAttempts: 0, firstAccepted: false },
            "C": { solved: true, solvedTime: 65, wrongAttempts: 0, firstAccepted: true },
            "D": { solved: true, solvedTime: 90, wrongAttempts: 0, firstAccepted: false },
            "E": { solved: true, solvedTime: 110, wrongAttempts: 0, firstAccepted: false },
            "F": { solved: false, solvedTime: 0, wrongAttempts: 1, firstAccepted: false },
        }
    },
    {
        rank: 4,
        userId: 104,
        handle: "john_dev",
        totalScore: 4,
        totalPenalty: 428,
        problemResults: {
            "A": { solved: true, solvedTime: 12, wrongAttempts: 0, firstAccepted: false },
            "B": { solved: true, solvedTime: 25, wrongAttempts: 0, firstAccepted: false },
            "C": { solved: true, solvedTime: 55, wrongAttempts: 0, firstAccepted: false },
            "D": { solved: true, solvedTime: 80, wrongAttempts: 0, firstAccepted: false },
            "E": { solved: false, solvedTime: 0, wrongAttempts: 1, firstAccepted: false },
        }
    },
    {
        rank: 5,
        userId: 105,
        handle: "dev_ninja",
        totalScore: 3,
        totalPenalty: 110,
        problemResults: {
            "A": { solved: true, solvedTime: 8, wrongAttempts: 0, firstAccepted: false },
            "B": { solved: true, solvedTime: 18, wrongAttempts: 0, firstAccepted: false },
            "C": { solved: true, solvedTime: 30, wrongAttempts: 0, firstAccepted: false },
            "D": { solved: false, solvedTime: 0, wrongAttempts: 1, firstAccepted: false },
        }
    }
];