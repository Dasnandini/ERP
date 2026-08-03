import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema/core/user";
import { eq } from "drizzle-orm";
import { verifyEmailVerificationToken } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = schema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token } = parseResult.data;

    const payload = verifyEmailVerificationToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired verification link. Please register again." },
        { status: 400 }
      );
    }

    const result = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const user = result[0];

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified. You can log in." });
    }

    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      message: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    console.error("[verify-email]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
