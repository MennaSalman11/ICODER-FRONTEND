
"use server"
import {  formStateType } from './../../schema/register.schema';
import { RegisterFormSchema } from "@/src/schema/register.schema";
import { sendVerificationEmail } from './verifyEmail.services';

export async function handleRegister(formState: formStateType
     , formData:FormData){
    const formValues = {
     handle: formData.get('handle') ,
     nickname: formData.get('nickname'),
     email:formData.get('email'),
     password:formData.get('password'),
     password_confirmation:formData.get('password_confirmation'),
     school:formData.get('school')
    };
    console.log('handleRegister' , formValues);
    const parsedData = RegisterFormSchema.safeParse(formValues);
    if(!parsedData.success){
        return {
            success:false ,
            error:parsedData.error?.flatten().fieldErrors,
            message:null
        }
    }
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/register`,{
            method:'POST',
            headers:{
              "Content-Type": "application/json"
            },
            body:JSON.stringify(formValues)
        })
        const data = await res.json();
        console.log('register data' , data);
        if(!res.ok){
            // return{
            //     success:false,
            //     error:{},
            //     message:data.message
            // }
            return {
  success: false,
  error: {} as formStateType['error'],  // ✅
  message: data.message
}
        } else{
            sendVerificationEmail(data.handle);
             return {
  success: true,
  error: {} as formStateType['error'],  // ✅
  message: data.message
}
        }
      
    } catch (error) {
        console.log(error);
        return {
        success: false,
        error: {},
        message: "error from backend"
    };
    }
}