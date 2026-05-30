"use client";

import { useEffect, useState } from "react";
import { getActivityStreak, type StreakData } from "@/src/lib/services/Activitystreak.service";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

type CellLevel = 0 | 1 | 2 | 3 | 4;

interface ActivityDay {
  date: string;
  count: number;
  level: CellLevel;
}

interface Props {
  solved?: number;
  attempts?: number;
  accuracy?: number;
}

const CELL_COLORS: Record<CellLevel, string> = {
  0: "#EBEDF0",
  1: "#9BE9A8",
  2: "#40C463",
  3: "#30A14E",
  4: "#216E39",
};

function getLevelFromCount(count: number): CellLevel {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

// ─── توليد mock data مؤقتة ────────────────────────────────────────────────
function generateMockData(): Record<string, number> {
  const data: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 364; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const r = Math.random();
    if (r < 0.15) data[key] = 0;
    else if (r < 0.4) data[key] = Math.ceil(Math.random() * 2);
    else if (r < 0.65) data[key] = Math.ceil(Math.random() * 3) + 2;
    else if (r < 0.85) data[key] = Math.ceil(Math.random() * 4) + 5;
    else data[key] = Math.ceil(Math.random() * 5) + 9;
  }
  return data;
}
// ─────────────────────────────────────────────────────────────────────────────

function buildWeeks(rawData: Record<string, number>): {
  weeks: ActivityDay[][];
  monthLabels: { label: string; weekIndex: number }[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 363);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: ActivityDay[][] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let currentMonth = -1;
  const cursor = new Date(startDate);

  for (let w = 0; w < 53; w++) {
    const week: ActivityDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().split("T")[0];
      const count = rawData[dateStr] ?? 0;
      week.push({ date: dateStr, count, level: getLevelFromCount(count) });
      const month = cursor.getMonth();
      if (d === 0 && month !== currentMonth) {
        currentMonth = month;
        monthLabels.push({ label: MONTHS[month], weekIndex: w });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

const CELL = 14;   // حجم المربع
const GAP  = 3;    // المسافة بينهم

export default function ActivityHeatmap({ solved = 0, attempts = 0, accuracy = 0 }: Props) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    // ─── Mock data مؤقتة — استبدليها بـ API call حقيقي لما الـ endpoint جاهزة ───
    setActivityData(generateMockData());
    // ─────────────────────────────────────────────────────────────────────────────

    getActivityStreak("UTC")
      .then(setStreakData)
      .catch((err) => console.error("Streak fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const { weeks, monthLabels } = buildWeeks(activityData);
  const currentStreak = streakData?.current_streak ?? 0;

  // ارتفاع الـ grid الكلي
  const gridHeight = 7 * CELL + 6 * GAP; // 7 صفوف + 6 فراغات
  const LABEL_W = 28;
  const HEADER_H = 20;

  return (
    <div className="flex gap-3 items-stretch w-full">

      {/* ── Stats Card ── */}
      <div className="w-[190px] shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Problem Stats
        </p>

        <div className="mb-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Solved</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {solved.toLocaleString()}
            </span>
          </div>
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <div
              className="h-1 bg-green-500 rounded-full"
              style={{ width: `${Math.min((solved / (attempts || 1)) * 100, 100).toFixed(0)}%` }}
            />
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Attempts</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {attempts.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Accuracy</span>
            <span className="text-sm font-semibold text-green-600">
              {accuracy.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Streak</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {loading ? "—" : `${currentStreak} Days`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Heatmap Card ── */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 relative flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Problem Solving Activity
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span>Less</span>
            {([0, 1, 2, 3, 4] as CellLevel[]).map((l) => (
              <div
                key={l}
                style={{
                  width: CELL,
                  height: CELL,
                  borderRadius: 3,
                  backgroundColor: CELL_COLORS[l],
                  flexShrink: 0,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* SVG Grid */}
        <div className="flex-1 overflow-x-auto relative" style={{ minHeight: gridHeight + HEADER_H + 8 }}>
          <svg
            width={LABEL_W + weeks.length * (CELL + GAP)}
            height={HEADER_H + gridHeight}
            style={{ display: "block" }}
          >
            {/* Month labels */}
            {monthLabels.map((m) => (
              <text
                key={m.weekIndex}
                x={LABEL_W + m.weekIndex * (CELL + GAP)}
                y={12}
                fontSize={10}
                fill="#9CA3AF"
              >
                {m.label}
              </text>
            ))}

            {/* Day labels */}
            {DAY_LABELS.map((d, i) => (
              d ? (
                <text
                  key={i}
                  x={0}
                  y={HEADER_H + i * (CELL + GAP) + CELL - 2}
                  fontSize={10}
                  fill="#9CA3AF"
                >
                  {d}
                </text>
              ) : null
            ))}

            {/* Cells */}
            {weeks.map((week, wIdx) =>
              week.map((day, dIdx) => (
                <rect
                  key={`${wIdx}-${dIdx}`}
                  x={LABEL_W + wIdx * (CELL + GAP)}
                  y={HEADER_H + dIdx * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={3}
                  fill={CELL_COLORS[day.level]}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    const svgEl = (e.currentTarget as SVGRectElement).ownerSVGElement!;
                    const container = svgEl.parentElement!;
                    const svgRect = svgEl.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    const cellX = LABEL_W + wIdx * (CELL + GAP) + CELL / 2;
                    const cellY = HEADER_H + dIdx * (CELL + GAP);
                    setTooltip({
                      text: `${day.date} — ${day.count} submission${day.count !== 1 ? "s" : ""}`,
                      x: svgRect.left - containerRect.left + cellX,
                      y: svgRect.top - containerRect.top + cellY - 6,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md shadow-lg pointer-events-none whitespace-nowrap"
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
      </div>
    </div>
  );
}
