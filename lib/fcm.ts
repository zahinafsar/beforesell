import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// Lazily initialise the Firebase Admin app from a service-account JSON held in
// the FIREBASE_SERVICE_ACCOUNT env var (the full JSON, single-line or escaped).
// Returns null when unconfigured so calls degrade gracefully in dev.
let cachedApp: App | null = null;

function getApp(): App | null {
  if (cachedApp) return cachedApp;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
    return null;
  }

  // When the JSON is pasted into an env file, the private key's newlines often
  // survive as literal "\n" sequences rather than real newlines, which makes
  // OpenSSL reject the key ("Failed to parse private key"). Normalise them.
  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  cachedApp =
    getApps()[0] ??
    initializeApp({ credential: cert(serviceAccount as never) });
  return cachedApp;
}

export type CallPushData = {
  type: "incoming_call" | "call_cancelled" | "call_declined";
  channel: string;
  callerId: string;
  callerName: string;
};

// Sends a high-priority, data-only FCM message. Data-only (no `notification`
// block) guarantees the app's background handler runs even when killed, so it
// can raise the native incoming-call UI itself.
export async function sendCallPush(token: string, data: CallPushData) {
  const app = getApp();
  if (!app) {
    console.warn("FCM not configured — skipping call push");
    return;
  }

  await getMessaging(app).send({
    token,
    data: {
      type: data.type,
      channel: data.channel,
      callerId: data.callerId,
      callerName: data.callerName,
    },
    android: {
      priority: "high",
    },
  });
}

export type MessagePushData = {
  fromId: string;
  fromName: string;
  preview: string;
};

// Sends a new-message wake-up. Messages themselves live in Firebase; this only
// pings the recipient's device so it can raise a notification when not in-app.
export async function sendMessagePush(token: string, data: MessagePushData) {
  const app = getApp();
  if (!app) {
    console.warn("FCM not configured — skipping message push");
    return;
  }

  await getMessaging(app).send({
    token,
    data: {
      type: "chat_message",
      fromId: data.fromId,
      fromName: data.fromName,
      preview: data.preview,
    },
    android: { priority: "high" },
  });
}
