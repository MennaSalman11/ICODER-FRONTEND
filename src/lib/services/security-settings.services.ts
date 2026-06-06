import { log } from "console";
import { getUserToken } from "../server-utils";
import { SecurityPayload } from "@/src/schema/security.schema";

// 1. change password
export async function updatePassword(data : SecurityPayload) {
  try {
    const { token } = await getUserToken();
    console.log('token in update password service :' , token);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
      },
    
      body: JSON.stringify(
       {
        current_password: data.current_password,
        new_password: data.new_password,
        password_confirmation: data.password_confirmation
       }
      )
    });
    
    const result = await res.json();
    console.log('password update response :' , result);
    return { ok: res.ok, status: res.status, data: result };
  } catch (error) {
    return { ok: false, status: 500 };
  }
}

// 2. change email
export async function updateEmail(data: { new_email: string; current_password: string }) {
  try {
    const { token } = await getUserToken();
    console.log('token in update email service :' , token);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/email/request-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data) 
    });
    
    const result = res.status !== 204 ? await res.json() : { message: 'Success' };
    console.log('email update response :' , result);
    return { ok: res.ok, status: res.status, data: result };
  } catch (error) {
    return { ok: false, status: 500 };
  }
}