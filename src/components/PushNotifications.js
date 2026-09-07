import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { getNotifications, registerPushNotifications, setPushUser } from '../services/pushNotifications';
import { navigationRef } from '../navigation/navigationRef';
import { useChat } from '../context/ChatContext';
import useAuth from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { ROUTES } from '../navigation/routes';

export default function PushNotifications() {
  const { user } = useAuth();
  const { refresh, unreadTotal } = useChat();
  const pending = useRef(null);
  useEffect(() => {
    const notifications = getNotifications();
    if (!notifications) return;
    let active = true;
    let opening = false;
    let lastHandled = null;
    setPushUser(user.id);
    const register = () => registerPushNotifications().catch(() => {});
    register();
    const openPending = async () => {
      const response = pending.current;
      if (!active || opening || !response || !navigationRef.isReady()) return;
      const data = response.notification.request.content.data;
      if (response.notification.request.identifier === lastHandled) return;
      if (data?.type !== 'chat.message' || data.recipientId !== user.id || !/^[a-f0-9]{24}$/i.test(data.conversationId || '')) {
        pending.current = null;
        notifications.clearLastNotificationResponseAsync().catch(() => {});
        return;
      }
      opening = true;
      try {
        const conversation = await chatService.detail(data.conversationId);
        if (!active) return;
        navigationRef.navigate(ROUTES.CHAT, { conversationId: conversation.id, participantName: conversation.participant.name, productId: conversation.productId, productTitle: conversation.productTitle });
        lastHandled = response.notification.request.identifier;
        pending.current = null;
        await notifications.clearLastNotificationResponseAsync();
        refresh();
      } catch (error) {
        if (error.status === 404 || error.status === 403) { pending.current = null; notifications.clearLastNotificationResponseAsync().catch(() => {}); }
      } finally { opening = false; }
    };
    notifications.getLastNotificationResponseAsync().then((response) => { if (active && response) { pending.current = response; openPending(); } }).catch(() => {});
    const responseListener = notifications.addNotificationResponseReceivedListener((response) => { pending.current = response; openPending(); });
    const received = notifications.addNotificationReceivedListener((notification) => { if (notification.request.content.data?.recipientId === user.id) refresh(); });
    const tokenListener = notifications.addPushTokenListener(register);
    const appListener = AppState.addEventListener('change', (state) => { if (state === 'active') { register(); openPending(); } });
    const timer = setInterval(() => { if (AppState.currentState === 'active') openPending(); }, 2000);
    return () => { active = false; setPushUser(null); clearInterval(timer); responseListener.remove(); received.remove(); tokenListener.remove(); appListener.remove(); };
  }, [user.id, refresh]);
  useEffect(() => { getNotifications()?.setBadgeCountAsync(unreadTotal).catch(() => {}); }, [unreadTotal]);
  return null;
}
