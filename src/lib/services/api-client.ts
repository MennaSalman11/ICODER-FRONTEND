// src/services/api-client.ts
import { getUserToken } from "../server-utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090/api/v1";

async function getHeaders() {
  const { token } = await getUserToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    if (!response.ok) throw new Error(`Fetch Error: ${response.statusText}`);
    return response.json();
  },

  async getBlob(endpoint: string): Promise<Blob> {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    if (!response.ok) throw new Error(`Fetch Error: ${response.statusText}`);
    return response.blob();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return response.json();
  },

  async put<T>(endpoint: string, body?: any): Promise<T> {
    const headers = await getHeaders();
    const isFormData = body instanceof FormData;

    // When sending FormData, let the browser set Content-Type (with boundary)
    if (isFormData) {
      delete (headers as Record<string, string>)["Content-Type"];
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return response.json();
  },


};