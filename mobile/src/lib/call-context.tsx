import { ClientRoleType, type IRtcEngineEventHandler } from 'react-native-agora';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  cancelIncomingCall,
  getPendingCall,
  registerPushToken,
  setPendingCall,
} from '@/lib/push';
import {
  fetchAgoraToken,
  getRtcEngine,
  getRtmClient,
  isAgoraConfigured,
  releaseRtcEngine,
  rtmLogin,
  rtmLogout,
  rtmSendToUser,
} from '@/lib/agora';

export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'active';
export type CallPeer = { id: string; name: string };

type SignalType = 'invite' | 'accept' | 'decline' | 'cancel' | 'end';
type Signal = { type: SignalType; channel?: string; fromName?: string };

type CallContextValue = {
  status: CallStatus;
  peer: CallPeer | null;
  muted: boolean;
  speaker: boolean;
  seconds: number;
  startCall: (peer: CallPeer) => Promise<void>;
  accept: () => Promise<void>;
  decline: () => void;
  hangup: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
};

const CallContext = createContext<CallContextValue | null>(null);

async function ensureMicPermission() {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function CallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [status, setStatus] = useState<CallStatus>('idle');
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Refs so the long-lived RTM/RTC handlers always see current values.
  const channelRef = useRef<string | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const statusRef = useRef<CallStatus>('idle');
  statusRef.current = status;
  peerRef.current = peer;

  const reset = useCallback(() => {
    // Stop any ringing notification and drop the pending call on every exit.
    cancelIncomingCall();
    setPendingCall(null);
    channelRef.current = null;
    setPeer(null);
    setMuted(false);
    setSpeaker(true);
    setSeconds(0);
    setStatus('idle');
  }, []);

  const leaveRtc = useCallback(() => {
    try {
      getRtcEngine().leaveChannel();
    } catch {
      // engine may not have joined
    }
  }, []);

  const joinRtc = useCallback(async (channel: string) => {
    const granted = await ensureMicPermission();
    if (!granted) throw new Error('Microphone permission denied');
    const { rtcToken } = await fetchAgoraToken(channel);
    const engine = getRtcEngine();
    // Communication profile routes to the earpiece by default; honour the
    // speaker-on default so audio is actually audible. Must be set before join.
    engine.setDefaultAudioRouteToSpeakerphone(true);
    engine.joinChannel(rtcToken ?? '', channel, 0, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      publishMicrophoneTrack: true,
      autoSubscribeAudio: true,
    });
    engine.setEnableSpeakerphone(true);
  }, []);

  // ----- outgoing -----
  const startCall = useCallback(
    async (target: CallPeer) => {
      if (!user || statusRef.current !== 'idle') return;
      const channel = `call_${user.id}_${Date.now()}`;
      channelRef.current = channel;
      setPeer(target);
      setStatus('outgoing');
      // Offline wake-up push — fired independently of RTM so the callee rings
      // even when their app is killed (RTM publish would fail for offline peers).
      api('/api/agora/notify', {
        method: 'POST',
        body: { to: target.id, channel, type: 'invite' },
      }).catch(() => {});
      try {
        await rtmSendToUser(target.id, {
          type: 'invite',
          channel,
          fromName: user.name,
        } satisfies Signal);
      } catch {
        // Callee offline — the push above still rings them; stay in 'outgoing'
        // and wait for their 'accept' once they open the app.
      }
    },
    [user],
  );

  // ----- callee accepts -----
  const accept = useCallback(async () => {
    const channel = channelRef.current;
    const target = peerRef.current;
    if (!channel || !target) return;
    // Silence the ringing notification the moment the user answers.
    cancelIncomingCall();
    setPendingCall(null);
    try {
      await joinRtc(channel);
      await rtmSendToUser(target.id, { type: 'accept', channel } satisfies Signal);
      setStatus('active');
    } catch {
      try {
        await rtmSendToUser(target.id, { type: 'decline' } satisfies Signal);
      } catch {
        // ignore
      }
      reset();
    }
  }, [joinRtc, reset]);

  const decline = useCallback(() => {
    const target = peerRef.current;
    if (target) rtmSendToUser(target.id, { type: 'decline' }).catch(() => {});
    reset();
  }, [reset]);

  const hangup = useCallback(() => {
    const target = peerRef.current;
    const wasActive = statusRef.current === 'active';
    const wasOutgoing = statusRef.current === 'outgoing';
    if (target) {
      rtmSendToUser(target.id, { type: wasActive ? 'end' : 'cancel' }).catch(() => {});
      // Dismiss the ringing notification on an offline callee we were calling.
      if (wasOutgoing && channelRef.current) {
        api('/api/agora/notify', {
          method: 'POST',
          body: { to: target.id, channel: channelRef.current, type: 'cancel' },
        }).catch(() => {});
      }
    }
    if (wasActive) leaveRtc();
    reset();
  }, [leaveRtc, reset]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      getRtcEngine().muteLocalAudioStream(next);
      return next;
    });
  }, []);

  const toggleSpeaker = useCallback(() => {
    setSpeaker((s) => {
      const next = !s;
      getRtcEngine().setEnableSpeakerphone(next);
      return next;
    });
  }, []);

  // ----- inbound RTM signaling -----
  const handleSignal = useCallback(
    (fromUserId: string, signal: Signal) => {
      switch (signal.type) {
        case 'invite': {
          if (statusRef.current !== 'idle') {
            // Busy — auto-decline.
            rtmSendToUser(fromUserId, { type: 'decline' }).catch(() => {});
            return;
          }
          channelRef.current = signal.channel ?? null;
          setPeer({ id: fromUserId, name: signal.fromName ?? 'Unknown' });
          setStatus('incoming');
          break;
        }
        case 'accept': {
          if (statusRef.current === 'outgoing' && channelRef.current) {
            joinRtc(channelRef.current)
              .then(() => setStatus('active'))
              .catch(() => hangup());
          }
          break;
        }
        case 'decline':
        case 'cancel':
        case 'end': {
          if (statusRef.current === 'active') leaveRtc();
          reset();
          break;
        }
      }
    },
    [joinRtc, hangup, leaveRtc, reset],
  );

  // RTM login + message listener tied to auth.
  useEffect(() => {
    if (!user || !isAgoraConfigured) return;
    let cancelled = false;

    // Caller-side foreground push: the callee declined/cancelled from a
    // notification (no RTM on their end), so end our outgoing call here.
    const unsubscribeFcm = messaging().onMessage((msg) => {
      const data = msg.data ?? {};
      if (
        (data.type === 'call_declined' || data.type === 'call_cancelled') &&
        data.channel === channelRef.current &&
        statusRef.current !== 'idle'
      ) {
        if (statusRef.current === 'active') leaveRtc();
        reset();
      }
    });

    const onMessage = (event: { message?: string | Uint8Array; publisher?: string }) => {
      try {
        const raw =
          typeof event.message === 'string'
            ? event.message
            : new TextDecoder().decode(event.message);
        const signal = JSON.parse(raw) as Signal;
        if (event.publisher) handleSignal(event.publisher, signal);
      } catch {
        // not a call signal — ignore
      }
    };

    rtmLogin(user.id)
      .then(async (client) => {
        if (cancelled) return;
        client.addEventListener('message', onMessage);
        // Register this device for offline incoming-call pushes.
        registerPushToken();
        // If the app was launched from an incoming-call notification, route into
        // the incoming-call screen so the existing accept/decline flow takes over.
        const pending = await getPendingCall();
        if (pending && !cancelled && statusRef.current === 'idle') {
          await setPendingCall(null);
          channelRef.current = pending.channel;
          setPeer({ id: pending.callerId, name: pending.callerName });
          setStatus('incoming');
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribeFcm();
      getRtmClient()?.removeEventListener('message', onMessage);
      rtmLogout();
    };
  }, [user, handleSignal, leaveRtc, reset]);

  // Release the RTC engine when the provider unmounts.
  useEffect(() => () => releaseRtcEngine(), []);

  // Give up an unanswered outgoing call after 45s (matches the ring timeout).
  useEffect(() => {
    if (status !== 'outgoing') return;
    const id = setTimeout(() => {
      if (statusRef.current === 'outgoing') hangup();
    }, 45000);
    return () => clearTimeout(id);
  }, [status, hangup]);

  // Active-call duration timer.
  useEffect(() => {
    if (status !== 'active') return;
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  return (
    <CallContext.Provider
      value={{
        status,
        peer,
        muted,
        speaker,
        seconds,
        startCall,
        accept,
        decline,
        hangup,
        toggleMute,
        toggleSpeaker,
      }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
}
