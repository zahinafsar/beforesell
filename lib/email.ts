import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const FROM_EMAIL = "BeforeSell <noreply@beforesell.com>";

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
    html: `
      <h1>Welcome to BeforeSell, ${name}!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
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
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
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
    subject: `New message from ${senderName} about "${listingTitle}"`,
    html: `
      <h1>You have a new message</h1>
      <p>${senderName} sent you a message about "${listingTitle}".</p>
      <a href="${conversationUrl}">View Message</a>
    `,
  });
}
