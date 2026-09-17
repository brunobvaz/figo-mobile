import useTabBarClearance from '../../hooks/useTabBarClearance';
import { useContext } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { HeaderShownContext } from '@react-navigation/elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';

export default function Screen({ children, scroll = false, contentContainerStyle, style, safeAreaEdges, maxWidth = CONTENT_MAX_WIDTH, scrollRef, onContentLayout, refreshControl }) {
    const clearance = useTabBarClearance();
    const tabBarHeight = useContext(BottomTabBarHeightContext);
    const headerShown = useContext(HeaderShownContext);
    // Tab content extends behind the floating bar; standalone forms use the safe area.
    const edges = [...(headerShown ? [] : ['top']), 'left', 'right', ...(scroll && tabBarHeight == null ? ['bottom'] : [])];

    return <SafeAreaView edges={safeAreaEdges || edges} style={[styles.safe, style]}>
        {scroll ? <ScrollView
            ref={scrollRef}
            refreshControl={refreshControl}
            style={styles.scroll}
            contentContainerStyle={[styles.content, { maxWidth }, contentContainerStyle, clearance > 0 && { paddingBottom: Math.max(StyleSheet.flatten(contentContainerStyle)?.paddingBottom ?? spacing.lg, clearance) }]}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
        >
            {children}
        </ScrollView> : <View onLayout={onContentLayout} style={[styles.content, { maxWidth }, styles.fixedContent, contentContainerStyle]}>
            {children}
        </View>}
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    fixedContent: { flex: 1, minHeight: 0 },
    content: { flexGrow: 1, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.lg }
});
