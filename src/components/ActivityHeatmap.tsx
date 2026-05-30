"use client";

import { useEffect, useState } from "react";
import {
  getActivityStreak,
  getActivityGrid,
  type StreakData,
  type ActivityGridDay,
} from "@/src/lib/services/Activitystreak.service";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

// تكبير الحجم والمسافات لتأخذ الخلايا مساحة الكارت بالكامل بشكل مريح
const CELL = 14; 
const GAP = 4;
const LABEL_W = 32;
const HEADER_H = 20;

function getCellColor(accepted: number, attempted: number): string {
  if (accepted === 0 && attempted === 0) return "#EBEDF0";
  if (accepted === 0 && attempted > 0) return "#FECACA"; // حاول بس غلط (أحمر فاتح)
  if (accepted === 1) return "#9BE9A8"; // أخضر فاتح
  if (accepted === 2) return "#40C463"; // أخضر متوسط
  return "#216E39"; // أخضر غامق (3 أو أكثر)
}

interface GridDay {
  date: string;
  accepted: number;
  attempted: number;
}

function buildYearWeeks(
  year: number,
  dataMap: Record<string, ActivityGridDay>
): {
  weeks: GridDay[][];
  monthLabels: { label: string; weekIndex: number }[];
} {
  const weeks: GridDay[][] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];

  const jan1 = new Date(year, 0, 1);
  const startDate = new Date(jan1);
  startDate.setDate(jan1.getDate() - jan1.getDay());

  const endDate = new Date(year, 11, 31);
  const cursor = new Date(startDate);
  let currentMonth = -1;
  let weekIndex = 0;

  while (true) {
    const week: GridDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().split("T")[0];
      const entry = dataMap[dateStr];
      week.push({
        date: dateStr,
        accepted: entry?.accepted_count ?? 0,
        attempted: entry?.attempted_count ?? 0,
      });
      const month = cursor.getMonth();
      if (d === 0 && month !== currentMonth && cursor.getFullYear() === year) {
        currentMonth = month;
        monthLabels.push({ label: MONTHS[month], weekIndex });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    weekIndex++;
    if (cursor > endDate) break;
  }

  return { weeks, monthLabels };
}

function YearGrid({
  year,
  dataMap,
}: {
  year: number;
  dataMap: Record<string, ActivityGridDay>;
}) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const { weeks, monthLabels } = buildYearWeeks(year, dataMap);
  const gridHeight = 7 * CELL + 6 * GAP;
  const svgWidth = LABEL_W + weeks.length * (CELL + GAP);

  return (
    <div className="relative" style={{ minHeight: gridHeight + HEADER_H + 8 }}>
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200">
        <svg
          width={svgWidth}
          height={HEADER_H + gridHeight}
          className="block select-none w-full"
        >
          {/* Month labels */}
          {monthLabels.map((m, idx) => (
            <text
              key={`${m.label}-${idx}`}
              x={LABEL_W + m.weekIndex * (CELL + GAP)}
              y={12}
              className="text-[10px] fill-gray-400 font-medium"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((d, i) =>
            d ? (
              <text
                key={i}
                x={0}
                y={HEADER_H + i * (CELL + GAP) + CELL - 2}
                className="text-[10px] fill-gray-400 font-medium"
              >
                {d}
              </text>
            ) : null
          )}

          {/* Cells */}
          {weeks.map((week, wIdx) =>
            week.map((day, dIdx) => (
              <rect
                key={`${wIdx}-${dIdx}`}
                x={LABEL_W + wIdx * (CELL + GAP)}
                y={HEADER_H + dIdx * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2.5}
                fill={getCellColor(day.accepted, day.attempted)}
                className="transition-all duration-150 hover:stroke-gray-400 hover:stroke-[1px]"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => {
                  const svgEl = (e.currentTarget as SVGRectElement).ownerSVGElement!;
                  const container = svgEl.parentElement!.parentElement!;
                  const svgRect = svgEl.getBoundingClientRect();
                  const containerRect = container.getBoundingClientRect();
                  setTooltip({
                    text: `${day.date} • ${day.accepted} Solved / ${day.attempted} Tried`,
                    x: svgRect.left - containerRect.left + LABEL_W + wIdx * (CELL + GAP) + CELL / 2,
                    y: svgRect.top - containerRect.top + HEADER_H + dIdx * (CELL + GAP) - 6,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))
          )}
        </svg>
      </div>

      {tooltip && (
        <div
          className="absolute z-20 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-medium rounded-md shadow-md pointer-events-none whitespace-nowrap border border-gray-700/50"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

export default function ActivityHeatmap() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [dataMap, setDataMap] = useState<Record<string, ActivityGridDay>>({});
  const [loading, setLoading] = useState(true);
  
  // تحديد السنة الحالية ديناميكياً لتجنب مشاكل الـ Hydration
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [prevYear, setPrevYear] = useState<number>(2025);

  const [totalSolved, setTotalSolved] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

useEffect(() => {
  const cYear = new Date().getFullYear();
  const pYear = cYear - 1;
  setCurrentYear(cYear);
  setPrevYear(pYear);
  setActiveYear(cYear);

  setLoading(true);
  Promise.all([
    getActivityStreak("UTC"),
    getActivityGrid(cYear, "UTC"),
    getActivityGrid(pYear, "UTC"),
  ])
    .then(([streak, currGrid, prevGrid]) => {
      
      // ─── الـ LOGS لرؤية الداتا الراجعة من الباك ───
      console.log("=== DATA FROM BACKEND ===");
      console.log("1. Streak Data:", streak);
      console.log(`2. Grid Data for Current Year (${cYear}):`, currGrid);
      console.log(`3. Grid Data for Previous Year (${pYear}):`, prevGrid);
      console.log("=================================");

      setStreakData(streak);
      
      const map: Record<string, ActivityGridDay> = {};
      let solvedSum = 0;
      let attemptsSum = 0;

      // دمج وحساب الإحصائيات من الـ API مباشرة لآخر سنتين
  [...currGrid, ...prevGrid].forEach((d) => {
  map[d.date] = d;
  
  // استخدام Number() هنا يحول '3' إلى 3 و '14' إلى 14 ويجمعهم جمعاً رياضياً صحيحاً
  solvedSum += Number(d.accepted_count ?? 0);
  attemptsSum += Number(d.attempted_count ?? 0);
});

      // لوج إضافي للتأكد من المجموع النهائي بعد الحساب التراكمي
      console.log("=== CALCULATED STATS ===");
      console.log("Total Solved Sum:", solvedSum);
      console.log("Total Attempts Sum:", attemptsSum);
      console.log("=================================");

      setDataMap(map);
      setTotalSolved(solvedSum);
      setTotalAttempts(attemptsSum);
    })
    .catch((err) => console.error("Fetch error:", err))
    .finally(() => setLoading(false));
}, []);

  const currentStreak = streakData?.current_streak ?? 0;
  const maxStreak = streakData?.max_streak ?? 0;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch w-full font-sans">
      
      {/* ── Stats Card ── */}
      <div className="w-full md:w-[210px] shrink-0 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col justify-between shadow-xs">
        <div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Problem Stats
          </p>

          <div className="mb-5">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Solved</span>
              <span className="text-base font-extrabold text-gray-900 dark:text-gray-50">
                {loading ? "—" : Number(totalSolved).toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((totalSolved / (totalAttempts || 1)) * 100, 100).toFixed(0)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-900/50 pb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Attempts</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {loading ? "—" : Number(totalAttempts).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-900/50 pb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Streak</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {loading ? "—" : `${currentStreak} Days`}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Max Streak</span>
              <span className="text-sm font-bold text-orange-500 dark:text-orange-400">
                {loading ? "—" : `${maxStreak} Days`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Heatmap Card ── */}
      <div className="flex-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
        
        {/* Header & Legend */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 dark:border-gray-900 pb-3">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Problem Solving Activity
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
            <span>Less</span>
            {["#EBEDF0", "#FECACA", "#9BE9A8", "#40C463", "#216E39"].map((color) => (
              <div
                key={color}
                className="border border-black/5 dark:border-white/5"
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 2,
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-xs text-gray-400 animate-pulse">
            Loading activity stream...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            <div className="flex gap-4 items-start relative">
              
              {/* الـ Grid الأساسي وتوسيع مساحته */}
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <YearGrid year={activeYear} dataMap={dataMap} />
              </div>

              {/* أزرار اختيار السنة جهة اليمين عمودياً لتعويض مكان النص القديم */}
              <div className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg shrink-0 border border-gray-100 dark:border-gray-800/50 mt-5">
                {[currentYear, prevYear].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setActiveYear(year)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all duration-150 ${
                      activeYear === year
                        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs border border-gray-200/30 dark:border-gray-700/30"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}