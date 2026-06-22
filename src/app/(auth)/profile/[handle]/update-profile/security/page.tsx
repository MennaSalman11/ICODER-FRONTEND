// app/profile/[handle]/update-profile/security/page.tsx
"use client";
import { Lock, Mail, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SecurityPayload, SecuritySchema } from "@/src/schema/security.schema";
import { updateEmail, updatePassword } from "@/src/lib/services/security-settings.services";
import { useEffect, useRef } from "react";
// import { useRef } from "react";
export default function SecurityPage() {
  const formRef = useRef<HTMLFormElement>(null);

const handleReset = () => {
  formRef.current?.reset(); 
};
const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting }
} = useForm<SecurityPayload>({
  defaultValues: {
    current_password: "",
    verify_password: "",
    new_password: "",
    password_confirmation: "",
    new_email: "",
  },
  resolver: zodResolver(SecuritySchema),
});

useEffect(() => {
  reset({
    current_password: "",
    verify_password: "",
    new_password: "",
    password_confirmation: "",
    new_email: "",
  });
}, [reset]);
const onSubmit = async (values: SecurityPayload) => {
  let passwordSuccess = true;
  let emailSuccess = true;

  // Change Password
  if (values.new_password) {
    const res = await updatePassword({
      current_password: values.current_password,
      new_password: values.new_password,
      password_confirmation: values.password_confirmation,
    });

    passwordSuccess = res.ok;

    if (!res.ok) {
      toast.error(
        res.data?.message || "Password update failed",
        { position: "top-right" }
      );
    } else {
      toast.success(
        "Password updated successfully!",
        { position: "top-right" }
      );
    }
  }

  // Change Email
  if (values.new_email) {
    console.log("new_email =", values.new_email);
    console.log("verify_password =", values.verify_password);

    const res = await updateEmail({
      new_email: values.new_email,
      current_password: values.verify_password || "",
    });

    emailSuccess = res.ok;

    if (!res.ok) {
      toast.error(
        res.data?.message || "Email update failed",
        { position: "top-right" }
      );
    } else {
      toast.success(
        "Email update request sent! Please check your new email to confirm.",
        { position: "top-right" }
      );
    }
  }

  if (passwordSuccess && emailSuccess) {
    if (values.new_password || values.new_email) {
      toast.success(
        "Security settings updated successfully!",
        { position: "top-right" }
      );
    } else {
      toast.info(
        "No changes were made.",
        { position: "top-right" }
      );
    }
  }
};
  return (
    <div className="space-y-10">
  <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-950">Change Password</h3>
            <p className="text-xs text-gray-400">Ensure your account is using long, random password to stay secure.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Current Password</label>
            <input
            {...register('current_password')} 
              type="password" 
              placeholder="********"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
            />
            {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password.message}</p>}
          </div>

        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-bold text-blue-900 mb-2">New Password</label>
              <input 
              {...register('new_password')}
                type="password" 
                placeholder="********"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
              />
              {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
              <p className="text-[10px] text-gray-400 mt-1">Min. 8 characters</p>
            </div>
            <div className="relative">
              <label className="block text-sm font-bold text-blue-900 mb-2">Confirm New Password</label>
              <input 
              {...register('password_confirmation')}
                type="password" 
                placeholder="********"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
              />
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
              <p className="text-[10px] text-gray-400 mt-1">Min. 8 characters</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

  
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-950">Change Account Email</h3>
            <p className="text-xs text-gray-400">This email is used for account recovery and important notifications.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">New Email Address</label>
            <input 
            {...register('new_email')}
              type="email" 
autoComplete="new-email"
  placeholder="new-email@example.com"              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
            />
            {errors.new_email && <p className="text-red-500 text-xs mt-1">{errors.new_email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Verify With Password</label>
            <input 
            {...register('verify_password')}
              type="password" 
              placeholder="Enter Current Password"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none transition-all"
            />
            {errors.verify_password && <p className="text-red-500 text-xs mt-1">{errors.verify_password.message}</p>}
          </div>
        </div>
      </section>

      
      <div className="flex justify-end gap-4 pt-6">
        <button  
         type="button"
        onClick={handleReset} className="px-6 py-2.5 rounded-xl text-white bg-[#011F4B] hover:bg-[#033176] transition-all">
          Reset
        </button>
        <button type="submit"
           disabled={isSubmitting}
           className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors cursor-pointer">
            {isSubmitting ? "Saving..." : "Save Changes"}
           </button>
      </div>
      </form>
    </div>
  )
}