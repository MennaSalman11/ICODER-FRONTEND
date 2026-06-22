"use client";

import PasswordForm from "./components/password-form";
import EmailForm from "./components/email-form";

export default function SecurityPage() {
  return (
    <div className="space-y-10">
      <PasswordForm />

      <hr className="border-gray-100" />

      <EmailForm />
    </div>
  );
}