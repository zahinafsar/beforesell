import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { subscribeConversations, type Conversation } from '@/lib/chat';
import { fetchProfile, type Profile } from '@/lib/profile';

export type ConversationItem = Conversation & { name: string; avatar: string | null };

// Recency-sorted conversation list for the home screen. Conversations stream live
// from Firestore (sorted client-side); peer name/avatar resolve from Firestore
// profiles. Search filters the loaded conversations by peer name.
export function useConversations() {
  const { user } = useAuth();
  const me = user?.id ?? null;

  const [raw, setRaw] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!me) {
      setRaw([]);
      return;
    }
    return subscribeConversations(me, setRaw);
  }, [me]);

  const sorted = useMemo(
    () => [...raw].sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0)),
    [raw],
  );

  // Resolve any peer profiles we don't have yet.
  useEffect(() => {
    const missing = Array.from(
      new Set(sorted.map((c) => c.peerId).filter((id) => id && !profiles[id])),
    );
    if (!missing.length) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(missing.map(async (id) => [id, await fetchProfile(id)] as const));
      if (cancelled) return;
      setProfiles((prev) => {
        const next = { ...prev };
        for (const [id, p] of entries) if (p) next[id] = p;
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [sorted, profiles]);

  const items: ConversationItem[] = useMemo(
    () =>
      sorted.map((c) => ({
        ...c,
        name: profiles[c.peerId]?.name ?? '…',
        avatar: profiles[c.peerId]?.avatar ?? null,
      })),
    [sorted, profiles],
  );

  const conversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [items, search]);

  return { conversations, search, setSearch };
}
