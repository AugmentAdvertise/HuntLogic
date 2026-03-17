// =============================================================================
// Login Form — Client Component (Email Magic Link only)
// =============================================================================
// Uses a server action for sign-in. Auth.js server-side signIn() calls
// skipCSRFCheck internally — no CSRF tokens, no client fetches, no cookies
// to manage. Server actions are already protected by Next.js.
// =============================================================================

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail } from "./actions";

export function LoginForm({
  callbackUrl,
  isSignup,
}: {
  callbackUrl: string;
  isSignup: boolean;
}) {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-[10px] border border-[#E0DDD5] bg-white px-4 py-3 text-sm text-brand-bark placeholder:text-brand-sage/50 focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/20 dark:border-brand-sage/30 dark:bg-brand-bark/20 dark:text-brand-cream dark:placeholder:text-brand-sage/40 dark:focus:border-brand-sage dark:focus:ring-brand-sage/20"
          />
          {state?.error && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-gradient-cta px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <LoadingSpinner className="text-white" />
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          )}
          Send Magic Link
        </button>
      </form>

      {/* Toggle sign-in / sign-up */}
      <p className="mt-6 text-center text-sm text-brand-sage">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-forest underline-offset-2 hover:underline dark:text-brand-cream"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to HuntLogic?{" "}
            <Link
              href="/signup"
              className="font-medium text-brand-forest underline-offset-2 hover:underline dark:text-brand-cream"
            >
              Create an account
            </Link>
          </>
        )}
      </p>

      {/* Legal */}
      <p className="mt-4 text-center text-xs leading-relaxed text-brand-sage/70">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-brand-sage">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-brand-sage">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}

function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
