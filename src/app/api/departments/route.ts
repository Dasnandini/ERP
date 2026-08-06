import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/permissions";
import { departmentRepository, auditLogRepository } from "@/repositories";
import { createDepartmentSchema } from "@/lib/validations/department";

export async function GET(req: NextRequest) {
  const { auth, response } = await getAuthContext(req, PERMISSIONS.DEPARTMENT_READ);
  if (response) return response;
  const { companyId } = auth!;

  try {
    const url = req.nextUrl;
    const search = url.searchParams.get("search") || undefined;
    const status = (url.searchParams.get("status") as "active" | "inactive" | "all") || "all";
    const deletedState = (url.searchParams.get("deletedState") as "active_only" | "deleted_only" | "all") || "active_only";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const result = await departmentRepository.findPaginated({
      companyId,
      search,
      status,
      deletedState,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[GET /api/departments] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { auth, response } = await getAuthContext(req, PERMISSIONS.DEPARTMENT_CREATE);
  if (response) return response;
  const { user, companyId } = auth!;

  try {
    const body = await req.json();
    const parsed = createDepartmentSchema.safeParse(body);

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

    // Check duplicate department name
    const isDuplicateName = await departmentRepository.checkDuplicateName(companyId, name);
    if (isDuplicateName) {
      return NextResponse.json(
        { error: `Department name '${name}' already exists in your company.` },
        { status: 409 }
      );
    }

    // Check duplicate code if provided
    if (code) {
      const isDuplicateCode = await departmentRepository.checkDuplicateCode(companyId, code);
      if (isDuplicateCode) {
        return NextResponse.json(
          { error: `Department code '${code}' already exists.` },
          { status: 409 }
        );
      }
    }

    const department = await departmentRepository.create({
      companyId,
      name,
      code,
      description,
      managerId,
      status: status || "active",
      createdBy: user.id,
    });

    // Write Audit Log
    await auditLogRepository.log({
      companyId,
      actorId: user.id,
      module: "department",
      action: "create",
      entityType: "department",
      entityId: department.id,
      description: `Created department '${department.name}' (${department.code || "No code"})`,
      changes: {
        name: department.name,
        code: department.code,
        status: department.status,
      },
    });

    return NextResponse.json(
      { message: "Department created successfully", department },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/departments] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create department" }, { status: 500 });
  }
}
