import { API_BASE } from '../config/api';
import { getAuthToken } from '../context/authToken';

// ─── Response Types ────────────────────────────────────────────────────────

export interface BotStatusResponse {
    success: boolean;
    island_name?: string;
    dodo_code?: string;
    queue_count?: number;
    accepting_commands?: boolean;
    battery_charge?: number;
    server_time?: string;
    error?: string;
}

export interface SubmitOrderResponse {
    success: boolean;
    orderId?: string;
    queuePosition?: number;
    estimatedMinutes?: number;
    dodoCode?: string;
    message?: string;
    error?: string;
}

export interface OrderStatusResponse {
    status: 'queued' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'error';
    queuePosition?: number;
    estimatedMinutes?: number;
    dodoCode?: string;
    islandName?: string;
    message?: string;
}

export interface QueueEntry {
    order_id: string;
    username: string;
    queue_position: number;
    estimated_minutes?: number;
    status: string;
}

export interface OrderQueueResponse {
    success: boolean;
    queue?: QueueEntry[];
    total?: number;
    error?: string;
}

export interface SubmitDropResponse {
    success: boolean;
    islandName: string;
    message: string;
}

export interface OrderHistoryItem {
    id: string;
    user_id: string;
    username: string;
    command: string;
    order_type: string;
    status: 'queued' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'error' | string;
    queue_position?: number;
    estimated_minutes?: number;
    dodo_code?: string;
    island_name?: string;
    message?: string;
    created_at: number;
    updated_at: number;
}

export interface UserOrderHistoryResponse {
    success: boolean;
    orders?: OrderHistoryItem[];
    error?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const getHeaders = (token?: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const authToken = token ?? getAuthToken();
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
};

// ─── Bot Status ────────────────────────────────────────────────────────────

/**
 * Fetches the live bot status (mode, island, dodo, queue count, battery).
 */
export const fetchBotStatus = async (
    token?: string | null
): Promise<BotStatusResponse> => {
    try {
        const res = await fetch(`${API_BASE}/api/order/bot-status`, {
            headers: getHeaders(token),
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, ...data };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err?.error || 'Failed to fetch bot status.' };
    } catch {
        return { success: false, error: 'Bot status unavailable.' };
    }
};

// ─── Submit Order ──────────────────────────────────────────────────────────

/**
 * Submits an order command to the Order Bot queue.
 */
export const submitOrderToBot = async (
    commandText: string,
    token?: string | null
): Promise<SubmitOrderResponse> => {
    const trimmed = commandText.trim();
    if (!trimmed) {
        return { success: false, error: 'Order pocket is empty.' };
    }

    try {
        const res = await fetch(`${API_BASE}/api/order/submit`, {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify({
                command: trimmed,
                type: 'order',
                timestamp: Date.now(),
            }),
        });

        if (res.ok) {
            const data = await res.json();
            return {
                success: true,
                orderId: data.order_id,
                queuePosition: data.queue_position,
                estimatedMinutes: data.estimated_minutes,
                dodoCode: data.dodo_code,
                message: data.message || 'Order placed successfully!',
            };
        }

        const errData = await res.json().catch(() => ({}));
        return {
            success: false,
            error: errData?.error || 'Order submission failed.',
        };
    } catch {
        return {
            success: false,
            error: 'Could not reach the Order Bot. Please try again.',
        };
    }
};

// ─── Poll Order Status ─────────────────────────────────────────────────────

/**
 * Polls the status of a submitted order.
 */
export const pollOrderStatus = async (
    orderId: string,
    token?: string | null
): Promise<OrderStatusResponse> => {
    try {
        const res = await fetch(
            `${API_BASE}/api/order/status?id=${encodeURIComponent(orderId)}`,
            {
                headers: getHeaders(token),
                credentials: 'include',
            }
        );

        if (res.ok) {
            const data = await res.json();
            return {
                status: data.status || 'queued',
                queuePosition: data.queue_position,
                estimatedMinutes: data.estimated_minutes,
                dodoCode: data.dodo_code,
                islandName: data.island_name,
                message: data.message,
            };
        }
    } catch { /* network error — return error state */ }

    return { status: 'error', message: 'Could not poll order status.' };
};

// ─── Cancel Order ──────────────────────────────────────────────────────────

/**
 * Cancels an active order by order_id.
 */
export const cancelOrder = async (
    orderId: string,
    token?: string | null
): Promise<{ success: boolean; error?: string }> => {
    try {
        const res = await fetch(`${API_BASE}/api/order/cancel`, {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify({ id: orderId }),
        });
        const data = await res.json().catch(() => ({}));
        return { success: res.ok, error: data?.error };
    } catch {
        return { success: false, error: 'Cancel request failed.' };
    }
};

// ─── Fetch Queue ───────────────────────────────────────────────────────────

/**
 * Fetches the full current order queue.
 */
export const fetchOrderQueue = async (
    token?: string | null
): Promise<OrderQueueResponse> => {
    try {
        const res = await fetch(`${API_BASE}/api/order/queue`, {
            headers: getHeaders(token),
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            return {
                success: true,
                queue: data.queue || data.orders || [],
                total: data.total ?? (data.queue || data.orders || []).length,
            };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err?.error };
    } catch {
        return { success: false, error: 'Could not fetch queue.' };
    }
};

// ─── Sub Island Drop ───────────────────────────────────────────────────────

/**
 * Submits a drop command or villager injection to a specific Sub Island.
 */
export const submitSubIslandDrop = async (
    islandId: string,
    islandName: string,
    commandText: string,
    plotNumber?: number,
    token?: string | null
): Promise<SubmitDropResponse> => {
    try {
        const res = await fetch(`${API_BASE}/api/order/drop-sub`, {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include',
            body: JSON.stringify({
                island_id: islandId,
                island_name: islandName,
                command: commandText,
                plot_number: plotNumber,
                timestamp: Date.now(),
            }),
        });

        if (res.ok) {
            const data = await res.json();
            return {
                success: true,
                islandName,
                message: data.message || `Items dropped on ${islandName}! Fly in now.`,
            };
        }

        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Drop request failed');
    } catch (err) {
        throw err;
    }
};

// ─── Browser Notifications ─────────────────────────────────────────────────

/**
 * Requests browser notification permission.
 * Returns true if granted.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
};

/**
 * Fires a browser notification when an order is ready.
 */
export const notifyOrderReady = (islandName?: string, dodoCode?: string): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const title = '🏝️ Your order is ready!';
    const body = islandName
        ? `Fly to ${islandName}${dodoCode ? ` · Dodo: ${dodoCode}` : ''}`
        : 'Your items are ready for pick-up. Open Chopaeng to see your Dodo code.';
    const n = new Notification(title, {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'chopaeng-order-ready',
        requireInteraction: true,
    });
    n.onclick = () => {
        window.focus();
        n.close();
    };
};

// ─── Order History & Reorder ───────────────────────────────────────────────

const LOCAL_ORDER_HISTORY_KEY = 'chopaeng_order_history_v1';

export const getLocalOrderHistory = (): OrderHistoryItem[] => {
    try {
        const raw = localStorage.getItem(LOCAL_ORDER_HISTORY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveLocalOrderBackup = (order: Partial<OrderHistoryItem> & { id: string; command: string }): void => {
    try {
        const existing = getLocalOrderHistory();
        const updatedOrder: OrderHistoryItem = {
            id: order.id,
            user_id: order.user_id || 'local_user',
            username: order.username || 'WebUser',
            command: order.command,
            order_type: order.order_type || 'order',
            status: order.status || 'queued',
            queue_position: order.queue_position,
            estimated_minutes: order.estimated_minutes,
            dodo_code: order.dodo_code,
            island_name: order.island_name || 'Sinta',
            message: order.message || '',
            created_at: order.created_at || Math.floor(Date.now() / 1000),
            updated_at: order.updated_at || Math.floor(Date.now() / 1000),
        };

        const filtered = existing.filter((o) => o.id !== order.id);
        const combined = [updatedOrder, ...filtered].slice(0, 50);
        localStorage.setItem(LOCAL_ORDER_HISTORY_KEY, JSON.stringify(combined));
    } catch {
        /* Ignore storage errors */
    }
};

/**
 * Fetches the user's order history from the database (via backend API),
 * and falls back to local storage history if offline.
 */
export const fetchUserOrderHistory = async (
    token?: string | null
): Promise<UserOrderHistoryResponse> => {
    try {
        const res = await fetch(`${API_BASE}/api/order/user-history`, {
            headers: getHeaders(token),
            credentials: 'include',
        });

        if (res.ok) {
            const data: UserOrderHistoryResponse = await res.json();
            if (data.success && Array.isArray(data.orders)) {
                // Also merge with any unique local orders
                const localOrders = getLocalOrderHistory();
                const remoteIds = new Set(data.orders.map((o) => o.id));
                const uniqueLocals = localOrders.filter((o) => !remoteIds.has(o.id));
                const merged = [...data.orders, ...uniqueLocals].sort(
                    (a, b) => b.created_at - a.created_at
                );
                return { success: true, orders: merged };
            }
        }
    } catch {
        /* fallback to local storage */
    }

    const local = getLocalOrderHistory();
    return { success: true, orders: local };
};
