// =============================================================================
// Login Page — Server Component with Server Actions
// =============================================================================
// Google SSO uses the server-side signIn() from next-auth which internally
// calls skipCSRFCheck. No CSRF tokens, no client fetches, no cookies to
// manage, no race conditions. This is the permanent, correct solution.
// =============================================================================

import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // If already authenticated, redirect to dashboard
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard";
  const error = params.error;
  const isSignup = params.signup === "true";

  return (
    <div className="rounded-2xl border border-brand-sage/10 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-brand-sage/20 dark:bg-brand-bark/40">
      {/* Heading */}
      <h2 className="text-center text-xl font-bold text-brand-forest dark:text-brand-cream">
        {isSignup ? "Create your free account" : "Welcome back"}
      </h2>
      <p className="mt-1 text-center text-sm text-brand-sage">
        {isSignup
          ? "Start building your personalized hunting strategy"
          : "Sign in to access your hunting intelligence"}
      </p>

      {/* Error display */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error === "OAuthAccountNotLinked"
            ? "This email is already associated with another sign-in method."
            : error === "MissingCSRF"
              ? "Session expired. Please try again."
              : "Something went wrong. Please try again."}
        </div>
      )}

      {/* Google SSO — server action, no CSRF needed */}
      <div className="mt-6 space-y-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-sage/20 bg-white px-4 py-3 text-sm font-medium text-brand-bark shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-brand-sage/30 dark:bg-brand-bark/30 dark:text-brand-cream dark:hover:bg-brand-bark/50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-brand-sage/20" />
        <span className="text-xs font-medium text-brand-sage">or</span>
        <div className="h-px flex-1 bg-brand-sage/20" />
      </div>

      {/* Email Magic Link — client component for interactivity */}
      <LoginForm callbackUrl={callbackUrl} isSignup={isSignup} />
    </div>
  );
}
