import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const FROM_EMAIL = "BeforeSell <noreply@beforesell.com>";

function emailLayout(content: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #111;">BeforeSell</h2>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
        ${content}
      </div>
      <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px;">
        &copy; ${new Date().getFullYear()} BeforeSell. All rights reserved.
      </p>
    </div>
  `;
}

function button(href: string, label: string) {
  return `
    <a href="${href}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 8px;">
      ${label}
    </a>
  `;
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your BeforeSell account",
    html: emailLayout(`
      <h1 style="margin: 0 0 8px; font-size: 20px; color: #111;">Welcome, ${name}!</h1>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Thanks for signing up. Please verify your email address to get started.
      </p>
      ${button(verifyUrl, "Verify Email")}
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; margin-bottom: 0;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    `),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your BeforeSell password",
    html: emailLayout(`
      <h1 style="margin: 0 0 8px; font-size: 20px; color: #111;">Reset your password</h1>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.
      </p>
      ${button(resetUrl, "Reset Password")}
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; margin-bottom: 0;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    `),
  });
}

export async function sendNewMessageEmail(
  email: string,
  senderName: string,
  listingTitle: string,
  conversationUrl: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${senderName} messaged you about "${listingTitle}"`,
    html: emailLayout(`
      <h1 style="margin: 0 0 8px; font-size: 20px; color: #111;">New message</h1>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong style="color: #111;">${senderName}</strong> sent you a message about:
      </p>
      <div style="background: #f9fafb; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111;">${listingTitle}</p>
      </div>
      ${button(conversationUrl, "View Conversation")}
    `),
  });
}
