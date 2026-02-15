"use server";

export async function getProfile (handle: string){
    try {
       
        const res = await fetch(`http://localhost:9090/api/v1/users?handle=${handle}`,{
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