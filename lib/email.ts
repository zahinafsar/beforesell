import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

export async function sendPromotionReviewEmail({
  promotionId,
  listingTitle,
  ownerName,
  totalBudget,
  durationDays,
}: {
  promotionId: string;
  listingTitle: string;
  ownerName: string;
  totalBudget: number;
  durationDays: number;
}): Promise<void> {
  const reviewUrl = `${APP_URL}/admin/promotions?promotion=${promotionId}`;
  const reviewEmail = process.env.BOOST_REVIEW_EMAIL || "afsarzahin@gmail.com";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: reviewEmail,
    subject: `Boost review requested: ${listingTitle}`,
    html: emailLayout(`
      <p style="margin: 0 0 8px; color: #2563eb; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;">New Boost Request</p>
      <h1 style="margin: 0 0 12px; font-size: 22px; color: #111;">${escapeHtml(listingTitle)}</h1>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        ${escapeHtml(ownerName)} submitted this listing for a ${durationDays}-day boost.
      </p>
      <div style="background: #f3f6fb; border-left: 4px solid #214f7c; padding: 14px 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #6b7280;">Campaign budget</p>
        <p style="margin: 4px 0 0; font-size: 22px; font-weight: 700; color: #173f67;">৳${totalBudget.toLocaleString("en-BD")}</p>
      </div>
      ${button(reviewUrl, "Review promotion")}
    `),
  });
}
