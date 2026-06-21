import { doc, onSnapshot, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import { AppState } from 'react-native';

import { db } from '@/lib/firebase';

// A user counts as online while their status doc says so AND was refreshed
// recently — Firestore has no onDisconnect, so a killed app is detected by the
// heartbeat going stale.
export const ONLINE_TTL_MS = 45_000;
const HEARTBEAT_MS = 25_000;

export type RawPresence = { online: boolean; lastActive: number };

const statusDoc = (userId: string) => doc(db, 'status', userId);

function writeStatus(userId: string, online: boolean) {
  setDoc(statusDoc(userId), { online, lastActive: serverTimestamp() }, { merge: true }).catch(
    () => {},
  );
}

// Keeps the user's status doc fresh while signed in. Returns a cleanup that
// marks them offline.
export function registerPresence(userId: string) {
  writeStatus(userId, true);

  const interval = setInterval(() => {
    if (AppState.currentState === 'active') writeStatus(userId, true);
  }, HEARTBEAT_MS);

  const sub = AppState.addEventListener('change', (state) => {
    writeStatus(userId, state === 'active');
  });

  return () => {
    clearInterval(interval);
    sub.remove();
    writeStatus(userId, false);
  };
}

// Streams a user's raw status. Callers derive "online" with ONLINE_TTL_MS so the
// value can go stale without a new snapshot.
export function subscribePresence(userId: string, cb: (presence: RawPresence) => void) {
  return onSnapshot(statusDoc(userId), (snap) => {
    const data = snap.data();
    cb({
      online: !!data?.online,
      lastActive: data?.lastActive?.toMillis?.() ?? 0,
    });
  });
}
