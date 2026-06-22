"use client";

import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updatePassword } from "@/src/lib/services/security-settings.services";
import {
  PasswordPayload,
  PasswordSchema,
} from "@/src/schema/password.schema";

export default function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordPayload>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: PasswordPayload) => {
    const res = await updatePassword(values);

    if (!res.ok) {
      toast.error(res.data?.message || "Password update failed", {
        position: "top-right",
      });
      return;
    }

    toast.success("Password updated successfully!", {
      position: "top-right",
    });

    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-950">Change Password</h3>
            <p className="text-xs text-gray-400">
              Ensure your account is using a long, random password to stay
              secure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Current Password
            </label>
            <input
              {...register("current_password")}
              type="password"
              placeholder="********"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
            />
            {errors.current_password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.current_password.message}
              </p>
            )}
          </div>

          {/* New Password + Confirmation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">
                New Password
              </label>
              <input
                {...register("new_password")}
                type="password"
                placeholder="********"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
              />
              {errors.new_password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.new_password.message}
                </p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                Min. 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">
                Confirm New Password
              </label>
              <input
                {...register("password_confirmation")}
                type="password"
                placeholder="********"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password_confirmation.message}
                </p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                Min. 8 characters
              </p>
            </div>
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
            {isSubmitting ? "Saving..." : "Save Password"}
          </button>
        </div>
      </section>
    </form>
  );
}