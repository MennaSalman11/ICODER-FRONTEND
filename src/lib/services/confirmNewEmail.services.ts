export interface ConfirmEmailResponse {
  ok: boolean;
  status: number;
  data: {
    message: string;
    [key: string]: any;
  };
}


export async function confirmNewEmail (token : string){
try {
    const res = await fetch(`http://localhost:9090/api/v1/users/email/confirm?token=${token}`)
    const data =await res.json();
    return {
        ok : res.ok,
        status : res.status ,
        data ,
    };

} catch (error) {
    console.log(error);
    
    return{
        ok: false , 
        status :500 , 
        data: {message:'network error'}
    }
}
}