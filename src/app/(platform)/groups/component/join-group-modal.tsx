"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faXmark } from "@fortawesome/free-solid-svg-icons";
import { groupService } from "@/src/lib/services/group-service";
import { toast } from "sonner";

interface JoinGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const JoinGroupModal = ({ isOpen, onClose, onSuccess }: JoinGroupModalProps) => {
    const [groupCode, setGroupCode] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleJoin = async () => {
        try {
            setLoading(true);
            const res = await groupService.joinGroupByCode(groupCode);
            console.log("Group joined successfully");
            toast.success("Group joined successfully");
            console.log("Group joined successfully", res.message);


            onSuccess();
            onClose();
            setGroupCode("");
        } catch (err) {
            console.log(err);
            toast.error("Check your code again!");

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top section */}
                    <div className="relative flex flex-col items-center pt-8 pb-6 px-6">
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-lg" />
                        </button>

                        {/* Hash icon */}
                        <div className="w-14 h-14 rounded-full bg-[#1b4583]/10 flex items-center justify-center mb-4">
                            <FontAwesomeIcon
                                icon={faHashtag}
                                className="text-[#1b4583] text-xl"
                            />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900">
                            Join Group
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Enter the invitation code to access a private group.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* Bottom section */}
                    <div className="px-6 pt-6 pb-8 space-y-5">
                        {/* Code Input */}
                        <div>
                            <label className="block text-xs font-semibold text-[#1b4583] tracking-wider uppercase mb-2">
                                Enter Group Code
                            </label>
                            <input
                                type="text"
                                value={groupCode}
                                onChange={(e) => setGroupCode(e.target.value)}
                                placeholder="e.g. AB12-CD34-EF56"
                                className="w-full px-5 py-3 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] transition placeholder:text-gray-400"
                            />
                        </div>

                        {/* Join Button */}
                        <button
                            type="button"
                            className="w-full py-3.5 text-sm font-semibold text-white bg-[#1b4583] hover:bg-[#163a6e] rounded-full transition cursor-pointer shadow-lg shadow-[#1b4583]/25"
                            onClick={handleJoin}
                            disabled={loading}
                        >
                            {loading ? "Joining..." : "Join Group"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default JoinGroupModal;
