"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function resendMagicLink(
  _prevState: { error?: string; sent?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; sent?: boolean }> {
  const email = formData.get("email") as string;
  if (!email) return { error: "No email provided." };

  try {
    await signIn("resend", {
      email,
      redirectTo: `/verify?email=${encodeURIComponent(email)}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Failed to resend. Please try again." };
    }
    throw error; // Re-throw NEXT_REDIRECT
  }

  return { sent: true };
}
