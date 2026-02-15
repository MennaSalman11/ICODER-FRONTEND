import { z } from "zod";

export const SecuritySchema = z.object({
    // schema change password
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters").optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
  
//   schema change email
  new_email: z.string().email("Invalid email address").optional().or(z.literal('')),
}).refine((data) => {
  if (data.new_password && data.new_password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export type SecurityPayload = z.infer<typeof SecuritySchema>;