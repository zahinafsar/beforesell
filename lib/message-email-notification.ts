import { sendNewMessageEmail } from "@/lib/email";

const MESSAGE_EMAIL_COOLDOWN_MS = 60 * 60 * 1000;
const OFFLINE_AFTER_MS = 60 * 1000;

const globalForMessageEmailNotifications = globalThis as unknown as {
  messageEmailNotifications: Map<string, number> | undefined;
};

const messageEmailNotifications =
  globalForMessageEmailNotifications.messageEmailNotifications ?? new Map<string, number>();

globalForMessageEmailNotifications.messageEmailNotifications = messageEmailNotifications;

interface SendMessageEmailNotificationOptions {
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientEmail: string;
  recipientLastSeen: Date;
  subjectTitle: string;
  conversationId: string;
}

function getConversationUrl(conversationId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is required for message email notifications");
  }

  let conversationUrl: URL;
  try {
    conversationUrl = new URL("/messages", appUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be a valid absolute URL");
  }

  conversationUrl.searchParams.set("conversation", conversationId);
  return conversationUrl.toString();
}

export async function sendMessageEmailNotification({
  senderId,
  senderName,
  recipientId,
  recipientEmail,
  recipientLastSeen,
  subjectTitle,
  conversationId,
}: SendMessageEmailNotificationOptions): Promise<boolean> {
  const now = Date.now();
  const cooldownCutoff = now - MESSAGE_EMAIL_COOLDOWN_MS;

  for (const [key, sentAt] of messageEmailNotifications) {
    if (sentAt <= cooldownCutoff) {
      messageEmailNotifications.delete(key);
    }
  }

  if (recipientLastSeen.getTime() >= now - OFFLINE_AFTER_MS) {
    return false;
  }

  const notificationKey = `${senderId}:${recipientId}`;
  const lastNotificationAt = messageEmailNotifications.get(notificationKey);

  if (lastNotificationAt !== undefined && lastNotificationAt > cooldownCutoff) {
    return false;
  }

  messageEmailNotifications.set(notificationKey, now);

  try {
    await sendNewMessageEmail(
      recipientEmail,
      senderName,
      subjectTitle,
      getConversationUrl(conversationId)
    );
    return true;
  } catch (error) {
    if (messageEmailNotifications.get(notificationKey) === now) {
      messageEmailNotifications.delete(notificationKey);
    }
    throw error;
  }
}
