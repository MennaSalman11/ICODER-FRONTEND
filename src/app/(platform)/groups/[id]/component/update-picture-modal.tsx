"use client";

import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCloudUploadAlt, faImage } from "@fortawesome/free-solid-svg-icons";
import { groupService } from "@/src/lib/services/group-service";
import { toast } from "sonner";

interface UpdatePictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    onSuccess: () => void;
}

const UpdatePictureModal = ({ isOpen, onClose, groupId, onSuccess }: UpdatePictureModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            await groupService.updateGroupPicture(groupId, selectedFile);
            toast.success("Group picture updated successfully!");
            onSuccess();
            handleClose();
        } catch (error) {
            console.error("Failed to upload picture:", error);
            toast.error("Failed to upload picture. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (isUploading) return; // Prevent closing while uploading
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
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
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Update Group Picture
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Choose a new cover image for your group.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-lg" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 pb-6 space-y-5">
                        {/* Drop zone / File input */}
                        <div
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className={`relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-colors duration-200 ${isUploading
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:border-[#1b4583] hover:bg-[#1b4583]/5"
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isUploading}
                            />

                            {!previewUrl ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-[#1b4583]/10 flex items-center justify-center">
                                        <FontAwesomeIcon
                                            icon={faCloudUploadAlt}
                                            className="text-[#1b4583] text-xl"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            Click to upload or drag & drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Preview */
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative w-full h-44 rounded-lg overflow-hidden">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                                        <span className="truncate max-w-[200px]">
                                            {selectedFile?.name}
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span>
                                            {selectedFile
                                                ? (selectedFile.size / 1024).toFixed(1) + " KB"
                                                : ""}
                                        </span>
                                    </div>
                                    {!isUploading && (
                                        <p className="text-xs text-[#1b4583] font-medium">
                                            Click to choose a different image
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isUploading}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-[#1b4583] hover:bg-[#163a6e] rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UpdatePictureModal;
