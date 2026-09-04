import { getUserScopedItem, setUserScopedItem, getActiveUserId } from './accountStorage';

const ORDERS_COUNT_KEY = 'chopaeng_user_orders_placed_count';
const DROPS_COUNT_KEY = 'chopaeng_user_drops_placed_count';

export interface UserActivityStats {
    ordersPlaced: number;
    dropsPlaced: number;
}

export const getUserActivityStats = (backendOrders = 0, backendDrops = 0, userId?: string | null): UserActivityStats => {
    try {
        const uid = userId || getActiveUserId();
        const storedOrders = parseInt(getUserScopedItem(ORDERS_COUNT_KEY, uid) || '0', 10);
        const storedDrops = parseInt(getUserScopedItem(DROPS_COUNT_KEY, uid) || '0', 10);

        return {
            ordersPlaced: Math.max(storedOrders, backendOrders),
            dropsPlaced: Math.max(storedDrops, backendDrops),
        };
    } catch {
        return {
            ordersPlaced: backendOrders,
            dropsPlaced: backendDrops,
        };
    }
};

export const incrementUserOrdersPlaced = (amount = 1, userId?: string | null) => {
    try {
        const uid = userId || getActiveUserId();
        const current = parseInt(getUserScopedItem(ORDERS_COUNT_KEY, uid) || '0', 10);
        const updated = current + amount;
        setUserScopedItem(ORDERS_COUNT_KEY, updated.toString(), uid);
        window.dispatchEvent(new CustomEvent('chopaeng_user_stats_updated'));
    } catch {
        // Storage write error ignored
    }
};

export const incrementUserDropsPlaced = (amount = 1, userId?: string | null) => {
    try {
        const uid = userId || getActiveUserId();
        const current = parseInt(getUserScopedItem(DROPS_COUNT_KEY, uid) || '0', 10);
        const updated = current + amount;
        setUserScopedItem(DROPS_COUNT_KEY, updated.toString(), uid);
        window.dispatchEvent(new CustomEvent('chopaeng_user_stats_updated'));
    } catch {
        // Storage write error ignored
    }
};
