// =============================================================================
// Server-side user extraction from Auth.js session
// =============================================================================

import { auth } from "@/lib/auth";

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  image?: string;
  onboardingComplete: boolean;
  onboardingStep: string;
}

/**
 * Get the authenticated user from the Auth.js session (server-side).
 * Use in Server Components, Server Actions, and API Route Handlers.
 *
 * @throws Error with status 401 if not authenticated
 */
export async function getServerUser(): Promise<AuthUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthError("Not authenticated", 401);
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name ?? undefined,
    image: session.user.image ?? undefined,
    onboardingComplete: session.user.onboardingComplete,
    onboardingStep: session.user.onboardingStep,
  };
}

/**
 * Get authenticated user or null (non-throwing variant).
 * Useful for pages that show different content for auth'd vs anon users.
 */
export async function getOptionalUser(): Promise<AuthUser | null> {
  try {
    return await getServerUser();
  } catch {
    return null;
  }
}

/**
 * Custom auth error with HTTP status code.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}
