// =============================================================================
// Auth.js exports — single source of truth for auth functions
// =============================================================================

import NextAuth from "next-auth";
import { authConfig } from "./config";

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
