"use client";

import { useEffect, useState } from "react";
import GroupsGrid from "./component/group-grid";
import GroupsHeader from "./component/group-header";
import { groupService } from "../../../lib/services/group-service";
import { GroupResponse } from "../../../types/group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const GroupsPage = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"my" | "explore">("my");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(9); // 9 matches the 3-column grid well

  // Reset to first page when search or tab changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        let groupsArray: GroupResponse[] = [];
        let response: any;

        if (activeTab === "my") {
          response = await groupService.getMyGroups(currentPage, pageSize);
        } else {
          response = await groupService.searchGroups(searchQuery, currentPage, pageSize);
        }

        // --- ميكانيزم استخراج البيانات السليم ---
        if (Array.isArray(response)) {
          groupsArray = response;
          setTotalPages(0);
        } else if (response?.content && Array.isArray(response.content)) {
          groupsArray = response.content;
          setTotalPages(response.totalPages || 0);
        } else if (response?.data && Array.isArray(response.data)) {
          groupsArray = response.data;
          setTotalPages(response.totalPages || 0);
        } else {
          groupsArray = [];
          setTotalPages(0);
        }

        // --- لو إحنا في "My Groups" بنفلتر محلياً للسرعة (فقط لو الداتا مش جاية مفلترة تماماً) ---
        if (activeTab === "my" && searchQuery) {
          const filtered = groupsArray.filter(g =>
            g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setGroups(filtered);
        } else {
          setGroups(groupsArray);
        }

      } catch (error) {
        console.error("Failed to fetch groups:", error);
        setGroups([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchGroups();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, refreshTrigger, currentPage, pageSize]);

  // تعديل الـ Refresh عشان يقبل الجروب الجديد (Optimistic UI)
  const handleRefresh = (newGroup?: GroupResponse) => {
    if (newGroup && activeTab === "my" && newGroup.visibility === "PUBLIC") {
      setGroups(prev => [newGroup, ...prev]);
    }
    if (newGroup && activeTab === "explore" && newGroup.visibility === "PUBLIC") {
      setGroups(prev => [newGroup, ...prev]);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  // Pagination Helper (Matching StatusTable aesthetic)
  const renderPagination = () => {
    const pages = [];
    const maxVisible = 3;

    for (let i = 0; i < Math.min(maxVisible, totalPages); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === i
            ? "bg-[#1b3f82] text-white font-bold"
            : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          {i + 1}
        </button>
      );
    }

    if (totalPages > maxVisible + 1) {
      pages.push(<span key="dots" className="text-gray-400 px-1">..</span>);
      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => setCurrentPage(totalPages - 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === totalPages - 1
            ? "bg-[#1b3f82] text-white font-bold"
            : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          {totalPages}
        </button>
      );
    } else if (totalPages > maxVisible) {
      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => setCurrentPage(totalPages - 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === totalPages - 1
            ? "bg-[#1b3f82] text-white font-bold"
            : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <GroupsHeader
          onSearch={setSearchQuery}
          onTabChange={setActiveTab}
          onSuccess={handleRefresh}
          isLoading={loading}
        />

        {loading && groups.length === 0 ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-8">
            <GroupsGrid groups={groups} />

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-center mt-10 rounded-xl">
                <div className="flex items-center bg-[#f0f4ff] rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1.5 text-[13px] font-semibold text-gray-600 hover:text-[#1b3f82] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                  >
                    Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {renderPagination()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1.5 text-[13px] font-semibold text-gray-600 hover:text-[#1b3f82] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && groups.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No groups found. Try a different search or create one!
          </div>
        )}
      </div>
    </div>
  );
};

// مكون بسيط للـ Loading عشان الكود يكون أنظف
const SkeletonLoader = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-80 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="h-44 bg-gray-200 rounded-t-xl" />
        <div className="p-5 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
      </div>
    ))}
  </div>
);

export default GroupsPage;