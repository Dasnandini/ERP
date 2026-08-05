import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepository, companyRepository } from "@/repositories";
import { verifySessionJwt, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

const setupCompanySchema = z.object({
  // Company Info
  name: z.string().min(2, "Company name must be at least 2 characters"),
  phone: z.string().min(5, "Phone number is required"),
  website: z
    .string()
    .url("Invalid URL format")
    .or(z.literal(""))
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  industry: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  email: z
    .string()
    .email("Invalid company email")
    .or(z.literal(""))
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),

  // Logo (optional URL or file payload)
  logoUrl: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  logoName: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),

  // Address Info
  addressLine1: z.string().min(3, "Address line 1 is required"),
  addressLine2: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(3, "Postal code is required"),

  // Fiscal / Regional
  currency: z.string().default("INR"),
  timezone: z.string().default("Asia/Kolkata"),
  gstNumber: z
    .string()
    .length(15, "GST Number must be 15 characters")
    .or(z.literal(""))
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  pan: z
    .string()
    .length(10, "PAN must be 10 characters")
    .or(z.literal(""))
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifySessionJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.userId;

    // Verify user exists via UserRepository
    const user = await userRepository.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a company setup
    const existingMemberships = await companyRepository.findMembershipsByUserId(user.id);
    if (existingMemberships && existingMemberships.length > 0) {
      return NextResponse.json(
        { error: "You already have an active company setup.", redirectTo: "/dashboard" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = setupCompanySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Execute atomic single database transaction via CompanyRepository
    const company = await companyRepository.setupCompany(user.id, user.email, data as any);

    return NextResponse.json(
      {
        message: "Company initialized successfully!",
        company,
        redirectTo: "/dashboard",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[company setup error]", err);
    let errorMessage = "Failed to set up company. Please verify your company details and try again.";

    const causeObj = err?.cause || err;
    const constraint = String(causeObj?.constraint || err?.constraint || "").toLowerCase();
    const detail = String(causeObj?.detail || err?.detail || "").toLowerCase();
    const rawMsg = String(err?.message || "").toLowerCase();

    const isUniqueViolation =
      rawMsg.includes("unique constraint") ||
      rawMsg.includes("duplicate key") ||
      causeObj?.code === "23505";

    if (
      constraint.includes("gst_number") ||
      detail.includes("gst_number") ||
      (isUniqueViolation && rawMsg.includes("gst_number"))
    ) {
      errorMessage = "A company with this GST number is already registered.";
    } else if (
      constraint.includes("pan") ||
      detail.includes("pan") ||
      (isUniqueViolation && rawMsg.includes("pan"))
    ) {
      errorMessage = "A company with this PAN is already registered.";
    } else if (
      constraint.includes("companies_email") ||
      detail.includes("companies_email") ||
      detail.includes("key (email)") ||
      (isUniqueViolation && rawMsg.includes("email"))
    ) {
      errorMessage = "A company with this email address is already registered.";
    } else if (
      constraint.includes("slug") ||
      detail.includes("slug") ||
      (isUniqueViolation && rawMsg.includes("slug"))
    ) {
      errorMessage = "A company with a similar name already exists. Please try a different company name.";
    } else if (
      rawMsg.includes("foreign key") ||
      detail.includes("foreign key") ||
      constraint.includes("foreign key")
    ) {
      errorMessage = "Invalid address or file reference. Please try again.";
    } else if (err?.message) {
      const cleanMsg = String(err.message).replace(/^Failed query:\s*.*?-\s*/, "");
      errorMessage = cleanMsg || String(err.message);
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
