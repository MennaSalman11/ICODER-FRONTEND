// src/lib/services/contest-services.ts
import { LeaderboardRow, SaveContestRequest } from '../../types/contest';
import { SubmissionFilters, PaginatedSubmissionsResponse } from '../../types/contest';

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

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${contestId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update contest: ${response.status} - ${errorText}`);
    }

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
  },


  getProtectedContests: async (
    userId: number | string,
    groupId: number | string,
    token?: string
  ): Promise<{ message: string }> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // استخدام الـ API_BASE_URL لتصبح /api/v1/contests/protected/{userId}/{groupId}
    const response = await fetch(`${API_BASE_URL}/protected/${userId}/${groupId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch protected contests: ${response.status} - ${errorText}`);
    }

    return response.json(); // بترجع الـ JSON المتوقع { "message": "string" }
  },

  async getContestSubmissions(
    contestId: string | number,
    filters: SubmissionFilters,
    token?: string
  ): Promise<PaginatedSubmissionsResponse> {

    const params = new URLSearchParams();

    // 1. معالجة الـ Pagination (Spring Boot متوقع أرقام صريحة)
    // إذا كانت الصفحة 0، نمررها صراحة ولا نعتبرها Falsy
    if (filters.page !== undefined) params.append("page", filters.page.toString());
    if (filters.size !== undefined) params.append("size", filters.size.toString());

    // 2. معالجة الفلاتر الاختيارية (نرسلها فقط لو اليوزر كتب/اختار قيمة فعلاً)
    if (filters.handle && filters.handle.trim() !== "") {
      params.append("handle", filters.handle.trim());
    }

    // لو القيمة 'ALL' أو فاضية، متcumulativeش الـ param عشان الـ Backend ميقراش كلمة 'ALL' كـ Filter فعلي
    if (filters.result && filters.result !== "ALL" && filters.result.trim() !== "") {
      params.append("result", filters.result);
    }

    if (filters.language && filters.language !== "ALL" && filters.language.trim() !== "") {
      params.append("language", filters.language);
    }

    if (filters.problem_id !== undefined && filters.problem_id !== "") {
      params.append("problem_id", filters.problem_id.toString());
    }

    // 3. ⚠️ حـل أزمـة الـ 500 (الـ Sort):
    // الـ Spring Boot بيفشل تماماً لو بعتنا sort فاضي أو ممسوح. 
    // الأفضل نسيبه للـ Backend يحدد الـ default، أو نبعته فقط لو فيه قيمة حقيقية.
    if (filters.sort && filters.sort.trim() !== "") {
      params.append("sort", filters.sort);
    }

    // بناء الـ URL النهائي المستهدف
    const url = `http://localhost:9090/api/v1/submissions/contests/${contestId}?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`Failed to fetch contest submissions: HTTP ${response.status}`);
    }

    return await response.json();
  },
  getContestLeaderboard: async (contestId: number, token?: string): Promise<LeaderboardRow[]> => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // لو الـ endpoint دي محتاجة توكن عشان يفتح الليدربورد
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/${contestId}/leaderboard`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: HTTP ${response.status}`);
      }

      const data: LeaderboardRow[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error in getContestLeaderboard:", error);
      throw error;
    }
  },


};