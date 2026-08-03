"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { companyApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const INDUSTRIES = [
  "Information Technology & Software",
  "Manufacturing & Industrial",
  "Retail & E-commerce",
  "Healthcare & Pharmaceuticals",
  "Financial Services & Banking",
  "Professional & Legal Services",
  "Education & EdTech",
  "Real Estate & Construction",
  "Logistics & Supply Chain",
  "Media & Entertainment",
  "Other",
];

const CURRENCIES = [
  { code: "INR", name: "Indian Rupee (₹)" },
  { code: "USD", name: "US Dollar ($)" },
  { code: "EUR", name: "Euro (€)" },
  { code: "GBP", name: "British Pound (£)" },
  { code: "AED", name: "UAE Dirham (AED)" },
  { code: "SGD", name: "Singapore Dollar (S$)" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "(UTC+05:30) India Standard Time - Kolkata" },
  { value: "UTC", label: "(UTC+00:00) Coordinated Universal Time" },
  { value: "America/New_York", label: "(UTC-05:00) Eastern Time - New York" },
  { value: "Europe/London", label: "(UTC+00:00) London" },
  { value: "Asia/Dubai", label: "(UTC+04:00) Gulf Standard Time - Dubai" },
  { value: "Asia/Singapore", label: "(UTC+08:00) Singapore Standard Time" },
];

export default function CompanySetupPage() {
  const router = useRouter();
  const { user, hasCompany, loading: authLoading, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("Information Technology & Software");

  const [logoUrl, setLogoUrl] = useState("");
  const [logoName, setLogoName] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");

  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [gstNumber, setGstNumber] = useState("");
  const [pan, setPan] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (hasCompany) {
        router.push("/dashboard");
        return;
      }
      if (user.email && !email) {
        setEmail(user.email);
      }
    }
  }, [user, hasCompany, authLoading, email, router]);

  function validateStep(step: number): boolean {
    setError("");
    setFieldErrors({});

    if (step === 1) {
      if (!name.trim()) {
        setError("Company Name is required.");
        return false;
      }
      if (!phone.trim()) {
        setError("Phone number is required.");
        return false;
      }
    } else if (step === 3) {
      if (!addressLine1.trim()) {
        setError("Address Line 1 is required.");
        return false;
      }
      if (!city.trim()) {
        setError("City is required.");
        return false;
      }
      if (!state.trim()) {
        setError("State is required.");
        return false;
      }
      if (!country.trim()) {
        setError("Country is required.");
        return false;
      }
      if (!postalCode.trim()) {
        setError("Postal Code is required.");
        return false;
      }
    } else if (step === 4) {
      if (gstNumber && gstNumber.length !== 15) {
        setError("GST Number must be exactly 15 characters if provided.");
        return false;
      }
      if (pan && pan.length !== 10) {
        setError("PAN must be exactly 10 characters if provided.");
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }

  function handleBack() {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await companyApi.setup({
        name,
        phone,
        email: email || undefined,
        website: website || undefined,
        industry,
        logoUrl: logoUrl || undefined,
        logoName: logoName || undefined,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        country,
        postalCode,
        currency,
        timezone,
        gstNumber: gstNumber || undefined,
        pan: pan || undefined,
      });

      if (res.error) {
        if (res.details) {
          setFieldErrors(res.details);
        } else {
          setError(res.error || "Company setup failed.");
        }
        setSubmitting(false);
        return;
      }

      await refreshUser();
      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-400 text-sm">
        Checking account status…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent)]">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-indigo-950/20 relative z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            E
          </div>
          <span className="text-lg font-bold text-white tracking-tight">ERP SaaS</span>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Setup your company</h1>
        <p className="text-sm text-slate-400 mb-8">
          Initialize your organization workspace in seconds.
        </p>

        {/* Progress Bar */}
        <div className="relative flex items-center justify-between mb-8">
          <div className="absolute top-4 left-5 right-5 h-0.5 bg-slate-800 z-0">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>

          {[
            { step: 1, label: "Company" },
            { step: 2, label: "Logo" },
            { step: 3, label: "Address" },
            { step: 4, label: "Fiscal & Tax" },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <div
                key={s.step}
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                }}
                className={`flex flex-col items-center gap-1.5 z-10 ${s.step < currentStep ? "cursor-pointer" : "cursor-default"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-indigo-600 text-white"
                      : isActive
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30"
                      : "bg-slate-950 text-slate-500 border border-slate-800"
                  }`}
                >
                  {isCompleted ? "✓" : s.step}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-slate-100" : "text-slate-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2 mb-6">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* STEP 1: Company Profile */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300" htmlFor="company-name">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  className={`w-full px-3.5 py-2.5 bg-slate-950/80 border ${fieldErrors.name ? "border-red-500" : "border-slate-800"} rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`}
                  placeholder="Acme Technologies Pvt Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {fieldErrors.name && (
                  <span className="text-xs text-red-400">{fieldErrors.name[0]}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="company-phone">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="company-phone"
                    type="tel"
                    className={`w-full px-3.5 py-2.5 bg-slate-950/80 border ${fieldErrors.phone ? "border-red-500" : "border-slate-800"} rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`}
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="company-email">
                    Company Email
                  </label>
                  <input
                    id="company-email"
                    type="email"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="contact@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="company-website">
                    Website URL
                  </label>
                  <input
                    id="company-website"
                    type="url"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="https://acme.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="company-industry">
                    Industry
                  </label>
                  <select
                    id="company-industry"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-slate-900 text-slate-100">
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Logo & Branding */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300" htmlFor="logo-url">
                  Company Logo URL (Optional)
                </label>
                <input
                  id="logo-url"
                  type="url"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                <span className="text-xs text-slate-400">
                  Provide an image link for your company logo or leave blank for default avatar.
                </span>
              </div>

              {/* Logo Preview */}
              <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="max-h-16 max-w-[200px] object-contain rounded-lg"
                    onError={() => setError("Failed to load image preview from provided URL.")}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-extrabold text-white shadow-md shadow-indigo-500/20">
                    {name ? name.charAt(0).toUpperCase() : "C"}
                  </div>
                )}
                <span className="text-xs text-slate-400">
                  {logoUrl ? "Logo Preview" : "Generated Avatar Preview"}
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Business Address */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300" htmlFor="address-line1">
                  Address Line 1 <span className="text-red-400">*</span>
                </label>
                <input
                  id="address-line1"
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="123 Tech Park, MG Road"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300" htmlFor="address-line2">
                  Address Line 2
                </label>
                <input
                  id="address-line2"
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Suite 402, Building B"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="address-city">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="address-city"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="address-state">
                    State <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="address-state"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="address-country">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="address-country"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="address-postalcode">
                    Postal / PIN Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="address-postalcode"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="560001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Fiscal & Tax Settings */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="currency">
                    Operating Currency
                  </label>
                  <select
                    id="currency"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="timezone">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value} className="bg-slate-900 text-slate-100">
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="gst-number">
                    GST Number (Optional)
                  </label>
                  <input
                    id="gst-number"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="29AAAAA0000A1Z5"
                    maxLength={15}
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300" htmlFor="pan-number">
                    PAN Number (Optional)
                  </label>
                  <input
                    id="pan-number"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed">
                ℹ Clicking <strong>Create Company</strong> will initialize your company, default
                roles, owner permissions, departments, payment methods, GST tax rates, and fiscal
                year in a single transaction.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center gap-3 mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm transition-all"
                onClick={handleBack}
              >
                ← Back
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
                onClick={handleNext}
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] disabled:opacity-50 flex items-center gap-2"
                id="create-company-submit"
                disabled={submitting}
              >
                {submitting && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {submitting ? "Initializing Company…" : "Create Company"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
