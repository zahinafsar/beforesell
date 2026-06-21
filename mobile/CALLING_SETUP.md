# Audio Calling — Setup (Agora RTC + RTM Signaling + Offline Push)

Calling uses **Agora**: `react-native-agora` (RTC media) + `agora-react-native-rtm` (Signaling for
invitations). Native modules → **Expo Go will not work**; you need a **development build**.

## Architecture
- **Backend** `POST /api/agora/token` issues RTM + RTC tokens (from `AGORA_APP_ID` + `AGORA_APP_CERTIFICATE`).
- **Sign-in**: on auth, the app logs into RTM as its user id (`src/lib/call-context.tsx`).
- **Invite**: caller publishes a JSON `invite` to the callee's user channel over RTM. Accept/decline/end
  flow back the same way. On accept, both join the same RTC channel (uid 0) and talk.
- **Offline ringing (Android)**: the installed `agora-react-native-rtm` wrapper exposes no offline-push
  API, so we don't use Agora Console push. Instead the caller hits `POST /api/agora/notify`, the backend
  sends a **high-priority data-only FCM** (via `firebase-admin`) to the callee's stored `fcmToken`, and the
  app's background handler raises a **notifee full-screen-intent** notification that rings over the lock
  screen. Accepting routes back into the normal RTM/RTC flow.

## 1. Environment variables
Mobile `mobile/.env.local`:
- `EXPO_PUBLIC_API_URL` — API base (LAN IP for device testing, e.g. `http://192.168.1.5:3000`).
- `EXPO_PUBLIC_AGORA_APP_ID` — Agora App ID.

Backend (`/.env`):
- `AGORA_APP_ID` — same App ID.
- `AGORA_APP_CERTIFICATE` — Agora **App Certificate** (server-only; never ship in the app).

## 2. Agora Console (https://console.agora.io)
- Create a project; enable the **App Certificate** (required for tokens).
- Enable **Signaling (RTM)** for the project.
- For offline ringing, open **Signaling → Push Notifications** and add:
  - **Android**: your Firebase **FCM credentials** (server key / service account).
  - **iOS**: an **APNs VoIP certificate** (or auth key) for bundle id `com.beforesell.app`.

## 3. Firebase (Android push)
- Create a Firebase project, add an Android app with package `com.beforesell.app`.
- Download `google-services.json` → `mobile/google-services.json` (referenced by `app.json`).
  > `expo prebuild` / EAS build fails until this file exists.

## 4. Build & run (in-app calling works after this)
```bash
npx expo prebuild                                      # generates android/ + ios/ (autolinks Agora)
eas build --profile development --platform android     # or ios
npx expo start --dev-client
```
At this point **online** calling works end-to-end: tap a user → they get the incoming-call screen → accept
→ audio. (Both apps must be open.)

## 5. Offline ringing

### Android — implemented (own-backend FCM + notifee)
Wake-up flow when the callee's app is killed/backgrounded:
1. Caller `startCall()` (`src/lib/call-context.tsx`) fires `POST /api/agora/notify` alongside the RTM invite.
2. Backend (`app/api/agora/notify/route.ts` → `lib/fcm.ts`) sends a **data-only high-priority FCM** to the
   callee's `fcmToken` (saved via `POST /api/users/push-token`).
3. The app's background handler (`src/lib/push-background.ts`, imported first in `index.js`) raises a
   **notifee full-screen-intent** notification (`src/lib/push.ts`) that rings over the lock screen.
4. Tapping/Accept persists a pending call to SecureStore and launches the app; `call-context` reads it after
   RTM login and routes into the `incoming` state so the existing `CallOverlay` takes over → join RTC.

**Required config**: backend env `FIREBASE_SERVICE_ACCOUNT` (service-account JSON, one line); mobile
`google-services.json` (already present). The `@react-native-firebase/app` + `messaging` config plugins and
`USE_FULL_SCREEN_INTENT` permission are in `app.json`.

### iOS — not yet wired
Needs **PushKit VoIP** + **CallKit** via `react-native-callkeep` + `react-native-voip-push-notification`
(Apple requires every VoIP push to immediately report a call to CallKit) plus an Apple Developer account
(VoIP push certificate + entitlement).

## Testing
Use **two physical devices** (simulators lack mic + VoIP push). Register/login on both → each appears in the
other's list → tap 📞 → callee rings → accept → talk, mute, speaker, hang up. For offline: complete §5,
then kill the callee app and call again.
