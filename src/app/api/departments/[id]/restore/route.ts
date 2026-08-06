import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { departmentRepository, auditLogRepository } from "@/repositories";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth, response } = await getAuthContext(req, PERMISSIONS.DEPARTMENT_UPDATE);
  if (response) return response;
  const { user, companyId } = auth!;
  const { id } = await params;

  try {
    const existing = await departmentRepository.findById(id, companyId);
    if (!existing) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    if (!existing.deletedAt) {
      return NextResponse.json(
        { error: "Department is not soft-deleted" },
        { status: 400 }
      );
    }

    const restored = await departmentRepository.restore(id, companyId, user.id);

    // Write Audit Log
    await auditLogRepository.log({
      companyId,
      actorId: user.id,
      module: "department",
      action: "restore",
      entityType: "department",
      entityId: id,
      description: `Restored department '${existing.name}' from soft delete`,
      changes: { name: existing.name, restoredAt: new Date() },
    });

    return NextResponse.json({ message: "Department restored successfully", department: restored });
  } catch (err: any) {
    console.error("[POST /api/departments/[id]/restore] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to restore department" }, { status: 500 });
  }
}
