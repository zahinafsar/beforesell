# Realtime Chat — Setup (Firebase)

1:1 chat, typing indicators, online/offline presence, and seen/unseen receipts run entirely on
**Firestore**. New-message **push** is sent from our backend via `firebase-admin` (messaging data
stays in Firebase; only the wake-up FCM uses the server).

## Architecture (all Firestore)
- **Messages** → `chats/{chatId}/messages/{messageId}`; `chatId` = the two user ids sorted+joined
  (`a__b`). Live via `onSnapshot` (`src/lib/chat.ts`).
- **Typing** → `chats/{chatId}` doc, `typing.{uid}` = client timestamp; the peer is "typing" while it
  was refreshed within ~6s (no onDisconnect, so freshness is timestamp-based).
- **Read receipts (seen/unseen)** → `chats/{chatId}` doc, `lastRead.{uid}` = serverTimestamp written
  whenever the chat is open. A sent message shows **Seen** once the peer's `lastRead` ≥ its time.
- **Presence (online/offline)** → `status/{userId}` doc = `{ online, lastActive }`, refreshed by a
  heartbeat while foregrounded; a user is online while `online` is true AND `lastActive` is fresh
  (`ONLINE_TTL_MS`). `src/lib/presence.ts`, registered in `_layout.tsx`.
- **New-message push** → client writes to Firestore, then `POST /api/chat/notify` → backend sends an
  FCM `chat_message` data push → `src/lib/push-background.ts` raises a notifee notification
  (suppressed if you're already viewing that chat — `src/lib/active-chat.ts`).

## One-time Firebase console setup (project `beforesell-33ba5`)
1. **Firestore**: Build → Firestore Database → Create database.
   - No composite index needed: the conversation list filters by `participants` (array-contains, an
     auto-created single-field index) and sorts client-side. A conversation appears once a message is
     sent in it (that's when `participants`/`lastMessageAt` get stamped on the chat doc).
2. **Test rules** (DEV ONLY — lock down before production; we are not using Firebase Auth yet):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents { match /{document=**} { allow read, write: if true; } }
   }
   ```

> Realtime Database is **not** used anymore — everything is Firestore.

## Backend env
`FIREBASE_SERVICE_ACCOUNT` (already set for calling) is reused to send message pushes.

## Notes
- Requires a dev build (native Firestore/RTDB modules) — already included in the APK build.
- Lucide icons (`lucide-react-native`) are used across the in-app UI; native tab-bar icons remain images.
