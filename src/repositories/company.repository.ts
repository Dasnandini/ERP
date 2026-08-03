import { db } from "@/db";
import { companies } from "@/db/schema/core/company";
import { memberships } from "@/db/schema/core/membership";
import { roles } from "@/db/schema/core/role";
import { addresses } from "@/db/schema/common/address";
import { files } from "@/db/schema/common/file";
import { departments } from "@/db/schema/hr/department";
import { paymentMethods } from "@/db/schema/finance/payment-method";
import { taxes } from "@/db/schema/finance/tax";
import { fiscalYears } from "@/db/schema/finance/fiscal-year";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export interface CompanySetupInput {
  name: string;
  phone: string;
  email?: string;
  website?: string;
  industry?: string;
  logoUrl?: string;
  logoName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  currency: string;
  timezone: string;
  gstNumber?: string;
  pan?: string;
}

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomHex = crypto.randomBytes(3).toString("hex");
  return `${base || "company"}-${randomHex}`;
}

export class CompanyRepository {
  async findById(id: string) {
    const result = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findMembershipsByUserId(userId: string) {
    try {
      return await db
        .select({
          membershipId: memberships.id,
          isDefaultCompany: memberships.isDefaultCompany,
          joinedAt: memberships.joinedAt,
          companyId: companies.id,
          companyName: companies.name,
          companySlug: companies.slug,
          companyPhone: companies.phone,
          companyEmail: companies.email,
          currency: companies.currency,
          timezone: companies.timezone,
          roleId: roles.id,
          roleName: roles.name,
        })
        .from(memberships)
        .innerJoin(companies, eq(memberships.companyId, companies.id))
        .leftJoin(roles, eq(memberships.roleId, roles.id))
        .where(eq(memberships.userId, userId));
    } catch {
      return [];
    }
  }

  async setupCompany(userId: string, userEmail: string, data: CompanySetupInput) {
    const runSetup = async (executor: any) => {
      // 1. Create Default Address
      const [addressRecord] = await executor
        .insert(addresses)
        .values({
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          isDefault: true,
        })
        .returning({ id: addresses.id });

      // 2. Create Logo File Entry if logo provided
      let logoFileId: string | null = null;
      if (data.logoUrl) {
        const [fileRecord] = await executor
          .insert(files)
          .values({
            fileName: data.logoName || "company-logo.png",
            originalName: data.logoName || "logo.png",
            url: data.logoUrl,
            mimeType: "image/png",
            size: 1024,
            type: "image",
          })
          .returning({ id: files.id });
        logoFileId = fileRecord.id;
      }

      // 3. Create Company
      const companySlug = slugify(data.name);
      const [companyRecord] = await executor
        .insert(companies)
        .values({
          name: data.name,
          phone: data.phone,
          email: data.email || userEmail,
          gstNumber: data.gstNumber || null,
          pan: data.pan || null,
          website: data.website || null,
          industry: data.industry || null,
          currency: data.currency || "INR",
          timezone: data.timezone || "Asia/Kolkata",
          slug: companySlug,
          status: "active",
          addressId: addressRecord.id,
          logoFileId: logoFileId,
          createdBy: userId,
        })
        .returning({ id: companies.id, name: companies.name, slug: companies.slug });

      const companyId = companyRecord.id;

      // 4. Create or Get Owner Role safely
      let ownerRole = (
        await executor
          .select({ id: roles.id })
          .from(roles)
          .where(and(eq(roles.companyId, companyId), eq(roles.name, "Owner")))
          .limit(1)
      )[0];

      if (!ownerRole) {
        const [insertedRole] = await executor
          .insert(roles)
          .values({
            companyId: companyId,
            name: "Owner",
            description: "Company Owner with administrative access",
            isSystem: true,
            createdBy: userId,
          })
          .returning({ id: roles.id });
        ownerRole = insertedRole;
      }

      // 5. Create Membership safely
      const existingMembership = (
        await executor
          .select({ id: memberships.id })
          .from(memberships)
          .where(and(eq(memberships.companyId, companyId), eq(memberships.userId, userId)))
          .limit(1)
      )[0];

      if (!existingMembership) {
        await executor.insert(memberships).values({
          companyId: companyId,
          userId: userId,
          roleId: ownerRole.id,
          isDefaultCompany: true,
          joinedAt: new Date(),
        });
      }

      // 6. Create Default Departments
      const defaultDepts = [
        { name: "Administration", code: "ADM", description: "General Administration & Management", isDefault: true },
        { name: "Human Resources", code: "HR", description: "Personnel & Recruitment", isDefault: false },
        { name: "Finance", code: "FIN", description: "Accounting & Financial Ops", isDefault: false },
        { name: "Sales & Marketing", code: "SAL", description: "Business Development & Sales", isDefault: false },
        { name: "Operations", code: "OPS", description: "Core Business Operations", isDefault: false },
      ];

      for (const dept of defaultDepts) {
        const existingDept = (
          await executor
            .select({ id: departments.id })
            .from(departments)
            .where(and(eq(departments.companyId, companyId), eq(departments.name, dept.name)))
            .limit(1)
        )[0];

        if (!existingDept) {
          await executor.insert(departments).values({
            companyId: companyId,
            name: dept.name,
            code: dept.code,
            description: dept.description,
            isDefault: dept.isDefault,
            status: "active",
            createdBy: userId,
          });
        }
      }

      // 7. Create Default Payment Methods
      const defaultMethods = [
        { name: "Cash", isDefault: true },
        { name: "Bank Transfer", isDefault: false },
        { name: "Credit Card", isDefault: false },
        { name: "UPI / Net Banking", isDefault: false },
      ];

      for (const pm of defaultMethods) {
        const existingPm = (
          await executor
            .select({ id: paymentMethods.id })
            .from(paymentMethods)
            .where(and(eq(paymentMethods.companyId, companyId), eq(paymentMethods.name, pm.name)))
            .limit(1)
        )[0];

        if (!existingPm) {
          await executor.insert(paymentMethods).values({
            companyId: companyId,
            name: pm.name,
            isDefault: pm.isDefault,
            isActive: true,
          });
        }
      }

      // 8. Create Default Tax Settings
      const defaultTaxes = [
        { name: "GST 18%", percentage: "18.00", type: "GST", isDefault: true },
        { name: "GST 12%", percentage: "12.00", type: "GST", isDefault: false },
        { name: "GST 5%", percentage: "5.00", type: "GST", isDefault: false },
        { name: "Exempt 0%", percentage: "0.00", type: "EXEMPT", isDefault: false },
      ];

      for (const taxItem of defaultTaxes) {
        const existingTax = (
          await executor
            .select({ id: taxes.id })
            .from(taxes)
            .where(and(eq(taxes.companyId, companyId), eq(taxes.name, taxItem.name)))
            .limit(1)
        )[0];

        if (!existingTax) {
          await executor.insert(taxes).values({
            companyId: companyId,
            name: taxItem.name,
            percentage: taxItem.percentage,
            type: taxItem.type,
            isDefault: taxItem.isDefault,
          });
        }
      }

      // 9. Create Default Fiscal Year
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 3, 1);
      const endDate = new Date(currentYear + 1, 2, 31);
      const fyName = `FY ${currentYear}-${currentYear + 1}`;

      const existingFy = (
        await executor
          .select({ id: fiscalYears.id })
          .from(fiscalYears)
          .where(and(eq(fiscalYears.companyId, companyId), eq(fiscalYears.name, fyName)))
          .limit(1)
      )[0];

      if (!existingFy) {
        await executor.insert(fiscalYears).values({
          companyId: companyId,
          name: fyName,
          startDate: startDate,
          endDate: endDate,
          isCurrent: true,
          isClosed: false,
        });
      }

      return companyRecord;
    };

    try {
      return await db.transaction(async (tx) => runSetup(tx));
    } catch (err: any) {
      if (
        err?.message?.includes("No transactions support") ||
        err?.message?.includes("driver") ||
        err?.toString?.()?.includes("neon-http")
      ) {
        return await runSetup(db);
      }
      throw err;
    }
  }
}

export const companyRepository = new CompanyRepository();
