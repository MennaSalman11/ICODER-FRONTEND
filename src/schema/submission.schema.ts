import z from "zod"

export const SubmissionSchema = z.object({
    language_id : z.number().min(1,{message:'language id is required'}),
    source_code : z.string().nonempty({message:'source code is required'}),
    stdin: z.string().default(""),
})

export const BatchSubmissionSchema = z.object({
    source_code : z.string().nonempty({message:'source code is required'}),
    language_id : z.number().min(1,{message:'language id is required'}),
    test_inputs : z.array(
        z.object({
            input: z.string().default(""),
            expected_output: z.string().default("")
        })
    )
})

export type SubmissionPayload = z.infer<typeof SubmissionSchema>

export type BatchSubmissionPayload = z.infer<typeof BatchSubmissionSchema>
