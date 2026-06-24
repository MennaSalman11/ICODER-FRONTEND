"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { groupService } from "../../../../lib/services/group-service";
import { toast } from "sonner";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newGroup?: any) => void;
}

const CreateGroupModal = ({ isOpen, onClose, onSuccess }: CreateGroupModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialFormState = {
        name: "",
        visibility: "PUBLIC",
        code_enabled: true,
        contest_coordinator_type: "LEADER",
        description: ""
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Please enter a group name");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await groupService.createGroup({
                ...formData,
                visibility: formData.visibility.trim().toUpperCase()
            });

            toast.success(`Group "${formData.name}" created successfully!`);
            console.log(response);

            // تنفيذ الـ Success أولاً ثم الإغلاق
            onSuccess(response);

            onClose();

            // إعادة تعيين الفورم للحالة الأصلية
            setFormData(initialFormState);
        } catch (error: any) {
            console.error("Error creating group:", error);
            const errorMessage = error?.response?.data?.message || "Failed to create group. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - حافظت على نفس الكلاسات والأنيميشن */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Create New Group
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Establish a community for competitive coding.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-lg" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 pb-6 space-y-5">
                        {/* Group Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Master Coders CP"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition placeholder:text-gray-400"
                            />
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Visibility
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: "PUBLIC" })}
                                    className={`p-3 rounded-lg border-2 text-left transition cursor-pointer ${formData.visibility === "PUBLIC"
                                        ? "border-[#1b4583] bg-[#1b4583]/5"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <span className={`text-sm font-semibold ${formData.visibility === "PUBLIC" ? "text-[#1b4583]" : "text-gray-700"
                                        }`}>
                                        Public
                                    </span>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Everyone can see and find this group.
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: "PRIVATE" })}
                                    className={`p-3 rounded-lg border-2 text-left transition cursor-pointer ${formData.visibility === "PRIVATE"
                                        ? "border-[#1b4583] bg-[#1b4583]/5"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <span className={`text-sm font-semibold ${formData.visibility === "PRIVATE" ? "text-[#1b4583]" : "text-gray-700"
                                        }`}>
                                        Private
                                    </span>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Invitation only or secret join code.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Code Enabled */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    Code Enabled
                                </label>
                                <span className="text-gray-400 text-xs cursor-help" title="Allow members to join using a code">
                                    ⓘ
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, code_enabled: !formData.code_enabled })}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${formData.code_enabled ? "bg-[#1b4583]" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${formData.code_enabled ? "translate-x-5" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Contest Coordinator */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Contest Coordinator
                            </label>
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                {["leader", "leader_manager", "ALL_MEMBERS"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, contest_coordinator_type: type })}
                                        className={`flex-1 px-4 py-2 text-sm font-medium transition cursor-pointer border-r last:border-r-0 border-gray-300 ${formData.contest_coordinator_type === type
                                                ? "bg-[#1b4583] text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* هنا بنصلح العرض: بنقارن بالقيمة الحقيقية اللي في الـ Array */}
                                        {type === "leader"
                                            ? "Leader"
                                            : type === "leader_manager"
                                                ? "Leader & Managers"
                                                : "All Members"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                maxLength={140}
                                rows={3}
                                placeholder="A brief introduction to your group (max 140 chars)..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4583] focus:border-transparent transition resize-none placeholder:text-gray-400"
                                aria-required="true"
                            />
                            <p className="text-xs text-gray-400 text-right mt-1">
                                {formData.description.length}/140
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-[#1b4583] hover:bg-[#163a6e] rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Create Group"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateGroupModal;