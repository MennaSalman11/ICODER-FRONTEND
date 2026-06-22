import { GeneralSettingsPayload } from "@/src/schema/generalSettings.schema";
import { getUserToken } from "../server-utils";

export async function updateGeneralSettingsData(data : GeneralSettingsPayload) {
    try{
 const {token} =await getUserToken();
console.log('tokeeeen is :' , token);
  
const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/update`,{
    method:'PUT',
    headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${token}`
    },
    body:JSON.stringify(data)
});

const result = await res.json();

return{
    ok: res.ok,
    status : res.status,
    data :result
}  }
catch(error){
    console.log(error);
    return{
        ok: false,
        status:500,
        data:{message: 'cannot update general settings data'}
    }}
}

    
