import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { auditLogRepository } from "@/repositories";

export async function GET(req: NextRequest) {
  const { auth, response } = await getAuthContext(req, PERMISSIONS.DEPARTMENT_READ);
  if (response) return response;
  const { companyId } = auth!;

  try {
    const logs = await auditLogRepository.findByModule(companyId, "department", 30);
    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("[GET /api/departments/logs] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
