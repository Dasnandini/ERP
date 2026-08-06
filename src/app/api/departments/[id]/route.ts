import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { departmentRepository, auditLogRepository } from "@/repositories";
import { updateDepartmentSchema } from "@/lib/validations/department";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth, response } = await getAuthContext(req, PERMISSIONS.DEPARTMENT_READ);
  if (response) return response;
  const { companyId } = auth!;
  const { id } = await params;

  try {
    const department = await departmentRepository.findById(id, companyId);
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    return NextResponse.json({ department });
  } catch (err: any) {
    console.error("[GET /api/departments/[id]] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch department" }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await req.json();
    const parsed = updateDepartmentSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        if (!details[field]) details[field] = [];
        details[field].push(issue.message);
      });
      return NextResponse.json(
        { error: "Validation failed", details },
        { status: 400 }
      );
    }

    const { name, code, description, managerId, status } = parsed.data;

    // Check duplicate name if provided and changed
    if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
      const isDuplicateName = await departmentRepository.checkDuplicateName(companyId, name, id);
      if (isDuplicateName) {
        return NextResponse.json(
          { error: `Department name '${name}' already exists in your company.` },
          { status: 409 }
        );
      }
    }

    // Check duplicate code if provided and changed
    if (code !== undefined && code !== existing.code) {
      if (code) {
        const isDuplicateCode = await departmentRepository.checkDuplicateCode(companyId, code, id);
        if (isDuplicateCode) {
          return NextResponse.json(
            { error: `Department code '${code}' already exists.` },
            { status: 409 }
          );
        }
      }
    }

    const updated = await departmentRepository.update(id, companyId, {
      name,
      code,
      description,
      managerId,
      status,
      updatedBy: user.id,
    });

    // Write Audit Log
    await auditLogRepository.log({
      companyId,
      actorId: user.id,
      module: "department",
      action: "update",
      entityType: "department",
      entityId: id,
      description: `Updated department '${updated.name}'`,
      changes: {
        before: { name: existing.name, code: existing.code, status: existing.status },
        after: { name: updated.name, code: updated.code, status: updated.status },
      },
    });

    return NextResponse.json({ message: "Department updated successfully", department: updated });
  } catch (err: any) {
    console.error("[PATCH /api/departments/[id]] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth, response } = await getAuthContext(req, PERMISSIONS.DEPARTMENT_DELETE);
  if (response) return response;
  const { user, companyId } = auth!;
  const { id } = await params;

  try {
    const existing = await departmentRepository.findById(id, companyId);
    if (!existing) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Default system departments cannot be deleted." },
        { status: 400 }
      );
    }

    const deleted = await departmentRepository.softDelete(id, companyId, user.id);

    // Write Audit Log
    await auditLogRepository.log({
      companyId,
      actorId: user.id,
      module: "department",
      action: "soft_delete",
      entityType: "department",
      entityId: id,
      description: `Soft-deleted department '${existing.name}'`,
      changes: { name: existing.name, deletedAt: deleted.deletedAt },
    });

    return NextResponse.json({ message: "Department soft-deleted successfully", department: deleted });
  } catch (err: any) {
    console.error("[DELETE /api/departments/[id]] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete department" }, { status: 500 });
  }
}
