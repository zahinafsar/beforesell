import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import * as SecureStore from 'expo-secure-store';

import { api } from '@/lib/api';

const PENDING_CALL_KEY = 'pending-call';
const PENDING_CHAT_KEY = 'pending-chat';
// NOTE: Android notification channels are immutable after creation — changing a
// channel's sound/importance requires a NEW id. Bump this suffix when the
// channel config (e.g. ringtone) changes.
const CALL_CHANNEL_ID = 'incoming-call-ring-v2';
const MESSAGE_CHANNEL_ID = 'messages';
const INCOMING_NOTIFICATION_ID = 'incoming-call';
// Ignore a stored incoming call older than this (unanswered ring that expired).
const PENDING_CALL_TTL_MS = 60_000;

export type PendingCall = {
  channel: string;
  callerId: string;
  callerName: string;
  /** Epoch ms the ring started — used to drop stale, expired rings on launch. */
  at: number;
};

// The incoming call to route into on launch. Set as soon as the wake-up push
// arrives so the full-screen intent opens straight into the in-app call screen.
export async function setPendingCall(call: PendingCall | null) {
  if (call) {
    await SecureStore.setItemAsync(PENDING_CALL_KEY, JSON.stringify(call));
  } else {
    await SecureStore.deleteItemAsync(PENDING_CALL_KEY);
  }
}

export async function getPendingCall(): Promise<PendingCall | null> {
  const raw = await SecureStore.getItemAsync(PENDING_CALL_KEY);
  if (!raw) return null;
  try {
    const call = JSON.parse(raw) as PendingCall;
    if (!call.at || Date.now() - call.at > PENDING_CALL_TTL_MS) {
      await setPendingCall(null);
      return null;
    }
    return call;
  } catch {
    return null;
  }
}

async function ensureCallChannel() {
  // Remove the obsolete default-sound channel from earlier builds.
  await notifee.deleteChannel('calls').catch(() => {});
  return notifee.createChannel({
    id: CALL_CHANNEL_ID,
    name: 'Incoming Calls',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    // Bundled ringtone (android/app/src/main/res/raw/ringtone.mp3); falls back to
    // the default sound if the resource is missing.
    sound: 'ringtone',
    vibration: true,
    vibrationPattern: [500, 1000, 500, 1000],
    bypassDnd: true,
  });
}

// Raises a full-screen, continuously-ringing incoming-call notification that
// shows over the lock screen — the system call alert, not a passive heads-up.
export async function displayIncomingCall(call: PendingCall) {
  await ensureCallChannel();
  await notifee.displayNotification({
    id: INCOMING_NOTIFICATION_ID,
    title: 'Incoming call',
    body: `${call.callerName} is calling…`,
    data: { channel: call.channel, callerId: call.callerId, callerName: call.callerName },
    android: {
      channelId: CALL_CHANNEL_ID,
      category: AndroidCategory.CALL,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      ongoing: true,
      autoCancel: false,
      // Keep ringing until answered/declined, and wake the screen.
      loopSound: true,
      lightUpScreen: true,
      vibrationPattern: [500, 1000, 500, 1000],
      // Launches the app over the lock screen when the device is asleep/killed.
      fullScreenAction: { id: 'default', launchActivity: 'default' },
      pressAction: { id: 'default', launchActivity: 'default' },
      actions: [
        { title: 'Decline', pressAction: { id: 'decline' } },
        { title: 'Accept', pressAction: { id: 'accept', launchActivity: 'default' } },
      ],
      timeoutAfter: 45000,
    },
  });
}

export async function cancelIncomingCall() {
  await notifee.cancelNotification(INCOMING_NOTIFICATION_ID);
}

// Tells the caller the call was declined. Used from the background notification
// handler where there is no live RTM connection to signal over.
export async function declineCallToCaller(callerId: string, channel: string) {
  try {
    await api('/api/agora/notify', {
      method: 'POST',
      body: { to: callerId, channel, type: 'decline' },
    });
  } catch {
    // best effort — caller will also time out
  }
}

// ----- new-message notifications -----
export type ChatNotification = { peerId: string; peerName: string; preview: string };

async function ensureMessageChannel() {
  return notifee.createChannel({
    id: MESSAGE_CHANNEL_ID,
    name: 'Messages',
    importance: AndroidImportance.HIGH,
  });
}

// Shows a tappable new-message notification (one per sender).
export async function displayMessageNotification(n: ChatNotification) {
  await ensureMessageChannel();
  await notifee.displayNotification({
    id: `msg-${n.peerId}`,
    title: n.peerName,
    body: n.preview,
    data: { kind: 'chat', peerId: n.peerId, peerName: n.peerName },
    android: {
      channelId: MESSAGE_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'open-chat', launchActivity: 'default' },
    },
  });
}

// A chat to open after the app launches from a message notification.
export async function setPendingChat(chat: { peerId: string; peerName: string } | null) {
  if (chat) {
    await SecureStore.setItemAsync(PENDING_CHAT_KEY, JSON.stringify(chat));
  } else {
    await SecureStore.deleteItemAsync(PENDING_CHAT_KEY);
  }
}

export async function getPendingChat(): Promise<{ peerId: string; peerName: string } | null> {
  const raw = await SecureStore.getItemAsync(PENDING_CHAT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Requests notification permission, fetches the FCM token and registers it with
// the backend so the server can push incoming-call wake-ups to this device.
export async function registerPushToken() {
  try {
    await notifee.requestPermission();
    await messaging().requestPermission();
    const token = await messaging().getToken();
    await api('/api/users/push-token', { method: 'POST', body: { token } });
  } catch {
    // Push registration is best-effort; online calling still works without it.
  }
}

export async function unregisterPushToken() {
  try {
    await api('/api/users/push-token', { method: 'POST', body: { token: null } });
    await messaging().deleteToken();
  } catch {
    // ignore — best effort on logout
  }
}
