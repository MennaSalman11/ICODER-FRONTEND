import { getUserToken } from "../server-utils";
import { PasswordPayload } from "@/src/schema/password.schema";

export async function updatePassword(data: PasswordPayload) {
  try {
    const { token } = await getUserToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: data.current_password,
          new_password: data.new_password,
          password_confirmation: data.password_confirmation,
        }),
      }
    );

    const result = await res.json().catch(() => null);

    return {
      ok: res.ok,
      status: res.status,
      data: result,
    };
  } catch (error) {
    console.error("updatePassword error:", error);
    return {
      ok: false,
      status: 500,
      data: { message: "Something went wrong while updating password." },
    };
  }
}

export async function updateEmail(data: {
  new_email: string;
  current_password: string;
}) {
  try {
    const { token } = await getUserToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/email/request-update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_email: data.new_email,
          current_password: data.current_password,
        }),
      }
    );

    const result = await res.json().catch(() => null);

    return {
      ok: res.ok,
      status: res.status,
      data: result,
    };
  } catch (error) {
    console.error("updateEmail error:", error);
    return {
      ok: false,
      status: 500,
      data: { message: "Something went wrong while updating email." },
    };
  }
}