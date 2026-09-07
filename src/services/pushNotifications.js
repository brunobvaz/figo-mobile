import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';
import { navigationRef } from '../navigation/navigationRef';

let notifications;
let userId = null;
let generation = 0;
let registeredToken = null;
let operation = Promise.resolve();
export function getNotifications() {
  if (Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient') return null;
  if (!notifications) {
    try { notifications = require('expo-notifications'); }
    catch { return null; }
  }
  return notifications;
}
const native = getNotifications();
native?.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const current = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
    const sameConversation = AppState.currentState === 'active' && current?.name === 'Chat' && current.params?.conversationId === data?.conversationId;
    const show = Boolean(userId && data?.recipientId === userId && !sameConversation);
    return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: show, shouldSetBadge: false };
  }
});

export function setPushUser(id) { userId = id; generation += 1; }
export function clearPushUser() {
  setPushUser(null);
  const module = getNotifications();
  module?.setBadgeCountAsync(0).catch(() => {});
  module?.dismissAllNotificationsAsync().catch(() => {});
}
export async function registerPushNotifications({ requestPermission = false } = {}) {
  const requestedUser = userId;
  const requestedGeneration = generation;
  const task = async () => {
    const module = getNotifications();
    if (!module) return 'unavailable';
    if (!requestedUser || generation !== requestedGeneration) return 'inactive';
    if (Platform.OS === 'android') await module.setNotificationChannelAsync('messages', { name: 'Mensagens', importance: module.AndroidImportance.HIGH });
    let permission = await module.getPermissionsAsync();
    if (!permission.granted && requestPermission && permission.canAskAgain) permission = await module.requestPermissionsAsync();
    if (!permission.granted) {
      if (registeredToken && generation === requestedGeneration) {
        await api.delete('/push/device', { body: JSON.stringify({ token: registeredToken }) });
        registeredToken = null;
      }
      return 'denied';
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    if (!projectId) throw new Error('O projeto EAS não está configurado nesta build.');
    const token = (await module.getExpoPushTokenAsync({ projectId })).data;
    if (generation !== requestedGeneration) return 'inactive';
    await api.put('/push/device', { token, platform: Platform.OS });
    const previousToken = registeredToken;
    registeredToken = token;
    if (previousToken && previousToken !== token && generation === requestedGeneration) await api.delete('/push/device', { body: JSON.stringify({ token: previousToken }) });
    return 'registered';
  };
  const result = operation.then(task, task);
  operation = result.catch(() => {});
  return result;
}
// Drain any in-flight registration before logout revokes the session.
export async function unregisterPushNotifications() {
  clearPushUser();
  await operation;
  if (registeredToken) {
    await api.delete('/push/device', { body: JSON.stringify({ token: registeredToken }) });
    registeredToken = null;
  }
}
