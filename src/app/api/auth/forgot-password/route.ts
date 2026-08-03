import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema/core/user";
import { eq } from "drizzle-orm";
import { signPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email("Invalid email"),
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

    const { email } = parseResult.data;

    const result = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent email enumeration
    if (result.length === 0) {
      return NextResponse.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const user = result[0];
    const resetToken = signPasswordResetToken(user.id, user.email);
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
