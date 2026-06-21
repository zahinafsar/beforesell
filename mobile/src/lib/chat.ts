import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  where,
} from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt: number | null;
};

/** Peer is considered typing if their flag was refreshed within this window. */
export const TYPING_TTL_MS = 6000;
/** Messages loaded per page (initial window + each "load older" fetch). */
export const MESSAGE_PAGE_SIZE = 30;

/** Deterministic 1:1 chat id, stable regardless of who opens it. */
export function chatId(a: string, b: string) {
  return [a, b].sort().join('__');
}

const chatDoc = (cid: string) => doc(db, 'chats', cid);
const messagesRef = (cid: string) => collection(db, 'chats', cid, 'messages');

// Structural type that matches both the modular and namespaced snapshot shapes.
type DocSnap = { id: string; data(): Record<string, any> };

function mapMessage(d: DocSnap): ChatMessage {
  const data = d.data();
  return {
    id: d.id,
    text: data.text as string,
    senderId: data.senderId as string,
    createdAt: data.createdAt ? data.createdAt.toMillis() : null,
  };
}

export async function sendMessage(cid: string, senderId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(messagesRef(cid), {
    text: trimmed,
    senderId,
    createdAt: serverTimestamp(),
  });
  // Stamp conversation metadata on the chat doc so the home list can query and
  // sort conversations by recency entirely in Firestore (no backend).
  await setDoc(
    chatDoc(cid),
    {
      participants: cid.split('__'),
      lastMessage: trimmed,
      lastMessageAt: serverTimestamp(),
      lastSenderId: senderId,
    },
    { merge: true },
  ).catch(() => {});
}

// Live subscription to only the most recent page of messages (returned ascending)
// — bounded reads regardless of how long the conversation is.
export function subscribeRecentMessages(
  cid: string,
  cb: (messages: ChatMessage[]) => void,
  pageSize = MESSAGE_PAGE_SIZE,
) {
  const q = query(messagesRef(cid), orderBy('createdAt', 'desc'), limit(pageSize));
  return onSnapshot(q, (snap) => {
    if (snap) cb(snap.docs.map(mapMessage).reverse());
  });
}

// One-shot fetch of the page of messages older than `beforeMs` (ascending).
export async function fetchOlderMessages(
  cid: string,
  beforeMs: number,
  pageSize = MESSAGE_PAGE_SIZE,
) {
  const q = query(
    messagesRef(cid),
    orderBy('createdAt', 'desc'),
    startAfter(Timestamp.fromMillis(beforeMs)),
    limit(pageSize),
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapMessage).reverse();
}

// ----- typing + read receipts (chat doc) -----
export type ChatMeta = {
  /** uid -> last typing-active client timestamp (ms). */
  typing: Record<string, number>;
  /** uid -> last time that user read the chat (ms). */
  lastRead: Record<string, number>;
};

// Client clock (ms) is used for typing so freshness can be compared on read.
export function setTyping(cid: string, uid: string, isTyping: boolean) {
  setDoc(chatDoc(cid), { typing: { [uid]: isTyping ? Date.now() : 0 } }, { merge: true }).catch(
    () => {},
  );
}

export function markRead(cid: string, uid: string) {
  setDoc(chatDoc(cid), { lastRead: { [uid]: serverTimestamp() } }, { merge: true }).catch(() => {});
}

export function subscribeChatMeta(cid: string, cb: (meta: ChatMeta) => void) {
  return onSnapshot(chatDoc(cid), (snap) => {
    if (!snap) return;
    const data = snap.data() ?? {};
    const lastRead: Record<string, number> = {};
    Object.entries((data.lastRead ?? {}) as Record<string, { toMillis?: () => number }>).forEach(
      ([uid, ts]) => {
        lastRead[uid] = ts?.toMillis?.() ?? 0;
      },
    );
    cb({ typing: (data.typing ?? {}) as Record<string, number>, lastRead });
  });
}

// ----- conversation list (home screen) -----
export type Conversation = {
  chatId: string;
  peerId: string;
  lastMessage: string;
  lastMessageAt: number | null;
  lastSenderId: string;
  /** True when the newest message is from the peer and newer than my last read. */
  unread: boolean;
};

const conversationsRef = () => collection(db, 'chats');

function mapConversation(d: DocSnap, uid: string): Conversation {
  const data = d.data();
  const participants = (data.participants ?? []) as string[];
  const lastMessageAt = data.lastMessageAt ? data.lastMessageAt.toMillis() : null;
  const myLastRead = data.lastRead?.[uid]?.toMillis?.() ?? 0;
  const lastSenderId = (data.lastSenderId ?? '') as string;
  return {
    chatId: d.id,
    peerId: participants.find((p) => p !== uid) ?? '',
    lastMessage: (data.lastMessage ?? '') as string,
    lastMessageAt,
    lastSenderId,
    unread: lastSenderId !== uid && lastMessageAt != null && lastMessageAt > myLastRead,
  };
}

// Live list of the user's conversations. Filters by `participants` only (uses the
// auto-created single-field index — no composite index needed); the caller sorts
// by recency client-side. Conversation counts per user are small, so this is fine.
export function subscribeConversations(uid: string, cb: (conversations: Conversation[]) => void) {
  const q = query(conversationsRef(), where('participants', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => {
      if (snap) cb(snap.docs.map((d) => mapConversation(d, uid)));
    },
    (err) => console.warn('conversations query error:', err?.message),
  );
}
