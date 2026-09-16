import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const FeedbackContext = createContext(null);
export const useFeedback = () => useContext(FeedbackContext);

export function FeedbackProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  const dismiss = useCallback(() => { clearTimeout(timer.current); setMessage(''); }, []);
  const notify = useCallback(text => {
    clearTimeout(timer.current);
    setMessage(text);
    AccessibilityInfo.announceForAccessibility(text);
    timer.current = setTimeout(() => setMessage(''), 6000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <FeedbackContext.Provider value={notify}>
    <View style={styles.container}>
      {children}
      {message ? <View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + 8, left: insets.left + 16, right: insets.right + 16 }]}>
        <View style={styles.notice}>
          <Ionicons accessible={false} name="checkmark-circle-outline" size={24} color={colors.primaryDark} />
          <Text style={styles.message}>{message}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar confirmação" onPress={dismiss} style={styles.close}>
            <Ionicons accessible={false} name="close" size={22} color={colors.textMuted} />
          </Pressable>
        </View>
      </View> : null}
    </View>
  </FeedbackContext.Provider>;
}
const styles = StyleSheet.create({
  container: { flex: 1 }, overlay: { position: 'absolute', zIndex: 100, alignItems: 'center' },
  notice: { width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16, paddingRight: 4, paddingVertical: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primaryLight, borderRadius: 16, shadowColor: '#25302A', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  message: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 22 }, close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }
});
