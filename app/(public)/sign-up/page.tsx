import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your FixMate customer or technician account to book or offer verified device and home appliance repairs.",
}

export default function SignUpPage() {
  return (
    <AuthShell
      badge="Trusted Repair Network"
      headline="Smart repairs with total clarity from start to finish."
      description="Create an account in seconds. Track every repair stage live and unlock secure online payment only when the job is done."
    >
      <SignUpForm />
    </AuthShell>
  )
}
