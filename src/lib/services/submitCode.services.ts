"use server";

import { SubmissionFormValues } from "@/src/schema/submitCode.schema";
import { getUserToken } from "../server-utils";
import { SubmitCodeResponse } from "@/src/types/submitCode.interface";

export const getLanguages = async (oj: string) => {
  const { token } = await getUserToken();
  const res = await fetch(`http://localhost:9090/api/v1/submissions/languages/${oj.toLowerCase()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  return await res.json(); 
};


export const toggleSubmissionOpenness = async (submissionId: number) => {
  try {
    const { token } = await getUserToken();
    const response = await fetch(`http://localhost:9090/api/v1/submissions/${submissionId}/toogle-openness`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - Failed to toggle openness`);
    }

    return await response.json(); 
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const submitCodeSolution = async (payload: SubmissionFormValues) => {
  try {
    const { token } = await getUserToken();
    const response = await fetch(`http://localhost:9090/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit code");
    }

    return await response.json();
  } catch (error) {
    console.error("Submit Error:", error);
    throw error;
  }
};

export const getUserSessionByJudge = async (judgeType: string) => {
  try {
    const { token } = await getUserToken();
    const res = await fetch(`http://localhost:9090/api/v1/submissions/session/${judgeType.toUpperCase()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json(); 
  } catch (err) {
    return null;
  }
};


export const addUserSession = async (payload: { online_judge: string; session_data: string }) => {
  const { token } = await getUserToken();
  const res = await fetch(`http://localhost:9090/api/v1/submissions/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to add session");
  return await res.json();
};

export const updateUserSession = async (payload: { online_judge: string; session_data: string }) => {
  const { token } = await getUserToken();
  const res = await fetch(`http://localhost:9090/api/v1/submissions/session/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update session");
  return await res.json();
};

export const deleteUserSession = async (sessionId: number) => {
  const { token } = await getUserToken();
  const res = await fetch(`http://localhost:9090/api/v1/submissions/session/${sessionId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    }
  });
  
  if (!res.ok) throw new Error("Failed to delete session");
  return true;
};
export const getSubmissionById = async (id: number) => {
  try {
    const { token } = await getUserToken();
    const res = await fetch(`http://localhost:9090/api/v1/submissions/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

// get submissions with filters && no filters (for all submissions)
export const getSubmissions = async (
  filters: {
    page: number;
    size: number;
    problem_code?: string;
    online_judge?: string;
    handle?: string;
    language?: string;
  }
): Promise<SubmitCodeResponse> => {
      const { token } = await getUserToken();

  const url = new URL('http://localhost:9090/api/v1/submissions');
  
  url.searchParams.append('page', filters.page.toString());
  url.searchParams.append('size', filters.size.toString());
  
  if (filters.problem_code) url.searchParams.append('problem_code', filters.problem_code);
  if (filters.online_judge) url.searchParams.append('online_judge', filters.online_judge);
  if (filters.handle) url.searchParams.append('handle', filters.handle);
  if (filters.language) url.searchParams.append('language', filters.language);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}` }, // أضيفي الـ Auth Token هنا
  });
  if (!res.ok) {
    const errorText = await res.text(); // لنرى تفاصيل الخطأ من السيرفر
    console.error("Backend Error:", errorText);
    throw new Error(`Error: ${res.statusText}`);
  }
  
  return res.json();
};

