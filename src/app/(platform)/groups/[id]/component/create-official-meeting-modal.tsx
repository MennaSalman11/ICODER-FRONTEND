"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faVideo,
    faChevronLeft,
    faChevronRight,
    faCalendarDays,
    faClock,
    faBook,
    faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";
import { MeetingsService, CreateOfficialMeetingRequest } from "@/src/lib/services/meetings-services";
import { ContestService } from "@/src/lib/services/contest-services";
import { toast } from "sonner";

interface CreateOfficialMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    groupName: string;
    token?: string;
    onSuccess?: () => void;
}

const meetingTypeDescriptions = {
  GENERAL: "Sessions covering general algorithms, techniques, and problem-solving topics.",
  EDITORIAL: "Detailed explanations of problems from a specific contest.",
  HELPDESK: "Live Q&A session for contestants during a contest.",
};
type MeetingType = "GENERAL" | "EDITORIAL" | "HELPDESK";

export default function CreateOfficialMeetingModal({
    isOpen,
    onClose,
    groupId,
    groupName,
    token,
    onSuccess,
}: CreateOfficialMeetingModalProps) {
    // ── Forms State ───────────────────────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [selectedContestId, setSelectedContestId] = useState<string>("");
    const [meetingType, setMeetingType] = useState<MeetingType>("GENERAL");
    const [isScheduled, setIsScheduled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Data State ────────────────────────────────────────────────────────────
    const [contests, setContests] = useState<any[]>([]);

    // ── Date/Time State ───────────────────────────────────────────────────────
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedHour, setSelectedHour] = useState("10");
    const [selectedMinute, setSelectedMinute] = useState("00");
    const [period, setPeriod] = useState<"AM" | "PM">("AM");

    // ── Fetch Contests ────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            const fetchContests = async () => {
                try {
                    const data = await ContestService.getAllContests(groupName, 0, 50, token);
                    // data might be { content: [...] } or just an array
                    const list = Array.isArray(data) ? data : data.content || [];
                    setContests(list);
                } catch (error) {
                    console.error("Failed to fetch contests:", error);
                }
            };
            fetchContests();
        }
    }, [isOpen, groupName, token]);

    if (!isOpen) return null;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Please enter a meeting title");
            return;
        }

        setIsSubmitting(true);
        try {
            let scheduledStartTime = new Date().toISOString();

            if (isScheduled) {
                // Construct the full date/time object
                const date = new Date(selectedDate);
                let hours = parseInt(selectedHour);
                if (period === "PM" && hours < 12) hours += 12;
                if (period === "AM" && hours === 12) hours = 0;
                date.setHours(hours, parseInt(selectedMinute), 0, 0);
                scheduledStartTime = date.toISOString();
            }

            const payload: CreateOfficialMeetingRequest = {
                title: title.trim(),
                meeting_type: meetingType,
                group_id: groupId,
                contest_id: selectedContestId ? Number(selectedContestId) : null,
                instant: !isScheduled,
                scheduled_start_time: scheduledStartTime,
            };

            const response = await MeetingsService.createOfficialMeeting(payload, token);

            if (!isScheduled && response.room_name) {
                window.open(`https://meet.jit.si/${response.room_name}`, "_blank");
            }

            toast.success(isScheduled ? "Meeting scheduled successfully!" : "Meeting started successfully!");
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error("Failed to create official meeting:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => !isSubmitting && onClose()}
            />

            {/* Modal Container */}
            <div className={`relative bg-white rounded-[24px] shadow-2xl w-full transition-all duration-300 overflow-hidden flex flex-col md:flex-row ${isScheduled ? 'max-w-4xl' : 'max-w-md'}`}>

                {/* Main Form Panel */}
                <div className="flex-1 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[22px] font-bold text-[#0f172a]">Create Official Meeting</h2>
                        {!isScheduled && (
                            <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition">
                                <FontAwesomeIcon icon={faXmark} className="text-xl" />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Title */}
                        <div className="space-y-2.5">
                            <label className="block text-sm font-bold text-gray-700">Meeting Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Dynamic Programming Masterclass"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#1b4583] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* Linked Contest */}
                        <div className="space-y-2.5">
                            <label className="block text-sm font-bold text-gray-700">Linked Contest</label>
                            <select
                                value={selectedContestId}
                                onChange={(e) => setSelectedContestId(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#1b4583] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">None (Optional)</option>
                                {contests.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Meeting Type */}
                        <div className="space-y-2.5">
                            <label className="block text-sm font-bold text-gray-700">Meeting Type</label>
                            <div className="flex gap-3">
                                {["GENERAL", "EDITORIAL", "HELPDESK"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setMeetingType(type as MeetingType)}
                                        className={`
                                            flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all border
                                            ${meetingType === type
                                                ? "bg-[#1b4583] border-[#1b4583] text-white shadow-md shadow-blue-900/20"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-[#1b4583] hover:text-[#1b4583]"}
                                        `}
                                    >
                                        {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                                    
                                    </button>
                                    
                                ))}
                                
                            </div>
                            <p className="text-xs text-gray-500">{meetingTypeDescriptions[meetingType]}</p>
                        </div>

                        {/* Schedule Toggle */}
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 text-[15px]">Schedule for later</h4>
                                <p className="text-xs text-gray-500">Turn off for an instant meeting</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsScheduled(!isScheduled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isScheduled ? 'bg-[#1b4583]' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isScheduled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Small divider line just for aesthetics */}
                        <div className="h-px bg-gray-100 w-full" />

                        {/* Footer Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 px-6 rounded-xl text-[15px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-2 py-3.5 px-6 rounded-xl text-[15px] font-bold text-white bg-[#1b4583] hover:bg-[#153a6e] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Save Session"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Date-Time Picker Panel (Visible only if isScheduled is true) */}
                {isScheduled && (
                    <div className="w-full md:w-[380px] bg-[#f8fafd] border-l border-gray-100 p-8 flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarDays} className="text-[#1b4583]" />
                                Select Session Range
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 md:hidden">
                                <FontAwesomeIcon icon={faXmark} className="text-xl" />
                            </button>
                        </div>

                        {/* Calendar Mock/Functional Component */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                            <CalendarUI selectedDate={selectedDate} onSelect={setSelectedDate} />
                        </div>

                        {/* Time Selectors */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                Time
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                {/* Hour */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Hours</label>
                                    <select
                                        value={selectedHour}
                                        onChange={(e) => setSelectedHour(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Minute */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Mins</label>
                                    <select
                                        value={selectedMinute}
                                        onChange={(e) => setSelectedMinute(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none"
                                    >
                                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* AM/PM */}
                                <div className="space-y-1.5 flex flex-col justify-end">
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setPeriod("AM")}
                                            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${period === "AM" ? 'bg-white shadow text-[#1b4583]' : 'text-gray-400'}`}
                                        >
                                            AM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPeriod("PM")}
                                            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${period === "PM" ? 'bg-white shadow text-[#1b4583]' : 'text-gray-400'}`}
                                        >
                                            PM
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Action Button */}
                        <div className="mt-auto pt-8 flex gap-3">
                            <button
                                type="submit" // Triggers the main form's submit via context of overall component if wrapped, or we just use trigger
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-6 rounded-xl text-[14px] font-bold text-white bg-[#1b4583] hover:bg-[#153a6e] transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Simple Calendar Component ────────────────────────────────────────────────

function CalendarUI({ selectedDate, onSelect }: { selectedDate: Date, onSelect: (d: Date) => void }) {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];

        // Padding for previous month
        const firstDay = date.getDay();
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [viewDate]);

    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <button type="button" onClick={() => changeMonth(-1)} className="text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <div className="text-sm font-bold text-gray-900">{monthName} {year}</div>
                <button type="button" onClick={() => changeMonth(1)} className="text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} className="text-[10px] font-bold text-gray-400 pb-2">{d}</div>
                ))}

                {daysInMonth.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;

                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => onSelect(day)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all
                                ${isSelected
                                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                    : "text-gray-600 hover:bg-gray-100"}
                                ${isToday && !isSelected ? "text-blue-600 bg-blue-50" : ""}
                            `}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
