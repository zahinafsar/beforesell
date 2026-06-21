import { Mic, MicOff, Phone, PhoneOff, Volume1, Volume2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCall } from '@/lib/call-context';
import { CallButton } from '@/components/call-button';

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function CallOverlay() {
  const { status, peer, muted, speaker, seconds, accept, decline, hangup, toggleMute, toggleSpeaker } =
    useCall();

  if (status === 'idle' || !peer) return null;

  const subtitle =
    status === 'incoming'
      ? 'Incoming call'
      : status === 'outgoing'
        ? 'Calling…'
        : formatDuration(seconds);

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{peer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{peer.name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {status === 'active' && (
          <View style={styles.controls}>
            <CallButton
              label={muted ? 'Unmute' : 'Mute'}
              Icon={muted ? MicOff : Mic}
              onPress={toggleMute}
              active={muted}
            />
            <CallButton
              label={speaker ? 'Speaker' : 'Earpiece'}
              Icon={speaker ? Volume2 : Volume1}
              onPress={toggleSpeaker}
              active={speaker}
            />
          </View>
        )}

        <View style={styles.actions}>
          {status === 'incoming' ? (
            <>
              <CallButton label="Decline" Icon={PhoneOff} color="#e5484d" onPress={decline} />
              <CallButton label="Accept" Icon={Phone} color="#30a46c" onPress={accept} />
            </>
          ) : (
            <CallButton label="End" Icon={PhoneOff} color="#e5484d" onPress={hangup} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111418',
    zIndex: 1000,
  },
  safe: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 48 },
  header: { alignItems: 'center', gap: 12, marginTop: 64 },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#2a2f37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 44, fontWeight: '600' },
  name: { color: '#ffffff', fontSize: 28, fontWeight: '600' },
  subtitle: { color: '#9aa0a6', fontSize: 16 },
  controls: { flexDirection: 'row', gap: 32 },
  actions: { flexDirection: 'row', gap: 48 },
});
