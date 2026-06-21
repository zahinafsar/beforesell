import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type CallButtonProps = {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  color?: string;
  active?: boolean;
};

export function CallButton({ label, Icon, onPress, color, active }: CallButtonProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityLabel={label}
        onPress={onPress}
        style={[styles.circle, { backgroundColor: color ?? (active ? '#3c87f7' : '#2a2f37') }]}>
        <Icon size={28} color="#ffffff" />
      </Pressable>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  circle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#cdd1d6', fontSize: 13 },
});
