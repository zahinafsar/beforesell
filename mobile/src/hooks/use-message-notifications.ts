import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { getActiveChat } from '@/lib/active-chat';
import { displayMessageNotification } from '@/lib/push';

function openChat(peerId?: string, peerName?: string) {
  if (!peerId) return;
  router.push({ pathname: '/chat/[id]', params: { id: peerId, name: peerName ?? '' } });
}

// Foreground new-message handling: show a heads-up for messages from other chats
// and route to the conversation when a message notification is tapped.
export function useMessageNotifications() {
  useEffect(() => {
    const unsubMessage = messaging().onMessage((msg) => {
      const data = msg.data ?? {};
      if (data.type !== 'chat_message') return;
      const peerId = String(data.fromId ?? '');
      if (!peerId || getActiveChat() === peerId) return; // already viewing this chat
      displayMessageNotification({
        peerId,
        peerName: String(data.fromName ?? 'Message'),
        preview: String(data.preview ?? ''),
      });
    });

    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data?.kind === 'chat') {
        const data = detail.notification.data as { peerId?: string; peerName?: string };
        openChat(data.peerId, data.peerName);
      }
    });

    return () => {
      unsubMessage();
      unsubNotifee();
    };
  }, []);
}
