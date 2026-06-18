"use client";

import React from "react";
import { mockScoreboard, ContestantRank } from "./scoreboardData";

export default function ScoreBoard() {
    // 1. استخراج كل أسماء المسائل الفريدة (A, B, C...) ديناميكياً لعرضها في الهيدر
    const problemLabels = Array.from(
        new Set(mockScoreboard.flatMap((c) => Object.keys(c.problemResults)))
    ).sort();

    return (
        // تعديل: الحشو الخارجي بقى p-4 على الموبايل وبيزيد لـ p-6 على الشاشات الأكبر
        <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-6">
            
            {/* عنوان الكومبوننت */}
            <div className="mb-4 sm:mb-6 flex items-start justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-[#1b4583]">Scoreboard</h2>
            </div>

            {/* الجدول - حاوية التمرير الأفقي */}
            {/* إضافة حماية لشريط التمرير ليظهر بشكل ناعم */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                {/* تعديل: إضافة min-w-max تضمن إن الجدول ميتعصرش على الموبايل وتفضل المسافات ثابتة */}
                <table className="w-full min-w-max border-collapse text-left table-fixed sm:table-auto">
                    <thead>
                        <tr className="bg-slate-50 border-b border-gray-100">
                            {/* تعديل: تقليل الحشو للنصوص (px-2 للموبايل و px-4 للشاشات الكبيرة) */}
                            <th className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider w-12 sm:w-16 text-center">Rank</th>
                            <th className="px-3 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[120px] sm:min-w-[180px]">Handle</th>
                            <th className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider w-16 sm:w-24 text-center">Solved</th>
                            <th className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider w-16 sm:w-24 text-center">Penalty</th>
                            
                            {/* عواميد المسائل الديناميكية */}
                            {problemLabels.map((label) => (
                                <th key={label} className="px-1 sm:px-2 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-bold text-[#1b4583] uppercase tracking-wider text-center w-10 sm:w-14">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {mockScoreboard.map((row) => (
                            <tr key={row.userId} className="hover:bg-slate-50/50 transition-colors duration-150">
                                {/* الـ Rank */}
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-800">
                                    {row.rank}
                                </td>

                                {/* اسم المستخدم */}
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#1b4583] hover:underline cursor-pointer truncate max-w-[140px] sm:max-w-none">
                                    {row.handle}
                                </td>

                                {/* عدد المسائل المحلولة */}
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-800">
                                    {row.totalScore}
                                </td>

                                {/* الـ Penalty */}
                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-500">
                                    {row.totalPenalty}
                                </td>

                                {/* خلايا حالة المسائل */}
                                {problemLabels.map((label) => {
                                    const result = row.problemResults[label];

                                    // 1. لو المتسابق لم يقم بأي محاولة على المسألة دي نهائياً
                                    if (!result) {
                                        return (
                                            <td key={label} className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-300">
                                                -
                                            </td>
                                        );
                                    }

                                    // 2. حالة الـ First Accepted -> أخضر غامق
                                    if (result.solved && result.firstAccepted) {
                                        return (
                                            <td key={label} className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold bg-green-600 text-white border border-white">
                                                {result.wrongAttempts + 1}
                                            </td>
                                        );
                                    }

                                    // 3. حالة الـ Solved العادية -> أخضر فاتح
                                    if (result.solved) {
                                        return (
                                            <td key={label} className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium bg-green-50 text-green-600 border border-white">
                                                {result.wrongAttempts + 1}
                                            </td>
                                        );
                                    }

                                    // 4. حالة المحاولات الخاطئة وبدون حل حتي الآن -> أحمر فاتح
                                    if (!result.solved && result.wrongAttempts > 0) {
                                        return (
                                            <td key={label} className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium bg-red-50 text-red-500 border border-white">
                                                -{result.wrongAttempts}
                                            </td>
                                        );
                                    }

                                    return <td key={label} className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-300">-</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}