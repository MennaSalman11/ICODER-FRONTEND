"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { groupService } from "@/src/lib/services/group-service";
import { toast } from "sonner";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    onSuccess: () => void;
}

const DeleteConfirmationModal = ({ isOpen, onClose, groupId, onSuccess }: DeleteConfirmationModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await groupService.deleteGroupPicture(groupId);
            toast.success("Group picture deleted successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to delete picture:", error);
            toast.error("Failed to delete group picture. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (isDeleting) return;
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
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <div className="flex justify-end px-5 pt-4">
                        <button
                            onClick={handleClose}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-lg" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col items-center px-6 pb-2 pt-1 text-center">
                        {/* Warning icon */}
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <FontAwesomeIcon
                                icon={faTriangleExclamation}
                                className="text-red-500 text-xl"
                            />
                        </div>

                        <h2 className="text-lg font-bold text-gray-900">
                            Delete Group Picture
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                            Are you sure you want to delete the group picture? This action cannot be undone.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-3 px-6 py-5 mt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isDeleting}
                            className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeleteConfirmationModal;
