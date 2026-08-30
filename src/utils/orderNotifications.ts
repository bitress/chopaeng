/**
 * Browser Notifications & Audio Chime helper for Order Bot & Drop Bot
 */
import { playOrderAlertChime } from './kkAudioSynthesizer';

const LS_NOTIFICATION_PREF = 'chopaeng_order_notifications_enabled';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export const isNotificationSupported = (): boolean => {
    return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermissionState => {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionState;
};

export const areNotificationsEnabled = (): boolean => {
    try {
        const pref = localStorage.getItem(LS_NOTIFICATION_PREF);
        return pref !== null ? pref === 'true' : true;
    } catch {
        return true;
    }
};

export const setNotificationsEnabled = (enabled: boolean): void => {
    try {
        localStorage.setItem(LS_NOTIFICATION_PREF, String(enabled));
    } catch {
        // ignore
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isNotificationSupported()) return false;
    try {
        const perm = await Notification.requestPermission();
        const granted = perm === 'granted';
        setNotificationsEnabled(granted);
        return granted;
    } catch {
        return false;
    }
};

/**
 * Fires an order notification (desktop banner + audio chime).
 */
export const notifyOrderStatusChange = (
    title: string,
    body: string,
    type: 'preparing' | 'ready' | 'alert' = 'ready'
) => {
    // 1. Play Audio Chime
    playOrderAlertChime(type);

    // 2. Desktop Push Notification (if permitted & enabled)
    if (isNotificationSupported() && Notification.permission === 'granted' && areNotificationsEnabled()) {
        try {
            const notification = new Notification(title, {
                body,
                icon: '/icons/android-chrome-192x192.png',
                badge: '/icons/favicon-32x32.png',
                tag: 'chopaeng-order-status',
                requireInteraction: type === 'ready',
            });

            notification.onclick = () => {
                window.focus();
                if (window.location.pathname !== '/order') {
                    window.location.href = '/order';
                }
                notification.close();
            };
        } catch (err) {
            console.warn('[Notification] Could not send browser notification:', err);
        }
    }
};
