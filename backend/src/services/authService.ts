import { randomUUID } from 'node:crypto';
import type { AuthResponse, LoginRequest, SignupRequest } from '../schemas/index.js';

/**
 * Demo auth service. There is no real user store yet — these helpers return a
 * stub session so the frontend flows are exercised end to end. Replace with a
 * real identity provider / database when wiring authentication for production.
 */

function issueToken(): string {
  return `demo.${randomUUID()}`;
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'משתמש';
  return local || 'משתמש';
}

export function login(input: LoginRequest): AuthResponse {
  return {
    token: issueToken(),
    user: { id: randomUUID(), name: nameFromEmail(input.email), email: input.email },
  };
}

export function signup(input: SignupRequest): AuthResponse {
  return {
    token: issueToken(),
    user: { id: randomUUID(), name: input.name, email: input.email },
  };
}
