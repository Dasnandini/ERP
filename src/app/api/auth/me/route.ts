import { NextResponse } from "next/server";
import { verifySessionJwt, AUTH_COOKIE_NAME } from "@/lib/auth";
import { userRepository, companyRepository } from "@/repositories";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = verifySessionJwt(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Fetch user memberships and company details via repository
    const userMemberships = await companyRepository.findMembershipsByUserId(user.id);

    return NextResponse.json({
      user,
      hasCompany: userMemberships.length > 0,
      memberships: userMemberships,
      activeCompany: userMemberships.find((m) => m.isDefaultCompany) || userMemberships[0] || null,
    });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json({ user: null, error: "Internal server error" }, { status: 500 });
  }
}
