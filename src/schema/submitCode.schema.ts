import * as z from "zod";
export const submissionSchema = z.object({
  user_id: z.coerce.number().optional().nullable(),
  problem_code: z.string().min(1, "Problem code is required"),
  online_judge: z.string().min(1, "Online judge is required"),
  code: z.string().min(20, "Code must be at least 20 characters long"),
  language: z.string().min(1, "Please select a language"),
  opened: z.boolean().default(true),
  submission_method: z.enum(["BOT", "SESSION"]).default("BOT"),
  contest_id: z.string().nullable().optional().default(null),
});
export type SubmissionFormValues = z.infer<typeof submissionSchema>;