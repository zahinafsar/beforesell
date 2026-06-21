import { doc, getDoc, onSnapshot, setDoc } from '@react-native-firebase/firestore';

import { db } from '@/lib/firebase';
import type { AuthUser } from '@/lib/auth-context';

export type Profile = { name: string; avatar: string | null };

const profileDoc = (uid: string) => doc(db, 'profiles', uid);

// Mirrors the signed-in user's display info to Firestore so other users'
// conversation lists can render name+avatar without calling the backend.
export async function syncProfile(user: AuthUser) {
  await setDoc(
    profileDoc(user.id),
    { name: user.name, avatar: user.avatar ?? null },
    { merge: true },
  ).catch(() => {});
}

export async function fetchProfile(uid: string): Promise<Profile | null> {
  try {
    const snap = await getDoc(profileDoc(uid));
    const data = snap.data();
    if (!data) return null;
    return { name: (data.name ?? '') as string, avatar: (data.avatar ?? null) as string | null };
  } catch {
    return null;
  }
}

export function subscribeProfile(uid: string, cb: (profile: Profile | null) => void) {
  return onSnapshot(profileDoc(uid), (snap) => {
    const data = snap.data();
    cb(data ? { name: (data.name ?? '') as string, avatar: (data.avatar ?? null) as string | null } : null);
  });
}
