"use server";
import { getUserToken } from '@/src/lib/server-utils';

export async function getProfilePicture(handle: string) {
  const { token } = await getUserToken();
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/profile-picture?handle=${handle}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        cache: 'no-store', 
      }
    );

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    console.error(error);
    return { ok: false, data: null };
  }
}
export async function getProfile (handle: string){
    try {
       
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users?handle=${handle}`,{
            method:'GET',
            headers:{
   'Content-Type':'application/json'
            }
        });
        const data = await res.json();
        console.log('profile data :', data);

        return{
            ok:res.ok,
            status:res.status,
            data
        }
    } catch (error) {
        console.log(error);

        return{
            ok: false , 
            status:500 ,
            data:{message: 'cannot fetch profile data' }
        }
    }
}

