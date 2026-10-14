const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function getSecretKey(): string {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing required environment variable: TURNSTILE_SECRET_KEY");
  }
  return secret;
}

export async function verifyTurnstileToken(token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append("secret", getSecretKey());
  form.append("response", token);
  if (ip) {
    form.append("remoteip", ip);
  }

  const res = await fetch(VERIFY_URL, { method: "POST", body: form });
  if (!res.ok) {
    return false;
  }

  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
