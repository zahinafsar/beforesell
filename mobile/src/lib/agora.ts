import {
  ChannelProfileType,
  createAgoraRtcEngine,
  type IRtcEngine,
} from 'react-native-agora';
import {
  createAgoraRtmClient,
  RtmChannelType,
  type RTMClient,
} from 'agora-react-native-rtm';

import { api } from '@/lib/api';

export const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID ?? '';
export const isAgoraConfigured = AGORA_APP_ID.length > 0;

export type AgoraTokenResponse = {
  appId: string;
  uid: number;
  channel: string | null;
  rtcToken: string | null;
  rtmToken: string;
};

/** Fetches RTM (+ RTC when `channel` is given) tokens from the backend. */
export function fetchAgoraToken(channel?: string) {
  return api<AgoraTokenResponse>('/api/agora/token', {
    method: 'POST',
    body: { channel },
  });
}

// ----- RTC (media) -----
let rtcEngine: IRtcEngine | null = null;

export function getRtcEngine(): IRtcEngine {
  if (!rtcEngine) {
    const engine = createAgoraRtcEngine();
    engine.initialize({ appId: AGORA_APP_ID });
    engine.enableAudio();
    engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
    rtcEngine = engine;
  }
  return rtcEngine;
}

export function releaseRtcEngine() {
  if (rtcEngine) {
    rtcEngine.release();
    rtcEngine = null;
  }
}

// ----- RTM (signaling) -----
let rtmClient: RTMClient | null = null;
let rtmUserId: string | null = null;

/** Logs the user into Agora RTM. Recreates the client if the user changed. */
export async function rtmLogin(userId: string): Promise<RTMClient> {
  if (rtmClient && rtmUserId !== userId) {
    await rtmLogout();
  }
  if (!rtmClient) {
    rtmClient = createAgoraRtmClient({ appId: AGORA_APP_ID, userId });
    rtmUserId = userId;
  }
  const { rtmToken } = await fetchAgoraToken();
  await rtmClient.login({ token: rtmToken });
  return rtmClient;
}

export function getRtmClient(): RTMClient | null {
  return rtmClient;
}

export async function rtmLogout() {
  if (!rtmClient) return;
  try {
    await rtmClient.logout();
    rtmClient.release();
  } catch {
    // ignore — best effort on teardown
  }
  rtmClient = null;
  rtmUserId = null;
}

/** Sends a peer (user-channel) RTM message to a specific user id. */
export async function rtmSendToUser(peerUserId: string, payload: object) {
  if (!rtmClient) throw new Error('RTM not logged in');
  await rtmClient.publish(peerUserId, JSON.stringify(payload), {
    channelType: RtmChannelType.user,
  });
}
