const ORDERS_COUNT_KEY = 'chopaeng_user_orders_placed_count';
const DROPS_COUNT_KEY = 'chopaeng_user_drops_placed_count';

export interface UserActivityStats {
    ordersPlaced: number;
    dropsPlaced: number;
}

export const getUserActivityStats = (backendOrders = 0, backendDrops = 0): UserActivityStats => {
    try {
        const storedOrders = parseInt(localStorage.getItem(ORDERS_COUNT_KEY) || '0', 10);
        const storedDrops = parseInt(localStorage.getItem(DROPS_COUNT_KEY) || '0', 10);

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

export const incrementUserOrdersPlaced = (amount = 1) => {
    try {
        const current = parseInt(localStorage.getItem(ORDERS_COUNT_KEY) || '0', 10);
        const updated = current + amount;
        localStorage.setItem(ORDERS_COUNT_KEY, updated.toString());
        window.dispatchEvent(new CustomEvent('chopaeng_user_stats_updated'));
    } catch {
        // Storage write error ignored
    }
};

export const incrementUserDropsPlaced = (amount = 1) => {
    try {
        const current = parseInt(localStorage.getItem(DROPS_COUNT_KEY) || '0', 10);
        const updated = current + amount;
        localStorage.setItem(DROPS_COUNT_KEY, updated.toString());
        window.dispatchEvent(new CustomEvent('chopaeng_user_stats_updated'));
    } catch {
        // Storage write error ignored
    }
};
