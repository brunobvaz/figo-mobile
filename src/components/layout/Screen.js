import useTabBarClearance from '../../hooks/useTabBarClearance';
import { useContext } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function Screen({ children, scroll = false, contentContainerStyle, style, safeAreaEdges }) {
    const clearance = useTabBarClearance();
    const tabBarHeight = useContext(BottomTabBarHeightContext);
    // Tab content extends behind the floating bar; standalone forms use the safe area.
    const edges = scroll && tabBarHeight == null ? ['top', 'bottom'] : ['top'];

    return <SafeAreaView edges={safeAreaEdges || edges} style={[styles.safe, style]}>
        {scroll ? <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, contentContainerStyle, clearance > 0 && { paddingBottom: Math.max(StyleSheet.flatten(contentContainerStyle)?.paddingBottom ?? spacing.lg, clearance) }]}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
        >
            {children}
        </ScrollView> : <View style={[styles.content, styles.fixedContent, contentContainerStyle]}>
            {children}
        </View>}
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    fixedContent: { flex: 1, minHeight: 0 },
    content: { flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.lg }
});
