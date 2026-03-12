// =============================================================================
// Signup Page — Redirects to login with ?signup=true flag
// Auth.js handles both login and signup through the same flow
// =============================================================================

import { redirect } from "next/navigation";

export default function SignupPage() {
  redirect("/login?signup=true");
}
