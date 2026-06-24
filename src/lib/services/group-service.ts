// src/services/group-service.ts

import { apiClient } from "./api-client";
import {
    GroupResponse,
    CreateGroupRequest,
    UpdateGroupRequest,
    GroupMemberResponse,
    PageResponse
} from "../../types/group";

export const groupService = {
    searchGroups: (query: string, page = 0, size = 10): Promise<PageResponse<GroupResponse>> =>
        fetch(`/api/groups?query=${query}&page=${page}&size=${size}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch groups");
                return res.json();
            }),

    // إنشاء مجموعة
    // في ملف group-service.ts

    createGroup: (groupData: {
        name: string;
        visibility: string;
        code_enabled: boolean;
        contest_coordinator_type: string;
        description: string;
    }): Promise<GroupResponse> => {
        return apiClient.post("/groups/create", groupData);

    },
    // ...

    // تحديث بيانات مجموعة
    updateGroup: (data: UpdateGroupRequest) =>
        apiClient.put<GroupResponse>("/groups", data),

    // جلب بيانات مجموعة بالـ ID
    getGroupById: (groupId: number) =>
        apiClient.get<GroupResponse>(`/groups/${groupId}`),

    // جلب أعضاء المجموعة (مع Pagination)
    getMembers: (groupId: number, page = 0) =>
        apiClient.get<PageResponse<GroupMemberResponse>>(`/groups/${groupId}/members?page=${page}`),

    // إضافة عضو / ترقية / تنزيل رتبة
    memberAction: (action: 'add' | 'promote' | 'demote', userHandle: string, groupId: number) =>
        apiClient.put(`/groups/members/${action}`, { user_handle: userHandle, group_id: groupId }),

    // حذف عضو
    removeMember: (groupId: number, handle: string) =>
    apiClient.delete(`/groups/${groupId}/members?userHandle=${encodeURIComponent(handle)}`),
    //promote member to manager
    promoteMember: (userHandle: string, groupId: number) =>
        apiClient.put("/groups/members/promote", {
            user_handle: userHandle,
            group_id: groupId
        }),

    demoteMember: (userHandle: string, groupId: number) =>
        apiClient.put("/groups/members/demote", {
            user_handle: userHandle,
            group_id: groupId
        }),

    // الانضمام لمجموعة بالـ Code
    joinGroupByCode: (code: string) =>
        apiClient.put<{ message: string }>(`/groups/join?code=${code}`),

    // الانضمام لمجموعة عامة مباشرةً بالـ ID
    joinGroup: (groupId: number) =>
        apiClient.put<{ message: string }>(`/groups/${groupId}/join`),



    inviteMember: (userHandle: string, groupId: number) =>
        apiClient.put("/groups/members/add", {
            user_handle: userHandle,
            group_id: groupId
        }),

    // جلب المجموعات الخاصة بالمستخدم
    getMyGroups: (page = 0, size = 10): Promise<PageResponse<GroupResponse>> =>
        apiClient.get<PageResponse<GroupResponse>>(`/groups/me?page=${page}&size=${size}`),

    updateGroupPicture: async (groupId: number, file: File) => {
        const formData = new FormData();
        formData.append('picture', file);
        formData.append('group_id', groupId.toString());


        return apiClient.put(`/groups/${groupId}/group-picture`, formData);
    },


    deleteGroupPicture: (groupId: number) =>
        apiClient.delete(`/groups/${groupId}/group-picture`),

    deleteGroup: (groupId: number) =>
        apiClient.delete(`/groups/${groupId}`),

    getGroupPicture: (groupId: number) =>
        apiClient.get<{ picture_url: string }>(`/groups/${groupId}/group-picture`),

    // Respond to a group invitation (ACCEPTED | REJECTED)
    respondToInvitation: (token: string, response: "ACCEPTED" | "REJECTED"): Promise<{ message: string }> =>
        apiClient.put<{ message: string }>("/invite/group-response", { token, response }),
};