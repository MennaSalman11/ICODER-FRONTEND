// src/lib/services/meetings-service.ts

const API_BASE_URL = 'http://localhost:9090/api/v1/meetings';

// الـ Response المتوقع للإندبوينت بناءً على الـ Swagger
export interface MeetingResponse {
    id: number;
    title: string;
    room_name: string;
    type: string;
    status: string;
    official: boolean;
    scheduled_start_time: string;
    creator_handle: string;
    creator_id: number;
    created_at: string;
    ended_at: string | null;
}

export interface PaginatedMeetings {
    content: MeetingResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
export interface FetchMeetingsParams {
    page?: number;
    size?: number;
    status?: 'SCHEDULED' | 'ON_GOING' | 'ENDED' | '';
}
export interface CreateOfficialMeetingRequest {
    title: string;
    meeting_type: 'GENERAL' | 'EDITORIAL' | 'HELPDESK'; // الأنواع المتوافقة مع الـ UI والـ Swagger
    group_id: number;
    contest_id: number | null; // بياخد ID الكونتست لو الـ type هو EDITORIAL مثلاً، أو null لو مفيش
    instant: boolean;          // true لو هيبدأ فوراً، false لو هيتجدول لوقت تاني
    scheduled_start_time: string; // صيغة الـ ISO String للتاريخ والوقت
}

// البيانات المطلوبة في الـ Request Body لتشغيل الـ Session
export interface CreateQuickSessionRequest {
    title: string;
    group_id: number;
}

export const MeetingsService = {
    /**
     * إنشاء جلسة سريعة فورية
     * POST /api/v1/meetings/quick-session
     */
    createQuickSession: async (
        data: CreateQuickSessionRequest,
        token?: string
    ): Promise<MeetingResponse> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/quick-session`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create quick session: ${response.status} - ${errorText}`);
        }

        return response.json(); // بيرجع الـ Meeting Object الكامل بعد النجاح
    },
    createOfficialMeeting: async (
        data: CreateOfficialMeetingRequest,
        token?: string
    ): Promise<MeetingResponse> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/official`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create official meeting: ${response.status} - ${errorText}`);
        }

        return response.json(); // بيرجع الـ Meeting Object الكامل
    },
    getGroupMeetings: async (
        groupId: string | number,
        params: FetchMeetingsParams = {},
        token?: string
    ): Promise<PaginatedMeetings> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // تفكيك القيم وإعطاء قيم افتراضية للـ Pagination
        const { page = 0, size = 5, status } = params;

        // بناء الـ Query Parameters
        const queryParams = new URLSearchParams({
            page: String(page),
            size: String(size),
            sort: 'scheduledStartTime,desc',// ترتيب تنازلي من الأحدث للأقدم
        });

        if (status) {
            queryParams.set('status', status);
        }

        const url = `${API_BASE_URL}/group/${groupId}?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch group meetings: ${response.status} - ${errorText}`);
        }

        return response.json();
    }
};