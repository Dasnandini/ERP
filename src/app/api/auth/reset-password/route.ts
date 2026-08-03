import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema/core/user";
import { eq } from "drizzle-orm";
import {
  verifyPasswordResetToken,
  hashPassword,
  validatePasswordStrength,
} from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = schema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, password } = parseResult.data;

    // Verify the JWT reset token
    const payload = verifyPasswordResetToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new one." },
        { status: 400 }
      );
    }

    // Password strength check
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.message }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, payload.userId));

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
