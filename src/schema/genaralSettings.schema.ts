import z from "zod"
export const GeneralSettingsSchema = z.object({
    current_password:z
    .string()
    .nonempty({message:'current password is required'})
    .min(8,{message:'current password must be at least 8 charactars'}),

    nickname:z
    .string()
    .nonempty({message:'nickname is required'}),

    school:z
    .string()
    .nonempty({message:'school is required'}),
})

export type GeneralSettingsPayload = z.infer<typeof GeneralSettingsSchema>