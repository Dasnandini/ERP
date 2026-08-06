import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { departmentRepository } from "@/repositories";

export async function GET(req: NextRequest) {
  const { auth, response } = await getAuthContext(req, PERMISSIONS.DEPARTMENT_READ);
  if (response) return response;
  const { companyId } = auth!;

  try {
    const managers = await departmentRepository.findManagers(companyId);
    return NextResponse.json({ managers });
  } catch (err: any) {
    console.error("[GET /api/departments/managers] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch managers" }, { status: 500 });
  }
}
