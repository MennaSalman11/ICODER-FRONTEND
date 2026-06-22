"use client";

import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateEmail } from "@/src/lib/services/security-settings.services";
import { EmailPayload, EmailSchema } from "@/src/schema/email.schema";

export default function EmailForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmailPayload>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      new_email: "",
      verify_password: "",
    },
  });

  const onSubmit = async (values: EmailPayload) => {
    const res = await updateEmail({
      new_email: values.new_email,
      current_password: values.verify_password,
    });

    if (!res.ok) {
      toast.error(res.data?.message || "Email update failed", {
        position: "top-right",
      });
      return;
    }

    toast.success(
      "Email update request sent! Please check your new email to confirm.",
      {
        position: "top-right",
      }
    );

    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-950">
              Change Account Email
            </h3>
            <p className="text-xs text-gray-400">
              This email is used for account recovery and important
              notifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {/* New Email */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              New Email Address
            </label>
            <input
              {...register("new_email")}
              type="email"
              autoComplete="email"
              placeholder="new-email@example.com"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
            />
            {errors.new_email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.new_email.message}
              </p>
            )}
          </div>

          {/* Verify Password */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Verify With Password
            </label>
            <input
              {...register("verify_password")}
              type="password"
              placeholder="Enter Current Password"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
            />
            {errors.verify_password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.verify_password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl text-white bg-[#011F4B] hover:bg-[#033176] transition-all"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Email"}
          </button>
        </div>
      </section>
    </form>
  );
}