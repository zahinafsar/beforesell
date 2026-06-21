import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  chatId,
  fetchOlderMessages,
  markRead,
  MESSAGE_PAGE_SIZE,
  sendMessage,
  setTyping,
  subscribeChatMeta,
  subscribeRecentMessages,
  TYPING_TTL_MS,
  type ChatMessage,
  type ChatMeta,
} from '@/lib/chat';

const TYPING_IDLE_MS = 3000;
const EMPTY_META: ChatMeta = { typing: {}, lastRead: {} };

function mergeById(older: ChatMessage[], recent: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of older) map.set(m.id, m);
  for (const m of recent) map.set(m.id, m);
  return Array.from(map.values()).sort(
    (a, b) => (a.createdAt ?? Infinity) - (b.createdAt ?? Infinity),
  );
}

// Drives one 1:1 conversation: paginated live messages, the peer's typing/read
// state, sending, and broadcasting our own typing + read state.
export function useChat(peerId: string) {
  const { user } = useAuth();
  const me = user?.id ?? null;
  const cid = me ? chatId(me, peerId) : null;

  const [recent, setRecent] = useState<ChatMessage[]>([]);
  const [older, setOlder] = useState<ChatMessage[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [meta, setMeta] = useState<ChatMeta>(EMPTY_META);
  const [, tick] = useState(0);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingActive = useRef(false);

  // Live newest page + chat meta (typing/read). Reset paging when the chat changes.
  useEffect(() => {
    if (!cid) return;
    setOlder([]);
    setHasMoreOlder(true);
    const unsubMessages = subscribeRecentMessages(cid, setRecent);
    const unsubMeta = subscribeChatMeta(cid, setMeta);
    return () => {
      unsubMessages();
      unsubMeta();
    };
  }, [cid]);

  // Re-derive typing freshness even when no new snapshot arrives.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 2000);
    return () => clearInterval(id);
  }, []);

  // Mark the conversation read whenever it's open and messages change.
  useEffect(() => {
    if (cid && me) markRead(cid, me);
  }, [cid, me, recent.length]);

  // Always clear our typing flag when leaving the chat.
  useEffect(
    () => () => {
      if (cid && me) setTyping(cid, me, false);
      typingActive.current = false;
    },
    [cid, me],
  );

  const messages = useMemo(() => mergeById(older, recent), [older, recent]);

  const loadOlder = useCallback(async () => {
    if (!cid || loadingOlder || !hasMoreOlder) return;
    const oldest = messages[0];
    if (!oldest?.createdAt) return;
    setLoadingOlder(true);
    try {
      const page = await fetchOlderMessages(cid, oldest.createdAt);
      if (page.length) setOlder((prev) => mergeById(page, prev));
      if (page.length < MESSAGE_PAGE_SIZE) setHasMoreOlder(false);
    } finally {
      setLoadingOlder(false);
    }
  }, [cid, loadingOlder, hasMoreOlder, messages]);

  const send = useCallback(
    async (text: string) => {
      if (!cid || !me || !text.trim()) return;
      if (typingActive.current) {
        setTyping(cid, me, false);
        typingActive.current = false;
      }
      await sendMessage(cid, me, text);
      // New-message push goes through our backend FCM; messages live in Firebase.
      api('/api/chat/notify', {
        method: 'POST',
        body: { to: peerId, preview: text.trim().slice(0, 120) },
      }).catch(() => {});
    },
    [cid, me, peerId],
  );

  const onChangeText = useCallback(
    (text: string) => {
      if (!cid || !me) return;
      // Only write on the false→true transition; reset the idle timer otherwise.
      if (text.length > 0 && !typingActive.current) {
        typingActive.current = true;
        setTyping(cid, me, true);
      }
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (typingActive.current) {
          typingActive.current = false;
          setTyping(cid, me, false);
        }
      }, TYPING_IDLE_MS);
    },
    [cid, me],
  );

  const peerTyping = Date.now() - (meta.typing[peerId] ?? 0) < TYPING_TTL_MS;
  const peerLastRead = meta.lastRead[peerId] ?? 0;

  return { me, messages, peerTyping, peerLastRead, loadOlder, loadingOlder, send, onChangeText };
}
