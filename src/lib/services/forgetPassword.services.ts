export async function forgetPassword (email : string){
try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/password/forget`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        }, 
        body:JSON.stringify({email})
    });
    const data = await res.json();
    console.log('forget pass data :', data);
   
    return{
        ok: res.ok , 
        status: res.status,
        data
    }
    
} catch (error) {
    console.log(error);
    return {
        ok: false , 
        status: 500 , 
        data :{ message :'Network error'}
    }
}
}