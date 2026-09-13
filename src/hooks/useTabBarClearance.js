import { useContext } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Extra scroll space lets the last item move above the floating navigation.
export default function useTabBarClearance() {
  const height = useContext(BottomTabBarHeightContext);
  const insets = useSafeAreaInsets();
  return height == null ? 0 : height + Math.max(insets.bottom, 8) + 16;
}
