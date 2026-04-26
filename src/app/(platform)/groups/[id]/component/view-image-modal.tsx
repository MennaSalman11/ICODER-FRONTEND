"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faImage } from "@fortawesome/free-solid-svg-icons";
import { groupService } from "@/src/lib/services/group-service";
import { toast } from "sonner";

const FALLBACK_IMAGE = "https://placehold.co/800x400/1b4583/ffffff?text=No+Image";

interface ViewImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    groupName: string;
}

const ViewImageModal = ({ isOpen, onClose, groupId, groupName }: ViewImageModalProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        setImageUrl(null);
        setHasError(false);
        setIsLoading(true);

        groupService
            .getGroupPicture(groupId)
            .then((data) => {
                if (!cancelled) {
                    if (data?.picture_url) {
                        setImageUrl(data.picture_url);
                    } else {
                        setHasError(true);
                    }
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setHasError(true);
                    toast.error("Could not load the group picture.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, groupId]);

    const handleClose = () => {
        setImageUrl(null);
        setHasError(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faImage} className="text-[#1b4583] text-base" />
                            <h2 className="text-lg font-bold text-gray-900">Group Picture</h2>
                            {groupName && (
                                <span className="text-sm text-gray-400 font-normal">— {groupName}</span>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition p-1.5 rounded-lg cursor-pointer"
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-lg" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[280px]">

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
                                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#1b4583] border-t-transparent" />
                                    <p className="text-sm font-medium">Loading image…</p>
                                </div>
                            )}

                            {/* Error / No picture */}
                            {!isLoading && hasError && (
                                <img
                                    src={FALLBACK_IMAGE}
                                    alt="No group picture available"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // last-resort fallback
                                        (e.currentTarget as HTMLImageElement).src =
                                            "https://placehold.co/800x400/e2e8f0/94a3b8?text=No+Image";
                                    }}
                                />
                            )}

                            {/* Loaded image */}
                            {!isLoading && !hasError && imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt={`${groupName} group picture`}
                                    className="w-full object-contain max-h-[480px]"
                                    onError={() => setHasError(true)}
                                />
                            )}
                        </div>

                        {/* Error caption */}
                        {!isLoading && hasError && (
                            <p className="mt-3 text-center text-xs text-gray-400">
                                No picture is set for this group.
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end px-6 py-4 border-t border-gray-100">
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewImageModal;
