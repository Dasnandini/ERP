import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepository, companyRepository } from "@/repositories";
import { verifySessionJwt, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

const setupCompanySchema = z.object({
  // Company Info
  name: z.string().min(2, "Company name must be at least 2 characters"),
  phone: z.string().min(5, "Phone number is required"),
  website: z.string().url("Invalid URL format").or(z.literal("")).optional(),
  industry: z.string().optional(),
  email: z.string().email("Invalid company email").or(z.literal("")).optional(),

  // Logo (optional URL or file payload)
  logoUrl: z.string().optional(),
  logoName: z.string().optional(),

  // Address Info
  addressLine1: z.string().min(3, "Address line 1 is required"),
  addressLine2: z.string().optional(),
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
    .optional(),
  pan: z
    .string()
    .length(10, "PAN must be 10 characters")
    .or(z.literal(""))
    .optional(),
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

    const body = await request.json();
    const parseResult = setupCompanySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Execute single database transaction via CompanyRepository
    const company = await companyRepository.setupCompany(user.id, user.email, data);

    return NextResponse.json(
      {
        message: "Company initialized successfully!",
        company,
        redirectTo: "/dashboard",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[company setup error]", err);
    let errorMessage = "Failed to set up company";

    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes("companies_email_unique") || msg.includes("companies_email_key")) {
        errorMessage = "A company with this email address is already registered.";
      } else if (msg.includes("companies_gst_number_unique") || msg.includes("companies_gst_number_key")) {
        errorMessage = "A company with this GST number is already registered.";
      } else if (msg.includes("companies_pan_unique") || msg.includes("companies_pan_key")) {
        errorMessage = "A company with this PAN is already registered.";
      } else if (msg.includes("companies_slug_unique") || msg.includes("companies_slug_key")) {
        errorMessage = "A company with a similar name already exists.";
      } else {
        errorMessage = err.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

