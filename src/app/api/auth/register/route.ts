import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema/core/user";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  validatePasswordStrength,
  signEmailVerificationToken,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = parseResult.data;

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.message }, { status: 400 });
    }
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      firstName,
      lastName: lastName ?? null,
      email,
      passwordHash,
      emailVerified: false,
      status: "active",
    });

    const verificationToken = signEmailVerificationToken(email);
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "Account created! Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
