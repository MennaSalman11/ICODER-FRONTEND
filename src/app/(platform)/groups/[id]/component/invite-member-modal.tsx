"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserPlus, faCopy, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { groupService } from "@/src/lib/services/group-service";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupCode: string;
    groupId: number;
}

const InviteMemberModal = ({ isOpen, onClose, groupCode, groupId }: InviteMemberModalProps) => {
    const [userHandle, setUserHandle] = useState("");
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState<Record<string, unknown> | null>(null);

    const handleInvite = async () => {
        if (!userHandle.trim()) {
            toast.error("Please enter a user handle");
            return;
        }

        setIsLoading(true);
        setLastResponse(null);

        try {
            const res = await groupService.inviteMember(userHandle.trim(), groupId);
            console.log("Invite Response:", res);

            // Store the full response so we can display it in the UI
            setLastResponse(res as Record<string, unknown>);

            toast.success(`Invitation sent to "${userHandle}"!`);
            setUserHandle("");
        } catch (error) {
            console.error("Invite Error:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to send invitation. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(groupCode);
            setCopied(true);
            toast.success("Code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy code");
        }
    };

    const handleCopyResponseValue = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard!");
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleClose = () => {
        setUserHandle("");
        setCopied(false);
        setLastResponse(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#1b4583]/10 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUserPlus} className="text-[#1b4583] text-sm" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Invite Members
                            </h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-lg" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 pb-6 space-y-4">
                        {/* User Handle Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                User Handle
                            </label>
                            <input
                                type="text"
                                value={userHandle}
                                onChange={(e) => setUserHandle(e.target.value)}
                                placeholder="Enter username or handle"
                                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleInvite()}
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Invite Button */}
                        <button
                            type="button"
                            onClick={handleInvite}
                            disabled={isLoading}
                            className="w-full py-2.5 text-sm font-semibold text-white bg-[#1b4583] hover:bg-[#163a6e] rounded-lg transition cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                            )}
                            {isLoading ? "Sending Invitation…" : "Invite User"}
                        </button>

                        {/* Last API Response (debug panel) */}
                        {lastResponse && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                                    ✅ Invitation Response
                                </p>
                                {Object.entries(lastResponse).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-start gap-2 bg-white border border-green-100 rounded-lg px-3 py-2"
                                    >
                                        <span className="text-xs font-semibold text-gray-500 shrink-0 mt-0.5">
                                            {key}:
                                        </span>
                                        <span className="text-xs text-gray-800 font-mono break-all flex-1">
                                            {String(value)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyResponseValue(String(value))}
                                            className="shrink-0 text-gray-400 hover:text-[#1b4583] transition cursor-pointer"
                                            title={`Copy ${key}`}
                                        >
                                            <FontAwesomeIcon icon={faCopy} className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Helper text */}
                        <p className="text-xs text-[#1b4583]/60 text-center">
                            You can keep inviting users one by one without closing this window.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Invite by Code Section */}
                    <div className="px-6 py-5 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Invite by code
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 select-all">
                                {groupCode}
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:text-[#1b4583] hover:border-[#1b4583] hover:bg-[#1b4583]/5 transition cursor-pointer"
                                title="Copy code"
                            >
                                <FontAwesomeIcon
                                    icon={copied ? faCheck : faCopy}
                                    className={`text-sm ${copied ? "text-green-500" : ""}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InviteMemberModal;
