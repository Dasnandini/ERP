import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plain, hashed);
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number." };
  }
  return { valid: true };
}

// ─── Session JWT ──────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  email: string;
}

export function signSessionJwt(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySessionJwt(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifySessionJwtEdge(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBin = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBin, data);

    if (!isValid) return null;

    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    if (!payload.userId || !payload.email) return null;

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}


export function signEmailVerificationToken(email: string): string {
  return jwt.sign({ email, purpose: "email-verification" }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyEmailVerificationToken(
  token: string
): { email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      purpose: string;
    };
    if (decoded.purpose !== "email-verification") return null;
    return { email: decoded.email };
  } catch {
    return null;
  }
}

export function signPasswordResetToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, purpose: "password-reset" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function verifyPasswordResetToken(
  token: string
): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      purpose: string;
    };
    if (decoded.purpose !== "password-reset") return null;
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = "auth_session";

export function generateId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

