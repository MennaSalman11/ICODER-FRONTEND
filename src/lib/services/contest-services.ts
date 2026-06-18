// src/lib/services/contest-services.ts
import { SaveContestRequest } from '../../types/contest';

const API_BASE_URL = 'http://localhost:9090/api/v1/contests';

export const ContestService = {
  createContest: async (data: SaveContestRequest, token?: string): Promise<string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {

      const errorText = await response.text();
      throw new Error(`Failed to create contest: ${response.status} - ${errorText}`);
    }

    return response.text();
  },



  getAllContestsGlobal: async (
    params: { page?: number; size?: number; title?: string; group_name?: string } = {},
    token?: string
  ) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const { page = 0, size = 20, title, group_name } = params;
    const qs = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: 'beginTime,desc',
    });
    if (title) qs.set('title', title);
    if (group_name) qs.set('group_name', group_name);

    const response = await fetch(`${API_BASE_URL}/all?${qs.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch contests: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  getAllContests: async (groupName: string, page: number = 0, size: number = 5, token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/all?group_name=${encodeURIComponent(groupName)}&page=${page}&size=${size}&sort=beginTime,desc`;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch contests: ${response.status} - ${errorText}`);
    }

    // هيرجع الـ JSON الكبير اللي جواه الـ content والـ totalPages
    return response.json();
  },


async getContestById(id: number | string, token?: string) {
    // دايماً المسار العادي، الـ Backend هو اللي هيتحقق من صلاحية الدخول
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        // ممكن نتحكم في رسالة الخطأ هنا لو حابة
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch contest: ${response.status}`);
    }
    
    return response.json();
},
  getContestProblems: async (contestId: string | number, token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://localhost:9090/api/v1/contests/${contestId}/problems`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contest problems: ${response.status}`);
    }

    return response.json(); // هيرجع الـ Array اللي في السواجر مباشرة []
  },

  deleteContest: async (contestId: string | number, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://localhost:9090/api/v1/contests/${contestId}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contest: ${response.status}`);
    }

    // الإند بوينت بترجع String (زي ما واضح في السواجر) فبنقراه كـ text
    return response.text();
  },

  updateContest: async (contestId: string | number, updatedData: any, token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // إضافة توكن الحماية لو موجود
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // نداء الـ API بالمسار المظبوط ونوع الـ Method هو PUT
    const response = await fetch(`http://localhost:9090/api/v1/contests/${contestId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updatedData), // تحويل البيانات لـ JSON string
    });

    // لو السيرفر رجع إيرور، نقرأ تفاصيل الإيرور عشان الـ Debugging يسهل علينا
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update contest: ${response.status} - ${errorText}`);
    }

    // السيرفر بيرجع الـ Object المتعدل بعد النجاح
    return response.json();
  },


  joinProtectedContest: async (contestId: string | number, password: string, token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // هنا المسار بيروح لـ /protected/{contestId} حسب السواجر بالظبط
    const response = await fetch(`http://localhost:9090/api/v1/contests/protected/${contestId}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ password }), // بتبعت البودي جواه الـ password كـ Object
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to join protected contest: ${response.status} - ${errorText}`);
    }

    // شوفي لو الـ Backend بيرجع رسالة نصية أو بيعمل return لـ JSON واقرأيه على أساسه
    // المعتاد في الـ POST لو مش برجع Object بيرجع text، فعملناه هنا text أضمن
    return response.text(); 
  }
  
};