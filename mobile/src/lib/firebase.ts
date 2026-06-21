import { getApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';

// All realtime messaging state (messages, typing, presence, read receipts) lives
// in Firestore. Enable it in the Firebase console — no extra URL needed.
export const db = getFirestore(getApp());
