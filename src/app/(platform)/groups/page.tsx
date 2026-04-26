"use client";

import { useEffect, useState } from "react";
import GroupsGrid from "./component/group-grid";
import GroupsHeader from "./component/group-header";
import { groupService } from "../../../lib/services/group-service";
import { GroupResponse } from "../../../types/group";

const GroupsPage = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"my" | "explore">("my");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        let groupsArray: GroupResponse[] = [];
        let response: any;

        if (activeTab === "my") {
          response = await groupService.getMyGroups();
        } else {
          response = await groupService.searchGroups(searchQuery);
        }

        // --- ميكانيزم استخراج البيانات السليم ---
        if (Array.isArray(response)) {
          groupsArray = response;
        } else if (response?.content && Array.isArray(response.content)) {
          groupsArray = response.content;
        } else if (response?.data && Array.isArray(response.data)) {
          groupsArray = response.data;
        } else {
          groupsArray = [];
        }

        // --- لو إحنا في "My Groups" بنفلتر محلياً للسرعة ---
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
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchGroups();
    }, 400); // تقليل الـ debounce لسرعة الاستجابة

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, refreshTrigger]);

  // تعديل الـ Refresh عشان يقبل الجروب الجديد (Optimistic UI)
  const handleRefresh = (newGroup?: GroupResponse) => {
    if (newGroup && activeTab === "my" && newGroup.visibility === "PUBLIC") {
      // لو الجروب لسه مكريه، ضيفيه في أول القائمة فوراً
      setGroups(prev => [newGroup, ...prev]);
    }
    if (newGroup && activeTab === "explore" && newGroup.visibility === "PUBLIC") {
      // لو الجروب لسه مكريه، ضيفيه في أول القائمة فوراً
      setGroups(prev => [newGroup, ...prev]);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <GroupsHeader
          onSearch={setSearchQuery}
          onTabChange={setActiveTab}
          onSuccess={handleRefresh}
        />

        {loading && groups.length === 0 ? (
          <SkeletonLoader />
        ) : (
          <GroupsGrid groups={groups} />
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