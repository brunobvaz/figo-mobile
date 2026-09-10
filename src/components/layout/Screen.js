import { useContext } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function Screen({ children, scroll = false, contentContainerStyle, style }) {
    const tabBarHeight = useContext(BottomTabBarHeightContext);
    // Tab screens already reserve the bottom bar; standalone forms need the safe area.
    const edges = scroll && tabBarHeight == null ? ['top', 'bottom'] : ['top'];

    return <SafeAreaView edges={edges} style={[styles.safe, style]}>
        {scroll ? <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
        >
            {children}
        </ScrollView> : <View style={[styles.content, contentContainerStyle]}>
            {children}
        </View>}
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.lg }
});
