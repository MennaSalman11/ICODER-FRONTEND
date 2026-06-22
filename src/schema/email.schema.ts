import { z } from "zod";

export const EmailSchema = z.object({
  new_email: z.string().min(1, "New email is required").email("Invalid email address"),
  verify_password: z.string().min(1, "Current password is required"),
});

export type EmailPayload = z.infer<typeof EmailSchema>;