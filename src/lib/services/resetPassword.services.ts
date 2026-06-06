export async function resetPassword(confirmation_password : string , new_password : string , token: string){
try {
    const requestbody ={
new_password:new_password ,
 confirmation_password: confirmation_password , 
 token: token
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/password/reset`,{
        method:'POST' , 
        headers:{"Content-Type": "application/json",
             },
             body: JSON.stringify(requestbody)
    });
    const data = await res.json();
    return {
        ok: res.ok , 
        status: res.status,
        ...data,
    };
} catch (error) {
    console.log(error);
    return {
        ok: false ,
        status :500 , 
        statusMsg:'error', 
        message: 'network error'
    }
    
}
}