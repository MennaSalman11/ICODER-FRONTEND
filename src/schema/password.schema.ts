import { z } from "zod";

export const PasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type PasswordPayload = z.infer<typeof PasswordSchema>;