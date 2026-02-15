import z from "zod"

export const LoginFormSchema = z.object({
    handle:z
    .string()
    .nonempty({message:'handle is required'}),
    password:z
    .string()
    .nonempty({message:'password is required'})
    .min(8,{message:'password must be at least 8 charactars'}),
})

export type loginFormPayload = z.infer<typeof LoginFormSchema>