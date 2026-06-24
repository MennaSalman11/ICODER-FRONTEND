"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag, faPlus, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import CreateGroupModal from "./create-group-modal";
import JoinGroupModal from "./join-group-modal";

interface GroupsHeaderProps {
    onSearch: (query: string) => void;
    onTabChange: (tab: "my" | "explore") => void;
    onSuccess: () => void;
    isLoading?: boolean;
}

const GroupsHeader = ({ onSearch, onTabChange, onSuccess, isLoading }: GroupsHeaderProps) => {
    const [activeTab, setActiveTab] = useState<"my" | "explore">("my");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    const handleTabChange = (tab: "my" | "explore") => {
        setActiveTab(tab);
        onTabChange(tab);
    };

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                <div className="border-b p-3 sm:p-4 space-y-4">

                    {/* Title + Buttons Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        {/* Page Header */}
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Groups
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Manage and explore programming groups
                                </p>
                            </div>
                            {isLoading && (
                                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-pulse">
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight hidden sm:inline">Updating</span>
                                </div>
                            )}
                        </div>

                        {/* Top Buttons */}
                        <div className="flex gap-2 sm:gap-3 items-center">
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                className="px-3 sm:px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition cursor-pointer text-sm space-x-1.5 sm:space-x-2"
                            >
                                <FontAwesomeIcon icon={faHashtag} />
                                <span className="hidden xs:inline sm:inline">
                                    Join by Code
                                </span>
                            </button>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-3 sm:px-5 py-2 rounded-lg bg-[#1b4583] text-white cursor-pointer text-sm space-x-1.5 sm:space-x-2 whitespace-nowrap"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span className="hidden xs:inline sm:inline">
                                    Create Group
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs + Search Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

                        {/* Tabs */}
                        <div className="relative flex bg-gray-200 py-1 px-1 sm:px-4 rounded-lg w-fit">
                            <div
                                className={`absolute top-1 bottom-1 w-[45%] bg-white rounded-md transition-transform duration-300 ${activeTab === "my" ? "translate-x-0" : "translate-x-full"
                                    }`}
                            />

                            <button
                                onClick={() => handleTabChange("my")}
                                className={`relative z-10 px-3 sm:px-5 py-1 text-sm sm:text-base font-semibold transition-colors duration-300 ${activeTab === "my" ? "text-gray-800" : "text-gray-500"
                                    }`}
                            >
                                My Groups
                            </button>

                            <button
                                onClick={() => handleTabChange("explore")}
                                className={`relative z-10 px-3 sm:px-5 py-1 text-sm sm:text-base font-semibold transition-colors duration-300 ${activeTab === "explore" ? "text-gray-800" : "text-gray-500"
                                    }`}
                            >
                                Explore
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search groups..."
                                onChange={handleSearchChange}
                                className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4583] text-sm"
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={onSuccess}

            />

            {/* Join Group Modal */}
            <JoinGroupModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onSuccess={onSuccess}
            />
        </>
    );
};

export default GroupsHeader;
