import { z } from "zod"

export const RegisterFormSchema = z.object({
    handle: z.string()
    .nonempty({message:'handle is required'}),
    nickname:z.string()
    .nonempty({message:'nickname is required'}),
    email:z.string()
    .email({message:'please enter your email'}),
    password:z.string()
    .nonempty({message:'password is requird'})
    .min(8,{message:'password must be at least 8 charactars'}),
    password_confirmation:z.string()
    .nonempty({message:'password is requird'})
    .min(8,{message:'password must be at least 8 charactars'}),
    school:z.string({message:'please enter your school/unevirsty'})
})

export type RegisterSchema = z.infer<typeof RegisterFormSchema>;


export const formState: formStateType = {
  success: false,
  error: {
    handle: undefined,
    nickname: undefined,
    email: undefined,
    password: undefined,
    password_confirmation: undefined,
    school: undefined,
  },
  message: null
}

export type formStateType = {
  success: boolean,
  error: {
    handle?: string[];
    nickname?: string[];
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
    school?: string[];
  },
  message: string | null
}