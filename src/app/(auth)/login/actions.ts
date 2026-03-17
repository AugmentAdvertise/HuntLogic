"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;

  try {
    await signIn("resend", {
      email,
      redirectTo: `/verify?email=${encodeURIComponent(email)}`,
    });
  } catch (error) {
    // AuthError = actual failure (bad email, API error, etc.)
    // Anything else (NEXT_REDIRECT) gets re-thrown so Next.js handles it
    if (error instanceof AuthError) {
      return { error: "Failed to send magic link. Please try again." };
    }
    throw error;
  }

  return null;
}
