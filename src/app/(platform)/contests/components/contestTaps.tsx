"use client";

import { useEffect, useState } from "react";

interface ContestTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    endTime?: string;
}

export default function ContestTabs({ activeTab, setActiveTab, endTime }: ContestTabsProps) {
    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "problems", label: "Problems" },
        { id: "status", label: "Status" },
        { id: "rank", label: "Rank" },
    ];

    const [timeLeft, setTimeLeft] = useState("");

    // ── Countdown logic (untouched) ───────────────────────────────────────────
    useEffect(() => {
        if (!endTime) return;

        const calculateTime = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("Ended");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}:${minutes}:${seconds}`);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        /* Sits directly below the header card — uses a simple bottom-border underline pattern */
        <div className="border-b border-gray-200 bg-white">
            <nav className="flex items-center gap-0 -mb-px px-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative px-4 py-3.5 text-sm font-semibold transition-all duration-200
                                border-b-2 cursor-pointer whitespace-nowrap
                                ${isActive
                                    ? "text-orange-500 border-orange-500"
                                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                        >
                            <span className="flex items-center gap-1.5">
                                {tab.label}
                                {/* Countdown badge on Rank tab (logic untouched) */}
                                {tab.id === "rank" && timeLeft && (
                                    <span className="text-[10px] font-mono text-gray-400 font-normal">
                                        ({timeLeft})
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}