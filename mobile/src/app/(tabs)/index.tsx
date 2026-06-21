import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LogOut, Phone, Search } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useConversations, type ConversationItem } from '@/hooks/use-conversations';
import { useTheme } from '@/hooks/use-theme';
import { useCall } from '@/lib/call-context';
import { useAuth } from '@/lib/auth-context';

function formatTime(ms: number | null) {
  if (!ms) return '';
  const d = new Date(ms);
  const sameDay = new Date().toDateString() === d.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function ConversationRow({ item, me }: { item: ConversationItem; me?: string }) {
  const theme = useTheme();
  const { startCall } = useCall();

  const preview = `${item.lastSenderId === me ? 'You: ' : ''}${item.lastMessage}`;
  const openChat = () =>
    router.push({ pathname: '/chat/[id]', params: { id: item.peerId, name: item.name } });

  return (
    <Pressable onPress={openChat}>
      <ThemedView type="backgroundElement" style={styles.row}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" alt={item.name} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold">{(item.name || '?').charAt(0).toUpperCase()}</ThemedText>
          </View>
        )}

        <View style={styles.rowText}>
          <View style={styles.rowTop}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
              {item.name}
            </ThemedText>
            <ThemedText type="small" themeColor={item.unread ? 'tint' : 'textSecondary'} style={styles.time}>
              {formatTime(item.lastMessageAt)}
            </ThemedText>
          </View>
          <View style={styles.rowBottom}>
            <ThemedText
              type="small"
              themeColor={item.unread ? 'text' : 'textSecondary'}
              numberOfLines={1}
              style={[styles.preview, item.unread && styles.previewUnread]}>
              {preview}
            </ThemedText>
            {item.unread && <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />}
          </View>
        </View>

        <Pressable
          accessibilityLabel={`Call ${item.name}`}
          onPress={() => startCall({ id: item.peerId, name: item.name })}
          hitSlop={8}
          style={[styles.callButton, { backgroundColor: theme.online }]}>
          <Phone size={18} color="#fff" />
        </Pressable>
      </ThemedView>
    </Pressable>
  );
}

export default function ConversationsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { conversations, search, setSearch } = useConversations();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Messages</ThemedText>
          <Pressable onPress={logout} hitSlop={8}>
            <LogOut size={22} color={theme.tint} />
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(c) => c.chatId}
          renderItem={({ item }) => <ConversationRow item={item} me={user?.id} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              {search ? 'No matches.' : 'No conversations yet.'}
            </ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
  },
  searchInput: { flex: 1, paddingVertical: Spacing.two, fontSize: 16 },
  list: { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.six },
  center: { marginTop: Spacing.five, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Spacing.three,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  name: { flex: 1 },
  time: { fontSize: 12 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  preview: { flex: 1 },
  previewUnread: { fontWeight: '600' },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  callButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
