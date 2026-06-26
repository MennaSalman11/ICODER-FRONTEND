"use client";

import React, { useState } from "react";

// فانكشن مساعدة لتحويل الأرقام لحروف أبجدية (0 -> A, 1 -> B...)
const getProblemLetter = (index: number) => {
    return String.fromCharCode(65 + index);
};

export default function ScoreBoardMock() {
    // 1. الموك داتا مبنية بالظبط عشان تطلع نفس النتيجة اللي في الصورة
    const [leaderboard] = useState([
        {
            userId: 1,
            rank: 1,
            handle: "roaazz",
            solved: 8,
            penalty: 1042,
            problemResults: {
                "1": { solved: true, firstAccepted: true, wrongAttempts: 0 },   // A: أخضر غامق
                "2": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // B: أخضر فاتح
                "3": { solved: false, firstAccepted: false, wrongAttempts: 1 },  // C: أخضر فاتح
                "4": { solved: true, firstAccepted: true, wrongAttempts: 0 },   // D: أخضر غامق
                "5": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // E: أخضر فاتح
                "6": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // F: أخضر فاتح
                "7": { solved: true, firstAccepted: true, wrongAttempts: 0 },   // G: أخضر غامق
                "8": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // H: أخضر فاتح
            }
        },
        {
            userId: 2,
            rank: 2,
            handle: "saam_03",
            solved: 7,
            penalty: 839,
            problemResults: {
                "1": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // A
                "2": { solved: true, firstAccepted: true, wrongAttempts: 0 },   // B: أخضر غامق
                "3": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // C
                "4": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // D
                "5": { solved: true, firstAccepted: true, wrongAttempts: 0 },  // E
                "6": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // F
                "7": { solved: false, firstAccepted: false, wrongAttempts: 0 },  // G
                "8": { solved: false, firstAccepted: false, wrongAttempts: 1 }, // H: أحمر (-1)
            }
        },
        {
            userId: 3,
            rank: 3,
            handle: "ruaamohamedd",
            solved: 4,
            penalty: 612,
            problemResults: {
                "1": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // A
                "2": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // B
                "3": { solved: true, firstAccepted: true, wrongAttempts: 0 },   // C: أخضر غامق
                "4": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // D
                "5": { solved: true, firstAccepted: false, wrongAttempts: 0 },  // E
                "6": { solved: false, firstAccepted: false, wrongAttempts: 1 }, // F: أحمر (-1)
                // G و H غير موجودين (شرطة)
            }
        },
       
       
    ]);

    // تجميع أرقام المسائل الفريدة من الموك داتا وترتيبها (من 1 إلى 8)
    const problemNumbers = Array.from(
        new Set(leaderboard.flatMap((c) => Object.keys(c.problemResults || {}).map(Number)))
    ).sort((a, b) => a - b);

    // تحويل الأرقام إلى الحروف المقابلة لها (1->A, 2->B...)
    const problemLabels = problemNumbers.map((num, index) => ({
        numberKey: String(num), // حوّلناه لـ string هنا علطول عشان يطابق الـ object keys
        letterLabel: getProblemLetter(index)
    }));

    return (
        <div className="w-full bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden p-6">
            {/* عنوان الكارت */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Scoreboard</h2>
            </div>

            {/* الجدول responsive وبيدعم التمرير الأفقي */}
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full min-w-max border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-gray-200">
                            <th className="px-4 py-4 text-center font-bold text-slate-700 uppercase text-xs tracking-wider w-16">Rank</th>
                            <th className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider min-w-[160px]">Handle</th>
                            <th className="px-4 py-4 text-center font-bold text-slate-700 uppercase text-xs tracking-wider w-24">Solved</th>
                            <th className="px-4 py-4 text-center font-bold text-slate-700 uppercase text-xs tracking-wider w-24">Penalty</th>

                            {/* هيدر المسائل الديناميكي (A, B, C...) */}
                            {problemLabels.map((item) => (
                                <th key={item.numberKey} className="px-2 py-4 text-center font-bold text-blue-900 uppercase text-xs tracking-wider w-14">
                                    {item.letterLabel}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                        {leaderboard.map((row) => (
                            <tr key={row.userId} className="hover:bg-slate-50/60 transition-colors duration-150">
                                <td className="px-4 py-4 text-center font-bold text-slate-800">{row.rank}</td>
                                <td className="px-6 py-4 font-medium text-blue-700 hover:underline cursor-pointer">{row.handle}</td>
                                <td className="px-4 py-4 text-center font-bold text-slate-800 text-base">{row.solved}</td>
                                <td className="px-4 py-4 text-center font-medium text-gray-400 font-mono">{row.penalty}</td>

                                {/* رسم خلايا المسائل بالظبط بنفس ألوان الصورة */}
                                {problemLabels.map((item) => {
                                    const result = row.problemResults[item.numberKey as keyof typeof row.problemResults];
                                    // 1. لم يتم تقديم أي حل (-)
                                    if (!result) {
                                        return (
                                            <td key={item.numberKey} className="px-2 py-4 text-center text-gray-400 font-medium font-mono border-l border-gray-50">-</td>
                                        );
                                    }

                                    // 2. أول من حل المسألة (أخضر غامق احترافي)
                                    if (result.solved && result.firstAccepted) {
                                        return (
                                            <td key={item.numberKey} className="px-2 py-4 text-center font-semibold bg-emerald-700 text-white border border-white font-mono shadow-sm">
                                                {result.wrongAttempts + 1}
                                            </td>
                                        );
                                    }

                                    // 3. تم الحل بنجاح ولكن ليس الأول (أخضر فاتح مريح)
                                    if (result.solved) {
                                        return (
                                            <td key={item.numberKey} className="px-2 py-4 text-center font-semibold bg-emerald-50 text-emerald-600 border border-white font-mono">
                                                {result.wrongAttempts + 1}
                                            </td>
                                        );
                                    }

                                    // 4. محاولات خاطئة ولم تحل بعد (أحمر فاتح)
                                    if (!result.solved && result.wrongAttempts > 0) {
                                        return (
                                            <td key={item.numberKey} className="px-2 py-4 text-center font-semibold bg-rose-50 text-rose-500 border border-white font-mono">
                                                -{result.wrongAttempts}
                                            </td>
                                        );
                                    }

                                    return <td key={item.numberKey} className="px-2 py-4 text-center text-gray-400 font-medium font-mono border-l border-gray-50">-</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}