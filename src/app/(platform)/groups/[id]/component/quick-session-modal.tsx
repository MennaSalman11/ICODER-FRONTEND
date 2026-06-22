"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faXmark, faBolt } from "@fortawesome/free-solid-svg-icons";
import { MeetingsService } from "@/src/lib/services/meetings-services";
import { toast } from "sonner";

interface QuickSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    token?: string;
    onSuccess?: () => void;
}

export default function QuickSessionModal({
    isOpen,
    onClose,
    groupId,
    token,
    onSuccess,
}: QuickSessionModalProps) {
    const [title, setTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Please enter a session title");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await MeetingsService.createQuickSession(
                {
                    title: title.trim(),
                    group_id: groupId,
                },
                token
            );

            toast.success("Quick session created successfully!");

            // Open Jitsi Meet in a new tab
            if (response.room_name) {
                window.open(`https://meet.jit.si/${response.room_name}`, "_blank");
            }

            onSuccess?.();
            onClose();
            setTitle("");
        } catch (error: any) {
            console.error("Failed to create quick session:", error);
            toast.error(error.message || "Failed to create quick session. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => !isSubmitting && onClose()}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8fafd]">
                    <div className="flex items-center gap-3 text-[#1b3f82]">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <FontAwesomeIcon icon={faBolt} className="text-lg text-orange-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Quick Session</h3>
                            <p className="text-xs text-gray-500">Start an instant video meeting</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-50 rounded-lg disabled:opacity-30"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Session Title
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <FontAwesomeIcon icon={faVideo} className="text-sm" />
                            </div>
                            <input
                                type="text"
                                required
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g., Solving Hard Problems..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all outline-none focus:border-[#1b3f82] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            <strong className="text-blue-700">Note:</strong> Quick sessions are instant meetings using Jitsi Meet. The room will be created immediately after you click Start.
                        </p>
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#1b3f82] hover:bg-[#152f61] rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faBolt} className="text-[13px]" />
                                    Start Session
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
