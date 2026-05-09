import { SubmissionFormValues } from "@/src/schema/submitCode.schema";
import { getUserToken } from "../server-utils";


// get langauages for submission code
export const getLanguages = async (oj: string) => {
  const { token } = await getUserToken();
  const res = await fetch(`http://localhost:9090/api/v1/submissions/languages/${oj.toLowerCase()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  return await res.json(); 
};

// toggle for openess
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

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// post code submission


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