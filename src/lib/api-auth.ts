import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionJwt } from "@/lib/auth";
import { userRepository, companyRepository } from "@/repositories";
import { checkPermission, PermissionCode } from "@/lib/permissions";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
  };
  companyId: string;
}

export async function getAuthContext(
  req: NextRequest,
  requiredPermission?: PermissionCode
): Promise<{ auth?: AuthContext; response?: NextResponse }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return {
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const payload = verifySessionJwt(token);
    if (!payload) {
      return {
        response: NextResponse.json({ error: "Invalid session token" }, { status: 401 }),
      };
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      return {
        response: NextResponse.json({ error: "User not found" }, { status: 401 }),
      };
    }

    // Determine target companyId (from header, query string, or default membership)
    const headerCompanyId = req.headers.get("x-company-id");
    const searchCompanyId = req.nextUrl.searchParams.get("companyId");
    let targetCompanyId = headerCompanyId || searchCompanyId || null;

    if (!targetCompanyId) {
      const userMemberships = await companyRepository.findMembershipsByUserId(user.id);
      if (!userMemberships.length) {
        return {
          response: NextResponse.json(
            { error: "No active company membership found" },
            { status: 403 }
          ),
        };
      }
      const defaultMembership = userMemberships.find((m) => m.isDefaultCompany) || userMemberships[0];
      targetCompanyId = defaultMembership.companyId;
    }

    // RBAC Permission Check
    if (requiredPermission) {
      const permCheck = await checkPermission(user.id, targetCompanyId, requiredPermission);
      if (!permCheck.allowed) {
        return {
          response: NextResponse.json(
            { error: `Forbidden: ${permCheck.reason || "Insufficient permissions"}` },
            { status: 403 }
          ),
        };
      }
    }

    return {
      auth: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        companyId: targetCompanyId,
      },
    };
  } catch (err: any) {
    console.error("[getAuthContext] Error:", err);
    return {
      response: NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
    };
  }
}
