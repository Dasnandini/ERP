import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.FROM_EMAIL ;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ;

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your email – ERP SaaS",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Verify your email address</h2>
        <p>Click the button below to verify your email. This link expires in 24 hours.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:12px">
          Or copy this link: ${link}
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your password – ERP SaaS",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Reset your password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:12px">
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });
}
