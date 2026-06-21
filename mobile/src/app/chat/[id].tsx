import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useChat } from '@/hooks/use-chat';
import { usePresence } from '@/hooks/use-presence';
import { useTheme } from '@/hooks/use-theme';
import { setActiveChat } from '@/lib/active-chat';
import type { ChatMessage } from '@/lib/chat';

function formatTime(ms: number | null) {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const peerName = name ?? 'Chat';

  const { me, messages, peerTyping, peerLastRead, loadOlder, loadingOlder, send, onChangeText } =
    useChat(id);
  const { online } = usePresence(id);
  const [draft, setDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      setActiveChat(id);
      return () => setActiveChat(null);
    }, [id]),
  );

  // Inverted list renders newest-first; keep a reversed copy.
  const inverted = useMemo(() => [...messages].reverse(), [messages]);
  const lastMineId = useMemo(() => inverted.find((m) => m.senderId === me)?.id, [inverted, me]);

  const handleChange = (text: string) => {
    setDraft(text);
    onChangeText(text);
  };

  const handleSend = () => {
    const text = draft;
    setDraft('');
    send(text);
  };

  const status = peerTyping ? 'typing…' : online ? 'Online' : 'Offline';

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const mine = item.senderId === me;
    const showReceipt = mine && item.id === lastMineId;
    const seen = item.createdAt != null && peerLastRead >= item.createdAt;
    return (
      <View style={[styles.messageWrap, mine ? styles.alignEnd : styles.alignStart]}>
        <View
          style={[
            styles.bubble,
            mine
              ? { backgroundColor: theme.tint, borderBottomRightRadius: 4 }
              : { backgroundColor: theme.bubbleIn, borderBottomLeftRadius: 4 },
          ]}>
          <ThemedText type="small" style={mine ? styles.mineText : undefined}>
            {item.text}
          </ThemedText>
        </View>
        <View style={styles.metaRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.metaText}>
            {formatTime(item.createdAt)}
          </ThemedText>
          {showReceipt && (
            <ThemedText type="small" themeColor={seen ? 'tint' : 'textSecondary'} style={styles.metaText}>
              {seen ? 'Seen' : 'Sent'}
            </ThemedText>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.backgroundElement }]}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <View style={[styles.headerAvatar, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold">{peerName.charAt(0).toUpperCase()}</ThemedText>
            {online && (
              <View style={[styles.headerDot, { backgroundColor: theme.online, borderColor: theme.background }]} />
            )}
          </View>
          <View style={styles.headerText}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {peerName}
            </ThemedText>
            <ThemedText type="small" themeColor={peerTyping || online ? 'tint' : 'textSecondary'}>
              {status}
            </ThemedText>
          </View>
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          {/* Conversation surface — subtly different colour from header/input. */}
          <View style={[styles.body, { backgroundColor: theme.chatSurface }]}>
            <FlatList
              data={inverted}
              inverted
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              keyboardDismissMode="interactive"
              onEndReached={loadOlder}
              onEndReachedThreshold={0.3}
              ListFooterComponent={loadingOlder ? <ActivityIndicator style={styles.loadingOlder} /> : null}
            />

            {messages.length === 0 && (
              <View style={styles.emptyOverlay} pointerEvents="none">
                <ThemedText type="small" themeColor="textSecondary">
                  Say hello 👋
                </ThemedText>
              </View>
            )}

            {peerTyping && (
              <View style={styles.typingRow}>
                <View style={[styles.typingBubble, { backgroundColor: theme.bubbleIn }]}>
                  <ThemedText type="small" themeColor="textSecondary">
                    typing…
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.background,
                borderTopColor: theme.backgroundElement,
                paddingBottom: Math.max(insets.bottom, Spacing.two),
              },
            ]}>
            <TextInput
              value={draft}
              onChangeText={handleChange}
              placeholder="Message"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={!draft.trim()}
              style={[styles.sendButton, { backgroundColor: theme.tint, opacity: draft.trim() ? 1 : 0.4 }]}>
              <Send size={20} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  body: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  headerText: { flex: 1, gap: 2 },
  list: { padding: Spacing.three, gap: Spacing.one },
  loadingOlder: { paddingVertical: Spacing.three, transform: [{ scaleY: -1 }] },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingRow: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  messageWrap: { maxWidth: '82%', gap: 2 },
  alignEnd: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  alignStart: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.three },
  mineText: { color: '#fff' },
  metaRow: { flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.one },
  metaText: { fontSize: 11 },
  typingBubble: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderBottomLeftRadius: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
    fontSize: 16,
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
