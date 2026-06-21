import { useEffect, useState } from 'react';

import {
  ONLINE_TTL_MS,
  registerPresence,
  subscribePresence,
  type RawPresence,
} from '@/lib/presence';

const OFFLINE: RawPresence = { online: false, lastActive: 0 };

// Registers the current user's own presence for as long as the component is
// mounted. Call once near the root, inside the authed tree.
export function useRegisterPresence(userId?: string | null) {
  useEffect(() => {
    if (!userId) return;
    return registerPresence(userId);
  }, [userId]);
}

// Subscribes to another user's live presence, re-deriving "online" on a tick so
// a stale heartbeat (killed app) flips to offline without a new snapshot.
export function usePresence(userId?: string | null): { online: boolean } {
  const [raw, setRaw] = useState<RawPresence>(OFFLINE);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!userId) {
      setRaw(OFFLINE);
      return;
    }
    return subscribePresence(userId, setRaw);
  }, [userId]);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const online = raw.online && Date.now() - raw.lastActive < ONLINE_TTL_MS;
  return { online };
}
