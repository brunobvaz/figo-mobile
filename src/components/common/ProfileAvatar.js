import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';

export default function ProfileAvatar({ uri, name = '', size = 88 }) {
  const [visible, setVisible] = useState(false);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const expandedSize = Math.max(80, Math.min(width - 40, height - insets.top - insets.bottom - 160, 560));
  const close = () => setVisible(false);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Ampliar fotografia de ${name}`} onPress={() => setVisible(true)}>
      <Avatar uri={uri} name={name} size={size} />
    </Pressable>
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={close} supportedOrientations={['portrait', 'landscape']}>
      <View style={styles.page} accessibilityViewIsModal onAccessibilityEscape={close}>
        <View style={[styles.content, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 64 }]}>
          <Avatar uri={uri} name={name} size={expandedSize} />
          <Text style={styles.name}>{name}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar fotografia" onPress={close} style={[styles.close, { top: insets.top + 12, right: insets.right + 16 }]}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#161219' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 20 },
  name: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  close: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: '#352D3B', alignItems: 'center', justifyContent: 'center' },
});
