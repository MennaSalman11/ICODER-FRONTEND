"use server";

import { SubmissionFormValues } from "@/src/schema/submitCode.schema";
import { getUserToken } from "../server-utils";

// 1. جلب اللغات المدعومة بناءً على الـ Online Judge
export const getLanguages = async (oj: string) => {
  const { token } = await getUserToken();
  const res = await fetch(`http://localhost:9090/api/v1/submissions/languages/${oj.toLowerCase()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  return await res.json(); 
};

// 2. تعديل خصوصية الـ Submission (عام / خاص)
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

// 3. تقديم الحل (Submit Code) وإرساله للباكيند
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

// 4. فحص حالة وجود الـ Session للحساب (GET)
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

// 5. إضافة الـ Session ID لأول مرة (POST) متوافق مع الـ Swagger
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

// 6. تحديث الـ Session ID الحالي (POST Update) متوافق مع الـ Swagger
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

// 7. حذف الـ Session الخاصة باليوزر بناءً على اسم الـ Judge
export const deleteUserSession = async (judgeType: string) => {
  const { token } = await getUserToken();
  const res = await fetch(`http://localhost:9090/api/v1/submissions/session/${judgeType.toUpperCase()}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to delete session");
  return true;
};

// 8. تتبع حالة الـ Submission الحالي (Polling)
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