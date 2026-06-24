
import { getUserToken } from "../server-utils";

export async function updateProfilePicture(file: File) {
  try {
    const { token } = await getUserToken();

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      "http://localhost:9090/api/v1/users/profile-picture",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
}
export async function deleteProfilePicture() {
  try {
    const { token } = await getUserToken();

    const res = await fetch(`http://localhost:9090/api/v1/users/profile-picture`, {
      method: 'DELETE', 
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return { ok: res.ok };
  } catch (error) {
    console.error("Delete Error:", error);
    return { ok: false };
  }
}
