
import { getUserToken } from "../server-utils";

// export async function updateProfilePicture(file: File) {
//   try {
//     const { token } = await getUserToken();
// console.log("Token for updateProfilePicture:", token); // Debug log
//     const formData = new FormData();
//     formData.append('file', file); 

//     const res = await fetch(`http://localhost:9090/api/v1/users/profile-picture`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         "Content-Type": "application/json", 
//       },
//       body: formData 
//     });

//     const data = await res.json();
//     return { ok: res.ok, data };
//   } catch (error) {
//     console.error(error);
//     return { ok: false };
//   }
// }
// export async function updateProfilePicture(base64Image: string) {
//   try {
//     const { token } = await getUserToken();
//         const url = `http://localhost:9090/api/v1/users/profile-picture`;

//     const res = await fetch(url, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         file: base64Image
//       })
//     });

//     const data = await res.json();
//     return { ok: res.ok, data };
//   } catch (error) {
//     console.error(error);
//     return { ok: false };
//   }
// }
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
// export async function updateProfilePicture(file: File, token: string) {
//   try {
//     const formData = new FormData();
//     formData.append('file', file);

//     const res = await fetch(`http://localhost:9090/api/v1/users/profile-picture`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//  'X-Timestamp': Date.now().toString(),        // ❌ متحطيش Content-Type خالص — المتصفح هيحطه تلقائياً مع الـ boundary
//       },
//       body: formData
//     });

//     const data = await res.json();
//     console.log("Full Response:", JSON.stringify(data));
//     return { ok: res.ok, data };
//   } catch (error) {
//     console.error(error);
//     return { ok: false };
//   }
// }

// export async function deleteProfilePicture(token: string) {
//   try {
//     const res = await fetch(`http://localhost:9090/api/v1/users/profile-picture`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });
//     return { ok: res.ok };
//   } catch (error) {
//     console.error("Delete Error:", error);
//     return { ok: false };
//   }
// }