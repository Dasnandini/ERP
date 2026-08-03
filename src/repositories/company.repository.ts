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
import { eq } from "drizzle-orm";
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
    return await db.transaction(async (tx) => {
      // 1. Create Default Address
      const [addressRecord] = await tx
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
        const [fileRecord] = await tx
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
      const [companyRecord] = await tx
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
        })
        .returning({ id: companies.id, name: companies.name, slug: companies.slug });

      const companyId = companyRecord.id;

      // 4. Create Owner Role
      const [ownerRole] = await tx
        .insert(roles)
        .values({
          companyId: companyId,
          name: "Owner",
          description: "Company Owner with administrative access",
          isSystem: true,
        })
        .returning({ id: roles.id });

      // 5. Create Membership & Assign Owner Role
      await tx.insert(memberships).values({
        companyId: companyId,
        userId: userId,
        roleId: ownerRole.id,
        isDefaultCompany: true,
        joinedAt: new Date(),
      });

      // 6. Create Default Departments
      await tx.insert(departments).values([
        {
          companyId: companyId,
          name: "Administration",
          code: "ADM",
          description: "General Administration & Management",
          isDefault: true,
          status: "active",
        },
        {
          companyId: companyId,
          name: "Human Resources",
          code: "HR",
          description: "Personnel & Recruitment",
          isDefault: false,
          status: "active",
        },
        {
          companyId: companyId,
          name: "Finance",
          code: "FIN",
          description: "Accounting & Financial Ops",
          isDefault: false,
          status: "active",
        },
        {
          companyId: companyId,
          name: "Sales & Marketing",
          code: "SAL",
          description: "Business Development & Sales",
          isDefault: false,
          status: "active",
        },
        {
          companyId: companyId,
          name: "Operations",
          code: "OPS",
          description: "Core Business Operations",
          isDefault: false,
          status: "active",
        },
      ]);

      // 7. Create Default Payment Methods
      await tx.insert(paymentMethods).values([
        { companyId: companyId, name: "Cash", isDefault: true, isActive: true },
        { companyId: companyId, name: "Bank Transfer", isDefault: false, isActive: true },
        { companyId: companyId, name: "Credit Card", isDefault: false, isActive: true },
        { companyId: companyId, name: "UPI / Net Banking", isDefault: false, isActive: true },
      ]);

      // 8. Create Default Tax Settings
      await tx.insert(taxes).values([
        { companyId: companyId, name: "GST 18%", percentage: "18.00", type: "GST", isDefault: true },
        { companyId: companyId, name: "GST 12%", percentage: "12.00", type: "GST", isDefault: false },
        { companyId: companyId, name: "GST 5%", percentage: "5.00", type: "GST", isDefault: false },
        { companyId: companyId, name: "Exempt 0%", percentage: "0.00", type: "EXEMPT", isDefault: false },
      ]);

      // 9. Create Default Fiscal Year
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 3, 1);
      const endDate = new Date(currentYear + 1, 2, 31);

      await tx.insert(fiscalYears).values({
        companyId: companyId,
        name: `FY ${currentYear}-${currentYear + 1}`,
        startDate: startDate,
        endDate: endDate,
        isCurrent: true,
        isClosed: false,
      });

      return companyRecord;
    });
  }
}

export const companyRepository = new CompanyRepository();
