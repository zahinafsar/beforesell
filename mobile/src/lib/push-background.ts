import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

import {
  cancelIncomingCall,
  declineCallToCaller,
  displayIncomingCall,
  displayMessageNotification,
  setPendingCall,
  setPendingChat,
  type PendingCall,
} from '@/lib/push';

// Registered at module load (imported before expo-router/entry in index.js) so
// FCM/notifee events are handled even when the JS app is not mounted.

function toPendingCall(data: Record<string, string | object> | undefined): PendingCall | null {
  if (!data) return null;
  const { channel, callerId, callerName } = data as Record<string, string>;
  if (!channel || !callerId) return null;
  return { channel, callerId, callerName: callerName ?? 'Unknown', at: Date.now() };
}

// Wake-up pushes arrive here while the app is backgrounded or killed.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const data = remoteMessage.data ?? {};
  if (data.type === 'incoming_call') {
    const call = toPendingCall(data);
    if (call) {
      // Persist BEFORE showing the notification: the full-screen intent launches
      // the app, which reads this and opens straight into the incoming-call
      // screen — so it's a real call alert, not just a tappable notification.
      await setPendingCall(call);
      await displayIncomingCall(call);
    }
  } else if (data.type === 'call_cancelled') {
    await setPendingCall(null);
    await cancelIncomingCall();
  } else if (data.type === 'chat_message' && data.fromId) {
    await displayMessageNotification({
      peerId: String(data.fromId),
      peerName: String(data.fromName ?? 'Message'),
      preview: String(data.preview ?? ''),
    });
  }
});

// Notification button / press handling while the app is in the background.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const actionId = detail.pressAction?.id;
  const data = (detail.notification?.data ?? {}) as Record<string, string>;

  // Tapping a message notification: remember the chat to open after launch.
  if (type === EventType.PRESS && data.kind === 'chat' && data.peerId) {
    await setPendingChat({ peerId: data.peerId, peerName: data.peerName ?? '' });
    return;
  }

  if (type === EventType.ACTION_PRESS && actionId === 'decline') {
    // Drop the pending call so it doesn't re-ring on next launch.
    await setPendingCall(null);
    await cancelIncomingCall();
    // Signal the caller (no live RTM here) so they stop ringing too.
    if (data.callerId && data.channel) {
      await declineCallToCaller(data.callerId, data.channel);
    }
    return;
  }

  // Accept action or tapping the body launches the app; the pending call was
  // already persisted when the push arrived, so just stop the ringing here.
  if (
    (type === EventType.ACTION_PRESS && actionId === 'accept') ||
    type === EventType.PRESS
  ) {
    await cancelIncomingCall();
  }
});
