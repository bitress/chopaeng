import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getAuthToken } from '../context/authToken';
import { useIslandData } from '../context/useIslandData';
import { type IslandData } from '../data/islands';
import { useCommandBuilderPockets } from '../hooks/useCommandBuilderPockets';
import { useCatalogData } from '../hooks/useCatalogData';
import { ORDER_MAX, DROP_MAX } from '../constants/limits';
import { parseItemCodes } from '../utils/itemCodeParser';
import { playChimeClick } from '../utils/kkAudioSynthesizer';
import { DODO_API_BASE } from '../config/api';
import {
    fetchBotStatus,
    submitOrderToBot,
    pollOrderStatus,
    cancelOrder,
    fetchOrderQueue,
    fetchUserOrderHistory,
    requestNotificationPermission,
    saveLocalOrderBackup,
    type BotStatusResponse,
    type OrderStatusResponse,
    type QueueEntry,
    type OrderHistoryItem,
} from '../utils/orderBotApi';
import './OrderBot.css';

// ─── Constants ─────────────────────────────────────────────────────────────
const POLL_MS = 10_000;
const STATUS_MS = 30_000;
const QUEUE_MS = 20_000;
const LS_ORDER_KEY = 'chopaeng_active_order';
const FALLBACK_IMG =
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0fdf4'/%3E%3Ctext x='50' y='62' text-anchor='middle' font-size='40'%3E📦%3C/text%3E%3C/svg%3E";

const QUICK_PRESETS = [
    {
        id: 'nmt-40',
        name: '40× NMTs',
        icon: 'https://dodo.ac/np/images/4/43/Nook_Miles_Ticket_NH_Inv_Icon.png',
        desc: '400 Nook Miles Tickets',
        fillType: 'tickets',
    },
    {
        id: 'crowns-40',
        name: '40× Royal Crowns',
        icon: 'https://dodo.ac/np/images/c/c7/Royal_Crown_NH_Storage_Icon.png',
        desc: '12 Million Bells value',
        fillType: 'crowns',
    },
    {
        id: 'bells-40',
        name: '40× 99k Bells',
        icon: 'https://dodo.ac/np/images/1/1e/99k_Bells_NH_Inv_Icon.png',
        desc: '3.96 Million Bells in cash',
        fillType: 'bells',
    }
];

const DROP_QUICK_PRESETS = [
    {
        id: 'crowns-9',
        name: '9× Royal Crowns',
        icon: 'https://dodo.ac/np/images/c/c7/Royal_Crown_NH_Storage_Icon.png',
        desc: 'Max value in Bells',
        fillType: 'crowns',
    },
    {
        id: 'nmt-9',
        name: '9× NMTs',
        icon: 'https://dodo.ac/np/images/4/43/Nook_Miles_Ticket_NH_Inv_Icon.png',
        desc: '90 Nook Miles Tickets',
        fillType: 'tickets',
    },
    {
        id: 'bells-9',
        name: '9× 99k Bells',
        icon: 'https://dodo.ac/np/images/1/1e/99k_Bells_NH_Inv_Icon.png',
        desc: 'Instant cash in bags',
        fillType: 'bells',
    },
    {
        id: 'gold-9',
        name: '9× Gold Nuggets',
        icon: 'https://dodo.ac/np/images/2/26/Gold_Nugget_NH_Inv_Icon.png',
        desc: 'Top-tier crafting resource',
        fillType: 'gold',
    },
];

type Stage = 'submit' | 'tracker';
interface SavedOrder {
    orderId: string;
    submittedAt: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const saveOrder = (id: string) => {
    try {
        localStorage.setItem(LS_ORDER_KEY, JSON.stringify({ orderId: id, submittedAt: Date.now() }));
    } catch {
        /**/
    }
};

const loadOrder = (): SavedOrder | null => {
    try {
        const v = localStorage.getItem(LS_ORDER_KEY);
        return v ? JSON.parse(v) : null;
    } catch {
        return null;
    }
};

const clearOrder = () => {
    try {
        localStorage.removeItem(LS_ORDER_KEY);
    } catch {
        /**/
    }
};

const fmtEta = (m?: number) => (!m ? '--' : m < 1 ? '< 1 min' : `~${Math.round(m)} min`);

const triggerBrowserNotification = (title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body,
                icon: 'https://dodo.ac/np/images/2/26/Gold_Nugget_NH_Inv_Icon.png',
                tag: 'chopaeng-order-dodo',
            });
        } catch {
            // Ignore
        }
    }
};

const formatDateTime = (value?: string | number | null) => {
    if (!value) return '';
    const date = typeof value === 'number' ? new Date(value < 1e12 ? value * 1000 : value) : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

// ─── StatusPill ───────────────────────────────────────────────────────────────
const StatusPill: React.FC<{ s: BotStatusResponse | null; loading: boolean }> = ({ s, loading }) => {
    if (loading)
        return (
            <span className="ob-mode-pill offline" role="status" aria-live="polite">
                <span className="spinner-border spinner-border-sm" style={{ width: 9, height: 9 }} aria-hidden="true" />{' '}
                Connecting…
            </span>
        );
    if (!s?.success)
        return (
            <span className="ob-mode-pill offline" role="status" aria-live="polite">
                <span className="ob-pulse red" aria-hidden="true" /> Unavailable
            </span>
        );
    if (s.accepting_commands !== false)
        return (
            <span className="ob-mode-pill order" role="status" aria-live="polite">
                <span className="ob-pulse green" aria-hidden="true" /> Online
            </span>
        );
    return (
        <span className="ob-mode-pill offline" role="status" aria-live="polite">
            <span className="ob-pulse red" aria-hidden="true" /> Offline
        </span>
    );
};

// ─── StepIndicator ───────────────────────────────────────────────────────────
const STEPS = [
    { key: 'submit', icon: 'fa-bag-shopping', label: '1. Build Pocket' },
    { key: 'tracker', icon: 'fa-satellite-dish', label: '2. Track & Fly In' },
];

const StepIndicator: React.FC<{ stage: Stage }> = ({ stage }) => {
    const idx = STEPS.findIndex((s) => s.key === stage);
    return (
        <div className="ob-steps mb-4" role="list" aria-label="Order progress">
            {STEPS.map((s, i) => (
                <div
                    key={s.key}
                    className={`ob-step ${i < idx ? 'done' : i === idx ? 'active' : ''}`}
                    role="listitem"
                    aria-current={i === idx ? 'step' : undefined}
                >
                    <div className="ob-step-dot" aria-hidden="true">
                        {i < idx ? (
                            <i className="fa-solid fa-check" />
                        ) : (
                            <i className={`fa-solid ${s.icon}`} style={{ fontSize: '.78rem' }} />
                        )}
                    </div>
                    <span className="ob-step-label">{s.label}</span>
                </div>
            ))}
        </div>
    );
};

// ─── QueueList ────────────────────────────────────────────────────────────────
const QueueList: React.FC<{ queue: QueueEntry[]; myOrderId?: string }> = ({ queue, myOrderId }) => {
    if (!queue.length) return <p className="text-muted small mb-0 text-center py-3">The queue is currently empty.</p>;
    return (
        <ul className="ob-queue-list" aria-label="Live order queue">
            {queue.slice(0, 20).map((e) => {
                const isMe = e.order_id === myOrderId;
                return (
                    <li key={e.order_id} className={`ob-queue-row${isMe ? ' is-me' : ''}`}>
                        <div className="ob-queue-badge" aria-hidden="true">
                            {e.queue_position}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                            <div className="fw-bold small text-truncate d-flex align-items-center gap-1">
                                {isMe ? (
                                    <>
                                        <span className="badge bg-success text-white rounded-pill px-2 py-0 x-small">
                                            YOU
                                        </span>
                                        <span className="text-success">{e.username}</span>
                                    </>
                                ) : (
                                    <span>{e.username}</span>
                                )}
                            </div>
                            <div className="text-muted tiny-text">{fmtEta(e.estimated_minutes)}</div>
                        </div>
                        <span
                            className={`badge rounded-pill ${e.status === 'ready'
                                    ? 'bg-success text-white'
                                    : e.status === 'preparing'
                                        ? 'bg-warning text-dark'
                                        : 'bg-light text-secondary border'
                                }`}
                            style={{ fontSize: '.65rem' }}
                        >
                            {e.status}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const OrderBot: React.FC = () => {
    const { user, canAccessIsland, loading: authLoading, login } = useAuth();
    const { islands, loading: islandsLoading } = useIslandData();
    const token = getAuthToken();
    const { data: catalogData } = useCatalogData();
    const {
        orderCommandText,
        dropCommandText,
        orderItemsOnlyCommand,
        orderVillagerCommand,
        injectVillagerCommand,
        mviVillagerCommand,
        dropItemsOnlyCommand,
        dropVillagerCommand,
        totalOrderCount,
        totalDropCount,
        orderItems,
        dropItems,
        setOrderItems,
        setDropItems,
        increaseOrderQuantity,
        decreaseOrderQuantity,
        removeOrderItem,
        increaseDropQuantity,
        decreaseDropQuantity,
        removeDropItem,
        handleFillTickets,
        handleFillCrowns,
        handleFillBells,
        handleFillRemaining,
        handleMaximizeStacks,
        handleSortPockets,
        loadBundleIntoOrder,
    } = useCommandBuilderPockets();

    // ── Mode Switch & Drop State ──
    const [botMode, setBotMode] = useState<'order' | 'drop'>('order');
    const [selectedDropIsland, setSelectedDropIsland] = useState<IslandData | null>(null);
    const [dropFilter, setDropFilter] = useState<'all' | 'unlocked'>('all');
    const [dropDodoCode, setDropDodoCode] = useState<string | null>(null);
    const [dropDodoLoading, setDropDodoLoading] = useState(false);
    const [dropDodoError, setDropDodoError] = useState<string | null>(null);
    const [alreadyOnIsland, setAlreadyOnIsland] = useState(false);
    const [dropSuccessMsg, setDropSuccessMsg] = useState<string | null>(null);
    const [dropErrorMsg, setDropErrorMsg] = useState<string | null>(null);
    const [dropDodoCopied, setDropDodoCopied] = useState(false);

    // ── State ──
    const [botStatus, setBotStatus] = useState<BotStatusResponse | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [stage, setStage] = useState<Stage>('submit');
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [dodoCopied, setDodoCopied] = useState(false);
    const [commandCopied, setCommandCopied] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyOrders, setHistoryOrders] = useState<OrderHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [notifGranted, setNotifGranted] = useState(
        typeof Notification !== 'undefined' && Notification.permission === 'granted'
    );
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [queueOpen, setQueueOpen] = useState(false);
    const [inAppToast, setInAppToast] = useState<{
        id: string;
        type: 'dodo' | 'success' | 'warning' | 'info';
        title: string;
        message: string;
        actionLabel?: string;
        onAction?: () => void;
    } | null>(null);

    // ── Timers / Refs ──
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const queueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const notifiedRef = useRef(false);

    const triggerInAppToast = useCallback((notif: {
        type: 'dodo' | 'success' | 'warning' | 'info';
        title: string;
        message: string;
        actionLabel?: string;
        onAction?: () => void;
    }) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        const id = Date.now().toString();
        setInAppToast({ ...notif, id });
        playChimeClick();
        toastTimerRef.current = setTimeout(() => {
            setInAppToast(null);
        }, 7500);
    }, []);

    const dismissInAppToast = () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setInAppToast(null);
    };

    // ── Restore active order on mount ──
    useEffect(() => {
        const saved = loadOrder();
        if (saved) {
            setActiveOrderId(saved.orderId);
            setStage('tracker');
        }
    }, []);

    // ── Bot status polling ──
    const refreshStatus = useCallback(async () => {
        const d = await fetchBotStatus(token);
        setBotStatus(d);
        setStatusLoading(false);
    }, [token]);

    useEffect(() => {
        refreshStatus();
        statusTimerRef.current = setInterval(refreshStatus, STATUS_MS);
        return () => {
            if (statusTimerRef.current) clearInterval(statusTimerRef.current);
        };
    }, [refreshStatus]);

    // ── Copy Dodo ──
    const handleCopyDodo = useCallback(async () => {
        const code = orderStatus?.dodoCode;
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
        } catch {
            /**/
        }
        playChimeClick();
        setDodoCopied(true);
        setTimeout(() => setDodoCopied(false), 2500);
    }, [orderStatus?.dodoCode]);

    // ── Order status polling ──
    const pollStatus = useCallback(async () => {
        if (!activeOrderId) return;
        const d = await pollOrderStatus(activeOrderId, token);
        setOrderStatus(d);

        saveLocalOrderBackup({
            id: activeOrderId,
            command: orderCommandText,
            status: d.status,
            queue_position: d.queuePosition,
            estimated_minutes: d.estimatedMinutes,
            dodo_code: d.dodoCode,
            island_name: d.islandName,
            message: d.message,
            updated_at: Math.floor(Date.now() / 1000),
        });

        if (d.status === 'ready' && !notifiedRef.current) {
            notifiedRef.current = true;
            playChimeClick();
            triggerBrowserNotification(
                '🦤 Your Order Bot Dodo Code is Ready!',
                `Your flight to ${d.islandName || 'the island'} is ready! Dodo Code: ${d.dodoCode}`
            );
            triggerInAppToast({
                type: 'dodo',
                title: '✈️ Dodo Code Ready!',
                message: `Your flight to ${d.islandName || 'the island'} is ready! Dodo Code: ${d.dodoCode}`,
                actionLabel: 'Copy Dodo Code',
                onAction: handleCopyDodo,
            });
        }
        if (['completed', 'cancelled', 'error'].includes(d.status)) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (d.status !== 'ready') clearOrder();
        }
    }, [activeOrderId, orderCommandText, token, triggerInAppToast, handleCopyDodo]);

    useEffect(() => {
        if (stage !== 'tracker' || !activeOrderId) return;
        pollStatus();
        pollTimerRef.current = setInterval(pollStatus, POLL_MS);
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, [stage, activeOrderId, pollStatus]);

    // ── Queue polling ──
    const refreshQueue = useCallback(async () => {
        if (!queueOpen) return;
        const d = await fetchOrderQueue(token);
        if (d.success && d.queue) setQueue(d.queue);
    }, [queueOpen, token]);

    useEffect(() => {
        if (!queueOpen) return;
        refreshQueue();
        queueTimerRef.current = setInterval(refreshQueue, QUEUE_MS);
        return () => {
            if (queueTimerRef.current) clearInterval(queueTimerRef.current);
        };
    }, [queueOpen, refreshQueue]);

    // ── Fetch history for quick reorder modal ──
    const loadHistory = useCallback(async () => {
        setHistoryLoading(true);
        const res = await fetchUserOrderHistory(token);
        if (res.success && res.orders) {
            setHistoryOrders(res.orders);
        }
        setHistoryLoading(false);
    }, [token]);

    const handleOpenHistoryModal = () => {
        setShowHistoryModal(true);
        loadHistory();
        playChimeClick();
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!orderCommandText.trim()) return;
        setSubmitError(null);
        setSubmitLoading(true);
        playChimeClick();

        if (!notifGranted) {
            const granted = await requestNotificationPermission();
            setNotifGranted(granted);
        }

        const res = await submitOrderToBot(orderCommandText, token);
        setSubmitLoading(false);

        if (!res.success || !res.orderId) {
            setSubmitError(res.error || 'Submission failed. Please try again.');
            return;
        }

        notifiedRef.current = false;
        saveOrder(res.orderId);
        setActiveOrderId(res.orderId);

        saveLocalOrderBackup({
            id: res.orderId,
            command: orderCommandText,
            status: 'queued',
            queue_position: res.queuePosition,
            estimated_minutes: res.estimatedMinutes,
            dodo_code: res.dodoCode,
            message: res.message,
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000),
        });

        setOrderStatus({
            status: 'queued',
            queuePosition: res.queuePosition,
            estimatedMinutes: res.estimatedMinutes,
            message: res.message,
        });
        setStage('tracker');

        triggerInAppToast({
            type: 'success',
            title: '📦 Order Submitted!',
            message: `Your order is in queue at position #${res.queuePosition ?? 1}. Estimated wait: ~${res.estimatedMinutes ?? 2}m.`,
        });
    };

    // ── Cancel ──
    const handleCancel = async () => {
        if (!activeOrderId || cancelLoading) return;
        setCancelLoading(true);
        playChimeClick();
        await cancelOrder(activeOrderId, token);
        setCancelLoading(false);
        clearOrder();
        setActiveOrderId(null);
        setOrderStatus(null);
        setStage('submit');

        triggerInAppToast({
            type: 'warning',
            title: 'Order Cancelled',
            message: 'Your order was removed from the active delivery queue.',
        });
    };

    // ── Reset ──
    const handleReset = () => {
        clearOrder();
        setActiveOrderId(null);
        setOrderStatus(null);
        notifiedRef.current = false;
        setDodoCopied(false);
        setStage('submit');
        playChimeClick();
    };

    // ── Copy Command ──
    const handleCopyCommand = () => {
        if (!orderCommandText) return;
        navigator.clipboard.writeText(orderCommandText).catch(() => { });
        playChimeClick();
        setCommandCopied(true);
        setTimeout(() => setCommandCopied(false), 2500);
        triggerInAppToast({
            type: 'success',
            title: 'Copied !order Command!',
            message: 'Redirecting to #chorder-bot in Discord... Paste command to queue your order!',
        });
        setTimeout(() => {
            window.open('https://discord.com/channels/729590421478703135/1175672083183829075', '_blank');
        }, 450);
    };

    const handleCopySpecific = (cmd: string, label: string) => {
        if (!cmd) return;
        navigator.clipboard.writeText(cmd).catch(() => { });
        playChimeClick();
        triggerInAppToast({
            type: 'info',
            title: `${label} Copied!`,
            message: 'Redirecting to Discord... Paste command in the channel!',
        });
        setTimeout(() => {
            window.open('https://discord.com/channels/729590421478703135/1175672083183829075', '_blank');
        }, 450);
    };

    // ── Quick Fill Preset ──
    const handleApplyPreset = (fillType: string) => {
        playChimeClick();
        if (fillType === 'tickets') handleFillTickets();
        else if (fillType === 'crowns') handleFillCrowns();
        else if (fillType === 'bells') handleFillBells();
        else if (fillType === 'gold') handleFillRemaining('gold');

        triggerInAppToast({
            type: 'info',
            title: 'Pocket Preset Applied',
            message: `Loaded ${fillType} bundle into your 40-slot pocket.`,
        });
    };

    // ── Drop Mode Helpers ──
    const handleGetDropIslandDodo = async (island: IslandData) => {
        if (!island) return;
        setDropDodoLoading(true);
        setDropDodoError(null);
        playChimeClick();

        try {
            const token = getAuthToken();
            const resp = await fetch(`${DODO_API_BASE}/api/islands/${encodeURIComponent(island.name)}/dodo`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: 'include',
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                if (resp.status === 401) {
                    setDropDodoError("Your login session expired. Please log in again.");
                    return;
                }
                if (resp.status === 403) {
                    setDropDodoError(err.error || "You do not have access to this Sub Member island's Dodo code.");
                    return;
                }
                if (resp.status === 404) {
                    setDropDodoError("Dodo code is not available right now. Please try again shortly.");
                    return;
                }
                setDropDodoError(err.error || "Unable to retrieve Dodo code.");
                return;
            }

            const data = await resp.json();
            const rawCode = String(data.dodo_code || '');
            const code = rawCode.split(': ').pop() || rawCode;
            setDropDodoCode(code);
            navigator.clipboard.writeText(code).catch(() => {});
            playChimeClick();
            setDropDodoCopied(true);
            setTimeout(() => setDropDodoCopied(false), 2500);
            triggerInAppToast({
                type: 'dodo',
                title: 'Dodo Code Logged & Copied!',
                message: `Logged to Discord webhook & copied ${code} to clipboard. Fly in to drop!`,
            });
        } catch (e) {
            console.error(e);
            setDropDodoError("Network error while revealing Dodo code. Please try again.");
        } finally {
            setDropDodoLoading(false);
        }
    };

    const handleCopyDropIslandDodo = (code: string) => {
        if (!code) return;
        navigator.clipboard.writeText(code).catch(() => {});
        playChimeClick();
        setDropDodoCopied(true);
        setTimeout(() => setDropDodoCopied(false), 2500);
        triggerInAppToast({
            type: 'dodo',
            title: 'Dodo Code Copied!',
            message: `Copied ${code} to clipboard. Enter this at Dodo Airlines!`,
        });
    };

    const handleApplyDropPreset = (fillType: string) => {
        playChimeClick();
        if (fillType === 'tickets') {
            setDropItems([{
                item: {
                    id: '16DB',
                    name: 'Nook Miles Ticket',
                    entityType: 'item',
                    category: 'Currency',
                    theme: 'Buffer',
                    series: 'Buffer',
                    interactivity: 'Consumable',
                    colour: 'Various',
                    image: 'https://dodo.ac/np/images/4/43/Nook_Miles_Ticket_NH_Inv_Icon.png',
                    description: 'Nook Miles Ticket',
                },
                quantity: 9,
            }]);
        } else if (fillType === 'crowns') {
            setDropItems([{
                item: {
                    id: '14BB',
                    name: 'Royal Crown',
                    entityType: 'item',
                    category: 'Currency',
                    theme: 'Buffer',
                    series: 'Buffer',
                    interactivity: 'Consumable',
                    colour: 'Various',
                    image: 'https://dodo.ac/np/images/c/c7/Royal_Crown_NH_Storage_Icon.png',
                    description: 'Royal Crown',
                },
                quantity: 9,
            }]);
        } else if (fillType === 'bells') {
            setDropItems([{
                item: {
                    id: '08A4',
                    name: '99,000 Bells',
                    entityType: 'item',
                    category: 'Currency',
                    theme: 'Buffer',
                    series: 'Buffer',
                    interactivity: 'Consumable',
                    colour: 'Various',
                    image: 'https://dodo.ac/np/images/1/1e/99k_Bells_NH_Inv_Icon.png',
                    description: '99k Bells',
                },
                quantity: 9,
            }]);
        } else if (fillType === 'gold') {
            setDropItems([{
                item: {
                    id: '0B07',
                    name: 'Gold nugget',
                    entityType: 'item',
                    category: 'Material',
                    theme: 'Buffer',
                    series: 'Buffer',
                    interactivity: 'Consumable',
                    colour: 'Gold',
                    image: 'https://dodo.ac/np/images/2/26/Gold_Nugget_NH_Inv_Icon.png',
                    description: 'Gold nugget',
                },
                quantity: 9,
            }]);
        }

        triggerInAppToast({
            type: 'info',
            title: 'Drop Preset Applied',
            message: `Loaded 9× ${fillType} into your drop pocket.`,
        });
    };

    const handleCopyDropForDiscord = () => {
        if (!dropCommandText) return;
        navigator.clipboard.writeText(dropCommandText).catch(() => {});
        playChimeClick();
        triggerInAppToast({
            type: 'success',
            title: 'Copied !drop for Discord!',
            message: `Redirecting to Discord ${selectedDropIsland?.name ? `(${selectedDropIsland.name})` : ''}... Paste command in the channel!`,
        });
        setTimeout(() => {
            const targetUrl = (selectedDropIsland as any)?.channel_id
                ? `https://discord.com/channels/729590421478703135/${(selectedDropIsland as any).channel_id}`
                : 'https://discord.gg/chopaeng';
            window.open(targetUrl, '_blank');
        }, 450);
    };

    // ── Reorder from modal ──
    const handleReorderHistoryItem = (order: OrderHistoryItem) => {
        const bundle = parseItemCodes(order.command, catalogData?.all || []);
        if (bundle.items.length > 0) {
            loadBundleIntoOrder(bundle.items, 'replace');
        }
        playChimeClick();
        setShowHistoryModal(false);
        setStage('submit');

        triggerInAppToast({
            type: 'info',
            title: 'Order Loaded into Pocket',
            message: 'Past items loaded into your pocket grid. Ready to review and submit!',
        });
    };

    // ── Derived ──
    const botAvailable = !!botStatus?.success && botStatus.accepting_commands !== false;
    const botUnavailable = !statusLoading && !botStatus?.success;
    const canSubmit = !!user && botAvailable && totalOrderCount > 0 && !submitLoading && stage === 'submit';
    const statusStr = orderStatus?.status ?? 'queued';
    const isReady = statusStr === 'ready';
    const isDone = ['completed', 'cancelled', 'error'].includes(statusStr);
    const slotsFilled = totalOrderCount;
    const capacityPct = Math.min(100, Math.round((slotsFilled / ORDER_MAX) * 100));

    const subMemberIslands = useMemo(() => {
        return islands.filter((isl) => isl.cat === 'member');
    }, [islands]);

    const availableDropIslands = useMemo(() => {
        // Drop mode is strictly available on Sub Member islands
        if (dropFilter === 'unlocked') {
            return subMemberIslands.filter((isl) => !!user && canAccessIsland(isl.requiredRoles));
        }
        return subMemberIslands;
    }, [subMemberIslands, dropFilter, user, canAccessIsland]);

    return (
        <>
            <Helmet>
                <title>Order Bot · Chopaeng</title>
                <meta
                    name="description"
                    content="Submit custom 40-slot item orders to the Chopaeng Order Bot and track your personal Dodo code in real-time."
                />
                <link rel="canonical" href={`${window.location.origin}/order`} />
            </Helmet>

            {/* ════════════════ HERO HEADER ════════════════ */}
            <section className="ob-hero position-relative">
                <div className="container position-relative" style={{ zIndex: 1 }}>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <StatusPill s={botStatus} loading={statusLoading} />
                                {!statusLoading && (
                                    <button
                                        className="btn btn-sm btn-link p-0 text-white-50 hover-text-white"
                                        onClick={() => {
                                            playChimeClick();
                                            refreshStatus();
                                        }}
                                        aria-label="Refresh bot status"
                                        title="Refresh live status"
                                        style={{ fontSize: '.78rem', lineHeight: 1 }}
                                    >
                                        <i className="fa-solid fa-arrows-rotate" aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <h1
                                className="fw-black mb-1 text-white"
                                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontFamily: "'Outfit', sans-serif" }}
                            >
                                <i className="fa-solid fa-box-open me-2" style={{ color: '#4ade80' }} aria-hidden="true" />
                                Order Bot
                            </h1>
                            <p
                                className="mb-0"
                                style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500, fontSize: '.93rem' }}
                            >
                                Load your 40-slot pocket, submit an order, and receive your personal Dodo code right here.
                            </p>
                        </div>

                        {/* Top Action Bar & Live Stats */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                className="btn btn-sm btn-light bg-white bg-opacity-10 text-white border-0 rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-2xs hover-bg-opacity-20"
                                onClick={handleOpenHistoryModal}
                                title="View past orders & reorder"
                            >
                                <i className="fa-solid fa-clock-rotate-left" style={{ color: '#4ade80' }} aria-hidden="true" />
                                <span>Recent Orders</span>
                            </button>

                            {botStatus?.success && !statusLoading && (
                                <div className="d-flex gap-2 flex-wrap">
                                    {botStatus.island_name && (
                                        <div className="ob-hero-stat">
                                            <div className="ob-hero-stat-val" style={{ fontSize: '0.95rem' }}>
                                                🏝️ {botStatus.island_name}
                                            </div>
                                            <div className="ob-hero-stat-lbl">Order Island</div>
                                        </div>
                                    )}
                                    {typeof botStatus.queue_count === 'number' && (
                                        <div className="ob-hero-stat">
                                            <div className="ob-hero-stat-val">{botStatus.queue_count}</div>
                                            <div className="ob-hero-stat-lbl">In Queue</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════ MAIN BODY ════════════════ */}
            <div className="ob-page">
                <div className="container py-4">

                    {/* ── BOT MODE SELECTOR (Order Delivery vs In-Island Drop) ── */}
                    <div className="d-flex align-items-center justify-content-center mb-4">
                        <div className="ob-mode-toggle-wrap">
                            <button
                                type="button"
                                onClick={() => { setBotMode('order'); playChimeClick(); }}
                                className={`ob-mode-btn ${botMode === 'order' ? 'active order' : ''}`}
                            >
                                <i className="fa-solid fa-plane-departure"></i>
                                <span>Order Delivery (40 Slots)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setBotMode('drop'); playChimeClick(); }}
                                className={`ob-mode-btn ${botMode === 'drop' ? 'active drop' : ''}`}
                            >
                                <i className="fa-solid fa-box-open"></i>
                                <span>In-Island Drop Bot (9 Slots)</span>
                            </button>
                        </div>
                    </div>

                    {botMode === 'order' ? (
                        <>
                            {/* Step indicator */}
                            <StepIndicator stage={stage} />

                    {/* Notification Permission Banner */}
                    {!notifGranted && 'Notification' in window && Notification.permission !== 'denied' && (
                        <div className="ob-notify-bar mb-4 shadow-2xs animate-fade">
                            <i
                                className="fa-solid fa-bell fs-5 flex-shrink-0"
                                style={{ color: '#f59e0b' }}
                                aria-hidden="true"
                            />
                            <div className="flex-grow-1">
                                <span className="fw-bold">Enable Desktop Notifications</span>
                                <span className="text-muted ms-1 d-none d-sm-inline">
                                    — get alerted the instant your Dodo code is ready, even if you browse other tabs.
                                </span>
                            </div>
                            <button
                                className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 shadow-2xs"
                                onClick={() => {
                                    playChimeClick();
                                    requestNotificationPermission().then(setNotifGranted);
                                }}
                            >
                                Allow Notifications
                            </button>
                        </div>
                    )}

                    <div className="row g-4">
                        {/* ════ MAIN COLUMN ════ */}
                        <div className="col-12 col-lg-8">
                            {/* ── OFFLINE BANNER ── */}
                            {botUnavailable && (
                                <div className="ob-offline-banner mb-4 animate-fade" role="alert">
                                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                                        <div className="ob-pulse red" aria-hidden="true" />
                                        <div>
                                            <span className="fw-bold text-dark me-2">Order Bot is Currently Offline</span>
                                            <span className="text-muted small">
                                                You can still prepare your 40-slot pocket loadout below.
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1 fw-bold text-dark shadow-2xs d-inline-flex align-items-center gap-1 flex-shrink-0 hover-shadow-sm transition-all"
                                        onClick={() => {
                                            playChimeClick();
                                            refreshStatus();
                                        }}
                                        title="Refresh status"
                                    >
                                        <i className={`fa-solid fa-arrows-rotate ${statusLoading ? 'fa-spin text-success' : 'text-muted'}`} aria-hidden="true" />
                                        <span>Refresh</span>
                                    </button>
                                </div>
                            )}

                            {/* ══════════════════════════════════════
                                STAGE: SUBMIT (BUILD & REVIEW)
                            ══════════════════════════════════════ */}
                            {stage === 'submit' && (
                                <div className="ob-card accent-green shadow-sm mb-4">
                                    {/* Card Header */}
                                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom flex-wrap gap-2">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="ob-card-icon" aria-hidden="true">
                                                <i className="fa-solid fa-bag-shopping" />
                                            </div>
                                            <div>
                                                <h2
                                                    className="h5 fw-bold mb-0 text-dark"
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    Your 40-Slot Pocket
                                                </h2>
                                                <p className="text-muted mb-0 tiny-text">
                                                    Synced with your Command Builder & Pocket Grid
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick toolbar chips */}
                                        <div className="d-flex gap-2 flex-wrap align-items-center">
                                            <Link
                                                to="/command-builder"
                                                className="btn btn-xs btn-outline-success rounded-pill fw-bold px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-1"
                                                onClick={() => playChimeClick()}
                                            >
                                                <i className="fa-solid fa-cubes-stacked" />
                                                <span>Builder</span>
                                            </Link>
                                            <Link
                                                to="/pockets"
                                                className="btn btn-xs btn-outline-secondary rounded-pill fw-bold px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-1"
                                                onClick={() => playChimeClick()}
                                            >
                                                <i className="fa-solid fa-grip" />
                                                <span>Grid</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Quick Fill Presets Bar */}
                                    <div className="bg-light rounded-4 p-3 mb-3 border border-light-subtle">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider">
                                                <i className="fa-solid fa-wand-magic-sparkles text-warning me-1" />
                                                Quick Presets
                                            </span>
                                            {totalOrderCount > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-danger tiny-text fw-bold text-decoration-none"
                                                    onClick={() => {
                                                        playChimeClick();
                                                        setOrderItems([]);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-trash-can me-1" /> Clear All
                                                </button>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {QUICK_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-2 hover-shadow-sm transition-all"
                                                    onClick={() => handleApplyPreset(preset.fillType)}
                                                    title={`Fill pockets with ${preset.desc}`}
                                                >
                                                    <img
                                                        src={preset.icon}
                                                        alt=""
                                                        style={{ width: 18, height: 18, objectFit: 'contain' }}
                                                    />
                                                    <span className="small fw-bold text-dark">{preset.name}</span>
                                                </button>
                                            ))}
                                            {totalOrderCount > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-1 hover-shadow-sm transition-all"
                                                    onClick={() => {
                                                        playChimeClick();
                                                        handleMaximizeStacks();
                                                    }}
                                                    title="Maximize item stacks to full quantity"
                                                >
                                                    <i className="fa-solid fa-layer-group text-success" />
                                                    <span className="small fw-bold text-dark">Max Stacks</span>
                                                </button>
                                            )}
                                            {totalOrderCount > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-1 hover-shadow-sm transition-all"
                                                    onClick={() => {
                                                        playChimeClick();
                                                        handleSortPockets();
                                                    }}
                                                    title="Sort pockets alphabetically"
                                                >
                                                    <i className="fa-solid fa-arrow-down-a-z text-primary" />
                                                    <span className="small fw-bold text-dark">Sort</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Capacity Progress Bar */}
                                    <div className="d-flex align-items-center justify-content-between mb-1 tiny-text fw-bold">
                                        <span className="text-dark">
                                            {totalOrderCount} / {ORDER_MAX} Slots Used
                                        </span>
                                        <span className={capacityPct === 100 ? 'text-success fw-black' : 'text-muted'}>
                                            {capacityPct}% Full ({ORDER_MAX - totalOrderCount} slots remaining)
                                        </span>
                                    </div>
                                    <div
                                        className="progress mb-3"
                                        style={{ height: '8px', borderRadius: '10px', background: '#e5e7eb' }}
                                    >
                                        <div
                                            className={`progress-bar transition-all ${capacityPct === 100 ? 'bg-success' : 'bg-success bg-opacity-75'
                                                }`}
                                            role="progressbar"
                                            style={{ width: `${capacityPct}%` }}
                                            aria-valuenow={totalOrderCount}
                                            aria-valuemin={0}
                                            aria-valuemax={ORDER_MAX}
                                        />
                                    </div>

                                    {/* ── 40-SLOT POCKET GRID ── */}
                                    {orderItems.length === 0 ? (
                                        <div className="ob-empty-pocket my-4 text-center py-5">
                                            <div style={{ fontSize: '3.2rem', marginBottom: '.5rem' }}>🛍️</div>
                                            <h3
                                                className="h5 fw-bold mb-1 text-dark"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                Your pocket is empty
                                            </h3>
                                            <p
                                                className="text-muted small mb-4"
                                                style={{ maxWidth: 420, margin: '0 auto' }}
                                            >
                                                Pick one of the quick presets above, or open the Command Builder to
                                                search thousands of items, DIYs, and villagers.
                                            </p>
                                            <div className="d-flex gap-2 justify-content-center flex-wrap">
                                                <Link
                                                    to="/command-builder"
                                                    className="btn btn-nook text-white rounded-pill px-4 fw-bold shadow-2xs"
                                                    onClick={() => playChimeClick()}
                                                >
                                                    <i className="fa-solid fa-cubes-stacked me-1" /> Open Command
                                                    Builder
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-success rounded-pill px-4 fw-bold shadow-2xs"
                                                    onClick={() => handleApplyPreset('tickets')}
                                                >
                                                    <i className="fa-solid fa-ticket me-1" /> Load 40× NMTs
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="ob-interactive-pocket-grid mb-3">
                                            {orderItems.map((entry) => (
                                                <div
                                                    key={entry.item.id}
                                                    className="ob-interactive-tile"
                                                    title={entry.item.name}
                                                >
                                                    <img
                                                        src={entry.item.image || FALLBACK_IMG}
                                                        alt={entry.item.name}
                                                        onError={(ev) => {
                                                            (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                                                        }}
                                                    />
                                                    <span className="ob-tile-label">{entry.item.name}</span>
                                                    {entry.quantity > 1 && (
                                                        <span className="ob-tile-qty">×{entry.quantity}</span>
                                                    )}
                                                    {/* Inline adjust hover buttons */}
                                                    <div className="ob-tile-actions">
                                                        <button
                                                            type="button"
                                                            className="ob-tile-btn dec"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playChimeClick();
                                                                decreaseOrderQuantity(String(entry.item.id));
                                                            }}
                                                            title="Decrease quantity"
                                                        >
                                                            -
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="ob-tile-btn inc"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playChimeClick();
                                                                increaseOrderQuantity(String(entry.item.id));
                                                            }}
                                                            disabled={totalOrderCount >= ORDER_MAX}
                                                            title="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="ob-tile-btn del"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playChimeClick();
                                                                removeOrderItem(String(entry.item.id));
                                                            }}
                                                            title="Remove item"
                                                        >
                                                            <i className="fa-solid fa-xmark" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Terminal Command Toggle Preview */}
                                    {totalOrderCount > 0 && (
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-muted tiny-text fw-bold text-decoration-none d-flex align-items-center gap-1"
                                                    onClick={() => setShowTerminal((s) => !s)}
                                                >
                                                    <i className={`fa-solid fa-chevron-${showTerminal ? 'down' : 'right'}`} />
                                                    <span>{showTerminal ? 'Hide' : 'View'} Raw Command Strings</span>
                                                </button>

                                                {/* Multi-Format Copy Chips */}
                                                <div className="d-flex align-items-center gap-1 flex-wrap">
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-success rounded-pill fw-bold px-2 py-1 tiny-text d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleCopySpecific(orderItemsOnlyCommand || orderCommandText, '!order items')}
                                                        title="Copy !order items command"
                                                    >
                                                        <i className="fa-solid fa-copy" aria-hidden="true" />
                                                        <span>!order items</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline-info rounded-pill fw-bold px-2 py-1 tiny-text d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleCopySpecific(dropItemsOnlyCommand || dropCommandText, '!drop items')}
                                                        title="Copy !drop items command"
                                                    >
                                                        <i className="fa-solid fa-plane-arrival" aria-hidden="true" />
                                                        <span>!drop</span>
                                                    </button>
                                                    {dropVillagerCommand && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-danger rounded-pill fw-bold px-2 py-1 tiny-text d-inline-flex align-items-center gap-1"
                                                            onClick={() => handleCopySpecific(dropVillagerCommand, '!drop villager')}
                                                            title="Copy !drop <villager> command"
                                                        >
                                                            <i className="fa-solid fa-person-falling" aria-hidden="true" />
                                                            <span>!drop villager</span>
                                                        </button>
                                                    )}
                                                    {orderVillagerCommand && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-warning rounded-pill fw-bold px-2 py-1 tiny-text d-inline-flex align-items-center gap-1"
                                                            onClick={() => handleCopySpecific(orderVillagerCommand, '!order villager')}
                                                            title="Copy !order villager command"
                                                        >
                                                            <i className="fa-solid fa-user-tag" aria-hidden="true" />
                                                            <span>!order villager</span>
                                                        </button>
                                                    )}
                                                    {injectVillagerCommand && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-primary rounded-pill fw-bold px-2 py-1 tiny-text d-inline-flex align-items-center gap-1"
                                                            onClick={() => handleCopySpecific(injectVillagerCommand, '!injectvillager')}
                                                            title="Copy !injectvillager command"
                                                        >
                                                            <i className="fa-solid fa-syringe" aria-hidden="true" />
                                                            <span>!injectvillager</span>
                                                        </button>
                                                    )}
                                                    {mviVillagerCommand && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-outline-secondary rounded-pill fw-bold px-2 py-1 tiny-text d-inline-flex align-items-center gap-1"
                                                            onClick={() => handleCopySpecific(mviVillagerCommand, '!mvi')}
                                                            title="Copy !mvi command"
                                                        >
                                                            <i className="fa-solid fa-house-user" aria-hidden="true" />
                                                            <span>!mvi</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {showTerminal && (
                                                <div className="bg-dark text-light p-3 rounded-3 font-monospace small position-relative mb-3 select-all">
                                                    <div className="text-break text-success pe-5">
                                                        {orderCommandText}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-light position-absolute top-0 end-0 m-2 rounded-pill px-2 py-1 tiny-text fw-bold"
                                                        onClick={handleCopyCommand}
                                                    >
                                                        <i
                                                            className={`fa-solid ${commandCopied ? 'fa-check text-success' : 'fa-copy'
                                                                } me-1`}
                                                        />
                                                        {commandCopied ? 'Copied' : 'Copy All'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── AUTH GATE / SUBMIT BAR ── */}
                                    {!authLoading && !user ? (
                                        <div className="ob-auth-gate text-center py-4 border-top">
                                            <div style={{ fontSize: '2.5rem' }}>🔒</div>
                                            <h3
                                                className="h6 fw-bold mb-1 mt-2 text-dark"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                Discord Login Required
                                            </h3>
                                            <p
                                                className="text-muted small mb-3"
                                                style={{ maxWidth: 380, margin: '0 auto' }}
                                            >
                                                Connect with Discord to submit orders to the queue and receive your
                                                private Dodo code.
                                            </p>
                                            <button
                                                className="btn btn-primary rounded-pill fw-bold px-4 py-2 shadow-sm"
                                                onClick={login}
                                                id="ob-login-btn"
                                            >
                                                <i className="fa-brands fa-discord me-2" /> Log in with Discord
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-top pt-3 mt-3">
                                            {submitError && (
                                                <div
                                                    className="alert alert-danger py-2 d-flex align-items-center gap-2 mb-3 rounded-3 small"
                                                    role="alert"
                                                >
                                                    <i
                                                        className="fa-solid fa-circle-exclamation flex-shrink-0 fs-5"
                                                        aria-hidden="true"
                                                    />
                                                    <span>{submitError}</span>
                                                </div>
                                            )}

                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                                <button
                                                    id="ob-send-order-btn"
                                                    className="btn btn-nook text-white fw-bold rounded-pill px-4 py-3 shadow-sm d-inline-flex align-items-center gap-2"
                                                    onClick={handleSubmit}
                                                    disabled={!canSubmit}
                                                    aria-busy={submitLoading}
                                                    style={{ fontSize: '1.05rem', minWidth: 200 }}
                                                >
                                                    {submitLoading ? (
                                                        <>
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                aria-hidden="true"
                                                            />
                                                            <span>Submitting Order…</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                                                            <span>
                                                                Send Order ({totalOrderCount} Item
                                                                {totalOrderCount === 1 ? '' : 's'})
                                                            </span>
                                                        </>
                                                    )}
                                                </button>

                                                {!botAvailable && !statusLoading && (
                                                    <span className="text-dark small fw-bold bg-warning bg-opacity-10 px-3 py-1 rounded-pill border border-warning border-opacity-30">
                                                        <i className="fa-solid fa-moon text-warning me-1" aria-hidden="true" />
                                                        Bot is resting • Copy !order command for Discord
                                                    </span>
                                                )}
                                                {totalOrderCount === 0 && user && (
                                                    <span className="text-muted small">
                                                        <i className="fa-solid fa-info-circle me-1" />
                                                        Add at least 1 item to submit your order.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ══════════════════════════════════════
                                STAGE: TRACKER (LIVE RADAR & DODO)
                            ══════════════════════════════════════ */}
                            {stage === 'tracker' && (
                                <div className="ob-card accent-green shadow-sm mb-4 animate-fade">
                                    {/* Top status bar */}
                                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom flex-wrap gap-2">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="ob-card-icon blue" aria-hidden="true">
                                                <i className="fa-solid fa-satellite-dish" />
                                            </div>
                                            <div>
                                                <h2
                                                    className="h5 fw-bold mb-0 text-dark"
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    Order Flight Tracker
                                                </h2>
                                                {activeOrderId && (
                                                    <p
                                                        className="text-muted mb-0 font-monospace"
                                                        style={{ fontSize: '.72rem' }}
                                                    >
                                                        Order #{activeOrderId}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {!isDone && !isReady && (
                                            <button
                                                id="ob-cancel-btn"
                                                className="btn btn-sm btn-outline-danger rounded-pill fw-bold px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-1"
                                                onClick={handleCancel}
                                                disabled={cancelLoading}
                                                aria-label="Cancel order"
                                            >
                                                {cancelLoading ? (
                                                    <span
                                                        className="spinner-border spinner-border-sm"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                                                        <span>Cancel Order</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Order State Progression Bar */}
                                    <div className="ob-order-progress-steps mb-4">
                                        <div className="ob-prog-step active">
                                            <div className="ob-prog-dot">
                                                <i className="fa-solid fa-check" />
                                            </div>
                                            <span className="ob-prog-text">Submitted</span>
                                        </div>
                                        <div
                                            className={`ob-prog-step ${['queued', 'preparing', 'ready', 'completed'].includes(statusStr)
                                                    ? 'active'
                                                    : ''
                                                }`}
                                        >
                                            <div className="ob-prog-dot">
                                                {statusStr === 'queued' ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : (
                                                    <i className="fa-solid fa-check" />
                                                )}
                                            </div>
                                            <span className="ob-prog-text">
                                                {typeof orderStatus?.queuePosition === 'number'
                                                    ? `In Queue (#${orderStatus.queuePosition})`
                                                    : 'In Queue'}
                                            </span>
                                        </div>
                                        <div
                                            className={`ob-prog-step ${['preparing', 'ready', 'completed'].includes(statusStr) ? 'active' : ''
                                                }`}
                                        >
                                            <div className="ob-prog-dot">
                                                {statusStr === 'preparing' ? (
                                                    <i className="fa-solid fa-gears fa-spin" />
                                                ) : isReady || statusStr === 'completed' ? (
                                                    <i className="fa-solid fa-check" />
                                                ) : (
                                                    <i className="fa-solid fa-box" />
                                                )}
                                            </div>
                                            <span className="ob-prog-text">Preparing Items</span>
                                        </div>
                                        <div
                                            className={`ob-prog-step ${isReady || statusStr === 'completed' ? 'active ready-step' : ''
                                                }`}
                                        >
                                            <div className="ob-prog-dot">
                                                {isReady ? (
                                                    <i className="fa-solid fa-plane-arrival" />
                                                ) : (
                                                    <i className="fa-solid fa-ticket" />
                                                )}
                                            </div>
                                            <span className="ob-prog-text">Dodo Ready</span>
                                        </div>
                                    </div>

                                    {/* Metrics strip */}
                                    {!isReady && !isDone && orderStatus && (
                                        <div className="row g-3 mb-4">
                                            {typeof orderStatus.queuePosition === 'number' && (
                                                <div className="col-6">
                                                    <div className="bg-light rounded-4 p-3 border text-center">
                                                        <div className="tiny-text text-muted fw-bold text-uppercase">
                                                            Your Position
                                                        </div>
                                                        <div
                                                            className="h2 fw-black text-success mb-0"
                                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                                        >
                                                            #{orderStatus.queuePosition}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {orderStatus.estimatedMinutes !== undefined && (
                                                <div className="col-6">
                                                    <div className="bg-light rounded-4 p-3 border text-center">
                                                        <div className="tiny-text text-muted fw-bold text-uppercase">
                                                            Estimated Wait
                                                        </div>
                                                        <div
                                                            className="h2 fw-black text-dark mb-0"
                                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                                        >
                                                            {fmtEta(orderStatus.estimatedMinutes)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Browser Notification Prompt */}
                                    {!isReady && !isDone && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
                                        <div className="alert alert-warning border-warning-subtle rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-2xs">
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="fa-solid fa-bell text-warning fs-5"></i>
                                                <div>
                                                    <strong className="d-block text-dark small fw-bold">Get notified when your Dodo is ready</strong>
                                                    <span className="tiny-text text-muted">We'll alert your browser so you don't miss your flight.</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-warning text-dark rounded-pill fw-bold px-3 shadow-2xs"
                                                onClick={async () => {
                                                    playChimeClick();
                                                    const res = await Notification.requestPermission();
                                                    setNotifGranted(res === 'granted');
                                                }}
                                            >
                                                <i className="fa-solid fa-bell me-1"></i>Enable Alerts
                                            </button>
                                        </div>
                                    )}

                                    {/* ── BOARDING PASS / DODO CODE REVEAL CARD ── */}
                                    {isReady && orderStatus?.dodoCode && (
                                        <div className="ob-boarding-pass-card mb-4 shadow-sm" role="status" aria-live="polite">
                                            <div className="ob-pass-header d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="fa-solid fa-plane-departure text-warning fs-4" />
                                                    <div>
                                                        <span className="ob-pass-badge">DODO AIRLINES EXPRESS</span>
                                                        <h3 className="h5 fw-black text-white mb-0">
                                                            🏝️ Fly to {orderStatus.islandName || 'Order Island'}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <span className="badge bg-white text-success rounded-pill fw-black px-3 py-1">
                                                    READY FOR PICKUP
                                                </span>
                                            </div>

                                            <div className="ob-pass-body text-center py-4">
                                                <div className="tiny-text text-muted fw-bold text-uppercase tracking-wider mb-1">
                                                    Your Private Dodo Code™
                                                </div>
                                                <div className="ob-pass-dodo-display">{orderStatus.dodoCode}</div>

                                                <div className="d-flex justify-content-center gap-2 mt-3">
                                                    <button
                                                        id="ob-copy-dodo-btn"
                                                        className={`btn btn-lg rounded-pill fw-black px-5 py-3 shadow-sm d-inline-flex align-items-center gap-2 ${dodoCopied ? 'btn-success text-white' : 'btn-nook text-white'
                                                            }`}
                                                        onClick={handleCopyDodo}
                                                        aria-label={
                                                            dodoCopied
                                                                ? 'Dodo code copied'
                                                                : `Copy Dodo code ${orderStatus.dodoCode}`
                                                        }
                                                    >
                                                        <i
                                                            className={`fa-solid ${dodoCopied ? 'fa-check' : 'fa-copy'}`}
                                                            aria-hidden="true"
                                                        />
                                                        <span>{dodoCopied ? 'Copied to Clipboard!' : 'Copy Dodo Code'}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="ob-pass-footer bg-light p-3 border-top rounded-bottom-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                <div className="d-flex align-items-center gap-2 tiny-text text-muted">
                                                    <i className="fa-solid fa-circle-info text-primary" />
                                                    <span>Talk to Orville → "I wanna fly!" → "Via online play" → "Dodo Code™"</span>
                                                </div>
                                                <span className="font-monospace text-muted tiny-text">
                                                    Gate Pass: #{activeOrderId?.slice(0, 10)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message alert if any */}
                                    {orderStatus?.message && (
                                        <div className="alert alert-info py-2 small d-flex align-items-center gap-2 mb-3 rounded-3">
                                            <i className="fa-solid fa-circle-info text-primary flex-shrink-0" />
                                            <span>{orderStatus.message}</span>
                                        </div>
                                    )}

                                    {/* Polling live ticker */}
                                    {!isDone && !isReady && (
                                        <div className="ob-polling d-flex align-items-center gap-2 text-muted tiny-text mb-3">
                                            <span
                                                className="spinner-border spinner-border-sm text-success"
                                                style={{ width: 12, height: 12 }}
                                            />
                                            <span>Syncing live radar every {POLL_MS / 1000}s…</span>
                                        </div>
                                    )}

                                    {/* Completion actions */}
                                    {(isDone || isReady) && (
                                        <div className="d-flex gap-2 flex-wrap pt-2 border-top">
                                            <button
                                                id="ob-new-order-btn"
                                                className="btn btn-nook text-white rounded-pill px-4 py-2 fw-bold shadow-2xs"
                                                onClick={handleReset}
                                            >
                                                <i className="fa-solid fa-rotate-left me-1" /> Place Another Order
                                            </button>
                                            <Link
                                                to="/command-builder"
                                                className="btn btn-outline-success rounded-pill px-4 py-2 fw-bold shadow-2xs"
                                                onClick={() => playChimeClick()}
                                            >
                                                <i className="fa-solid fa-pencil me-1" /> Edit Pocket
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ════ SIDEBAR ════ */}
                        <div className="col-12 col-lg-4">
                            {/* ── Quick Tools ── */}
                            <div className="ob-card shadow-sm mb-3">
                                <div className="ob-card-head mb-3">
                                    <div className="ob-card-icon" aria-hidden="true">
                                        <i className="fa-solid fa-compass" />
                                    </div>
                                    <div>
                                        <h3
                                            className="h6 fw-bold mb-0 text-dark"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Order Tools & Nav
                                        </h3>
                                        <p className="text-muted mb-0 tiny-text">Quick island & pocket actions</p>
                                    </div>
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    <button
                                        type="button"
                                        className="btn ob-tool-link text-start"
                                        onClick={handleOpenHistoryModal}
                                    >
                                        <div className="ob-tool-icon">
                                            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="fw-bold small text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                Order History
                                            </div>
                                            <div className="tiny-text text-muted">1-click reorder past pockets</div>
                                        </div>
                                    </button>

                                    <Link
                                        to="/command-builder"
                                        className="ob-tool-link"
                                        onClick={() => playChimeClick()}
                                    >
                                        <div className="ob-tool-icon">
                                            <i className="fa-solid fa-cubes-stacked" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="fw-bold small text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                Command Builder
                                            </div>
                                            <div className="tiny-text text-muted">Search catalog & add items</div>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/pockets"
                                        className="ob-tool-link"
                                        onClick={() => playChimeClick()}
                                    >
                                        <div className="ob-tool-icon">
                                            <i className="fa-solid fa-grip" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="fw-bold small text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                Pocket Inventory
                                            </div>
                                            <div className="tiny-text text-muted">Drag & drop pocket loadouts</div>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/islands"
                                        className="ob-tool-link"
                                        onClick={() => playChimeClick()}
                                    >
                                        <div className="ob-tool-icon">
                                            <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="fw-bold small text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                Treasure Islands
                                            </div>
                                            <div className="tiny-text text-muted">Explore free public islands</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* ── Live Queue Drawer ── */}
                            <div className="ob-card shadow-sm mb-3">
                                <button
                                    id="ob-queue-toggle"
                                    className="d-flex align-items-center justify-content-between w-100 bg-transparent border-0 p-0"
                                    onClick={() => {
                                        playChimeClick();
                                        setQueueOpen((o) => !o);
                                    }}
                                    aria-expanded={queueOpen}
                                    aria-controls="ob-queue-panel"
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="ob-card-icon"
                                            style={{ width: 34, height: 34, borderRadius: 10, fontSize: '.85rem' }}
                                        >
                                            <i className="fa-solid fa-list-ol" />
                                        </div>
                                        <div className="text-start">
                                            <span
                                                className="fw-bold small d-block text-dark"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                Live Order Queue
                                            </span>
                                            <span className="tiny-text text-muted">
                                                {typeof botStatus?.queue_count === 'number'
                                                    ? `${botStatus.queue_count} players waiting`
                                                    : 'Check queue'}
                                            </span>
                                        </div>
                                    </div>
                                    <i
                                        className={`fa-solid fa-chevron-${queueOpen ? 'up' : 'down'} text-muted small`}
                                        aria-hidden="true"
                                    />
                                </button>

                                {queueOpen && (
                                    <div id="ob-queue-panel" className="mt-3 pt-3 border-top animate-fade">
                                        {queue.length === 0 ? (
                                            <div className="text-center py-3 text-muted small">
                                                <span
                                                    className="spinner-border spinner-border-sm me-1 text-success"
                                                    aria-hidden="true"
                                                />
                                                Loading queue list…
                                            </div>
                                        ) : (
                                            <QueueList queue={queue} myOrderId={activeOrderId ?? undefined} />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Flight Steps Guide ── */}
                            <div className="ob-card shadow-sm">
                                <div className="ob-card-head mb-3">
                                    <div
                                        className="ob-card-icon"
                                        style={{ width: 34, height: 34, borderRadius: 10, fontSize: '.85rem' }}
                                    >
                                        <i className="fa-solid fa-circle-question" />
                                    </div>
                                    <span
                                        className="fw-bold small text-dark"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        How Ordering Works
                                    </span>
                                </div>
                                {[
                                    {
                                        icon: 'fa-cubes-stacked',
                                        title: '1. Build Pockets',
                                        text: 'Pick up to 40 items in Command Builder or load presets.',
                                    },
                                    {
                                        icon: 'fa-paper-plane',
                                        title: '2. Send Order',
                                        text: 'Click Send Order to join the live bot dispatch queue.',
                                    },
                                    {
                                        icon: 'fa-satellite-dish',
                                        title: '3. Track Radar',
                                        text: 'Watch your queue position & estimated wait time.',
                                    },
                                    {
                                        icon: 'fa-plane',
                                        title: '4. Fly In',
                                        text: 'Enter your personal Dodo code at Dodo Airlines to collect.',
                                    },
                                ].map((step, i) => (
                                    <div key={i} className="d-flex align-items-start gap-2 mb-2">
                                        <div className="ob-how-num" aria-hidden="true">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <strong className="d-block tiny-text text-dark">{step.title}</strong>
                                            <span className="text-muted tiny-text">{step.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* ══════════════════════════════════════
                    IN-ISLAND DROP BOT (9 SLOTS)
                ══════════════════════════════════════ */
                <div className="row g-4 animate-fade">
                    {/* ════ MAIN DROP COLUMN ════ */}
                    <div className="col-12 col-lg-8">

                        {/* ── STEP 1: SELECT DESTINATION SUB MEMBER ISLAND ── */}
                        <div className="ob-card accent-green shadow-sm mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="ob-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                                        <i className="fa-solid fa-crown" />
                                    </div>
                                    <div>
                                        <h2 className="h5 fw-bold mb-0 text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            1. Select Destination Sub Member Island
                                        </h2>
                                        <p className="text-muted mb-0 tiny-text">
                                            Select a Sub Member island to receive your in-game item drops
                                        </p>
                                    </div>
                                </div>

                                {/* Filter Pills */}
                                <div className="d-flex gap-1 bg-light p-1 rounded-pill border">
                                    <button
                                        type="button"
                                        onClick={() => { setDropFilter('all'); playChimeClick(); }}
                                        className={`btn btn-xs rounded-pill fw-bold px-3 py-1 transition-all ${
                                            dropFilter === 'all' ? 'btn-dark text-white shadow-2xs' : 'text-muted border-0'
                                        }`}
                                        style={{ fontSize: '0.72rem' }}
                                    >
                                        All Sub Islands ({subMemberIslands.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setDropFilter('unlocked'); playChimeClick(); }}
                                        className={`btn btn-xs rounded-pill fw-bold px-3 py-1 transition-all ${
                                            dropFilter === 'unlocked' ? 'btn-dark text-white shadow-2xs' : 'text-muted border-0'
                                        }`}
                                        style={{ fontSize: '0.72rem' }}
                                    >
                                        <i className="fa-solid fa-crown me-1 text-warning"></i>
                                        My Sub Islands ({subMemberIslands.filter(i => !!user && canAccessIsland(i.requiredRoles)).length})
                                    </button>
                                </div>
                            </div>

                            {/* Sub Requirement Notice for Guest / Non-Sub */}
                            {(!user || subMemberIslands.every(i => !user || !canAccessIsland(i.requiredRoles))) && (
                                <div className="alert alert-warning rounded-4 border-0 p-3 mb-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 shadow-2xs">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-crown text-warning fs-5 flex-shrink-0"></i>
                                        <span className="small fw-bold text-dark">
                                            {user ? 'You do not currently have an active Sub Member subscription tier.' : 'Log in with your Discord account to access your Sub Islands.'}
                                        </span>
                                    </div>
                                    {user ? (
                                        <Link to="/membership" className="btn btn-sm btn-dark rounded-pill fw-bold px-3 text-nowrap">
                                            View Memberships
                                        </Link>
                                    ) : (
                                        <button type="button" onClick={login} className="btn btn-sm btn-dark rounded-pill fw-bold px-3 text-nowrap">
                                            <i className="fa-brands fa-discord me-1"></i> Log In
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Island Dropdown Selector */}
                            {islandsLoading ? (
                                <div className="text-center py-4 text-muted">
                                    <span className="spinner-border spinner-border-sm text-success me-2" />
                                    <span>Loading Sub Member islands…</span>
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase tracking-wider d-flex align-items-center justify-content-between">
                                        <span>
                                            <i className="fa-solid fa-tree text-success me-1"></i> Choose Sub Island:
                                        </span>
                                        {selectedDropIsland && (
                                            <span className="text-success fw-bold tiny-text">
                                                <i className="fa-solid fa-circle-check me-1"></i> Selected: {selectedDropIsland.name}
                                            </span>
                                        )}
                                    </label>
                                    <select
                                        className="form-select form-select-lg rounded-4 border-2 shadow-2xs fw-bold text-dark"
                                        style={{ fontSize: '0.95rem', borderColor: selectedDropIsland ? '#86efac' : '#e2e8f0' }}
                                        value={selectedDropIsland?.id || ''}
                                        onChange={(e) => {
                                            const found = subMemberIslands.find((isl) => isl.id === e.target.value);
                                            if (found) {
                                                const hasAccess = !!user && canAccessIsland(found.requiredRoles);
                                                if (!hasAccess) {
                                                    if (!user) {
                                                        login();
                                                    } else {
                                                        triggerInAppToast({
                                                            type: 'warning',
                                                            title: 'Sub Pass Required',
                                                            message: `You do not have access to ${found.name}. Requires an active Sub Member tier.`,
                                                        });
                                                    }
                                                    return;
                                                }
                                                setSelectedDropIsland(found);
                                                setDropDodoCode(null);
                                                setDropDodoError(null);
                                                setAlreadyOnIsland(false);
                                                setDropSuccessMsg(null);
                                                setDropErrorMsg(null);
                                                playChimeClick();
                                            } else {
                                                setSelectedDropIsland(null);
                                                setDropDodoCode(null);
                                                setDropDodoError(null);
                                                setAlreadyOnIsland(false);
                                            }
                                        }}
                                    >
                                        <option value="">-- Select a Sub Member Island --</option>
                                        
                                        {/* My Accessible group */}
                                        {availableDropIslands.filter(i => !!user && canAccessIsland(i.requiredRoles)).length > 0 && (
                                            <optgroup label="👑 My Sub Member Islands">
                                                {availableDropIslands
                                                    .filter(i => !!user && canAccessIsland(i.requiredRoles))
                                                    .map(isl => (
                                                        <option key={isl.id} value={isl.id}>
                                                            {isl.name} · {isl.type || 'Treasure Island'} ({isl.visitors ?? 0}/7 Flying)
                                                        </option>
                                                    ))}
                                            </optgroup>
                                        )}

                                        {/* Other group if filter is 'all' */}
                                        {dropFilter === 'all' && availableDropIslands.filter(i => !user || !canAccessIsland(i.requiredRoles)).length > 0 && (
                                            <optgroup label="🔒 Other Sub Member Islands (Requires Subscription)">
                                                {availableDropIslands
                                                    .filter(i => !user || !canAccessIsland(i.requiredRoles))
                                                    .map(isl => (
                                                        <option key={isl.id} value={isl.id}>
                                                            {isl.name} · {isl.type || 'Treasure Island'} ({isl.visitors ?? 0}/7 Flying)
                                                        </option>
                                                    ))}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>
                            )}

                            {/* Selected Island Banner Preview */}
                            {selectedDropIsland && (
                                <div className="animate-up mt-3">
                                    <div className="ob-island-sub-card selected p-0 overflow-hidden shadow-sm border-2">
                                        <div className="ob-island-card-banner position-relative" style={{ height: '140px' }}>
                                            <img
                                                src={selectedDropIsland.mapUrl || `https://cdn.chopaeng.com/maps/${selectedDropIsland.name.toLowerCase()}.png`}
                                                alt={selectedDropIsland.name}
                                                className="ob-island-card-img w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><text x='50%' y='65%' font-size='40' text-anchor='middle' fill='%2352b788'>MAP</text></svg>";
                                                }}
                                            />
                                            <div className="ob-island-banner-overlay" />

                                            {/* Floating Badges */}
                                            <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                                                <span className="badge bg-dark bg-opacity-75 text-white rounded-pill x-small fw-bold border border-secondary border-opacity-50">
                                                    <i className="fa-solid fa-crown text-warning me-1"></i> SUB MEMBER
                                                </span>
                                            </div>

                                            <div className="position-absolute top-0 end-0 m-2">
                                                <span className="badge bg-success text-white rounded-pill px-2 py-1 shadow-2xs x-small fw-bold">
                                                    <i className="fa-solid fa-check me-1"></i> TARGET SET
                                                </span>
                                            </div>

                                            <div className="position-absolute bottom-0 start-0 m-3">
                                                <strong className="text-white h5 mb-0 fw-black text-truncate d-block drop-shadow-sm">
                                                    {selectedDropIsland.name}
                                                </strong>
                                                <span className="tiny-text text-white-50">
                                                    {selectedDropIsland.type || 'Treasure Island'} · {selectedDropIsland.visitors ?? 0}/7 Flying
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="fa-solid fa-circle-check text-success fs-5"></i>
                                                <div>
                                                    <strong className="d-block text-dark small fw-bold">Ready for Flight Pass</strong>
                                                    <span className="tiny-text text-muted">Proceed to Step 2 below to retrieve Dodo code</span>
                                                </div>
                                            </div>
                                            <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 fw-bold x-small border border-success">
                                                ACCESS GRANTED
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── STEP 2: GET DODO FLIGHT PASS & LOG VIA WEBHOOK ── */}
                        {selectedDropIsland && (
                            <div className="ob-dodo-flight-pass mb-4 animate-up">
                                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle bg-success bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                            <i className="fa-solid fa-plane-departure text-warning fs-6" />
                                        </div>
                                        <div>
                                            <h2 className="h6 fw-black mb-0 text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em' }}>
                                                2. Flight Pass & On-Island Presence
                                            </h2>
                                            <span className="tiny-text text-white-50">Fly in via Dodo Airlines or confirm you're already landed</span>
                                        </div>
                                    </div>
                                    <span className={`badge rounded-pill px-3 py-1 fw-black x-small ${
                                        alreadyOnIsland ? 'bg-success text-white' : dropDodoCode ? 'bg-warning text-dark' : 'bg-secondary text-white'
                                    }`}>
                                        <i className={`fa-solid ${alreadyOnIsland ? 'fa-circle-check' : 'fa-plane'} me-1`}></i>
                                        {alreadyOnIsland ? 'ON-SITE CONFIRMED' : dropDodoCode ? 'FLIGHT PASS ACTIVE' : 'LOGGING REQUIRED'}
                                    </span>
                                </div>

                                <div className="bg-black bg-opacity-30 rounded-4 p-3 border border-white border-opacity-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                                    <div>
                                        <span className="tiny-text text-uppercase text-white-50 fw-bold d-block mb-1 tracking-wider">
                                            Destination · {selectedDropIsland.name}
                                        </span>
                                        {alreadyOnIsland ? (
                                            <div className="d-flex align-items-center gap-2 text-success fw-black py-1">
                                                <i className="fa-solid fa-location-dot fs-5 text-success"></i>
                                                <span>Landed on {selectedDropIsland.name} (Ready to Drop)</span>
                                            </div>
                                        ) : dropDodoCode ? (
                                            <div className="ob-dodo-code-chip">
                                                <i className="fa-solid fa-ticket text-warning fs-5"></i>
                                                <span>{dropDodoCode}</span>
                                            </div>
                                        ) : (
                                            <div className="text-white-50 small font-monospace py-1">
                                                <i className="fa-solid fa-lock me-1"></i> Get code to fly in, or click if already on island
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        {dropDodoCode ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCopyDropIslandDodo(dropDodoCode)}
                                                className={`btn rounded-pill fw-black px-4 py-2 shadow-sm d-flex align-items-center gap-2 transition-all ${
                                                    dropDodoCopied ? 'btn-success text-white' : 'btn-warning text-dark hover-scale'
                                                }`}
                                            >
                                                {dropDodoCopied ? (
                                                    <><i className="fa-solid fa-check"></i> Copied to Clipboard!</>
                                                ) : (
                                                    <><i className="fa-solid fa-copy"></i> Copy Flight Code</>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={dropDodoLoading}
                                                onClick={() => handleGetDropIslandDodo(selectedDropIsland)}
                                                className="btn btn-warning text-dark rounded-pill fw-black px-3 py-2 shadow-sm d-flex align-items-center gap-2 hover-scale transition-all"
                                            >
                                                {dropDodoLoading ? (
                                                    <><span className="spinner-border spinner-border-sm" /> Logging & Retrieving…</>
                                                ) : (
                                                    <><i className="fa-solid fa-key"></i> Get Dodo Code</>
                                                )}
                                            </button>
                                        )}

                                        {/* "Already on Island" Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                playChimeClick();
                                                setAlreadyOnIsland(true);
                                                if (!dropDodoCode) {
                                                    // Fire webhook in background so arrival is logged
                                                    handleGetDropIslandDodo(selectedDropIsland);
                                                }
                                                triggerInAppToast({
                                                    type: 'success',
                                                    title: 'Island Presence Confirmed',
                                                    message: `Confirmed on ${selectedDropIsland.name}! Proceed to Step 3 to drop items.`,
                                                });
                                            }}
                                            className={`btn rounded-pill fw-black px-3 py-2 shadow-sm d-flex align-items-center gap-2 transition-all ${
                                                alreadyOnIsland
                                                    ? 'btn-success text-white'
                                                    : 'btn-outline-light text-white hover-scale'
                                            }`}
                                        >
                                            <i className={`fa-solid ${alreadyOnIsland ? 'fa-check-double' : 'fa-location-dot'}`}></i>
                                            <span>{alreadyOnIsland ? "Already On Island (Confirmed)" : "I'm Already on the Island"}</span>
                                        </button>
                                    </div>
                                </div>

                                {dropDodoError && (
                                    <div className="alert alert-danger rounded-4 mt-3 mb-0 p-2 d-flex align-items-center justify-content-between gap-2 shadow-2xs">
                                        <div className="d-flex align-items-center gap-2 tiny-text fw-bold">
                                            <i className="fa-solid fa-triangle-exclamation"></i>
                                            <span>{dropDodoError}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleGetDropIslandDodo(selectedDropIsland)}
                                            className="btn btn-xs btn-outline-danger rounded-pill fw-bold px-2 py-1"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}

                                {(dropDodoCode || alreadyOnIsland) && (
                                    <div className="mt-2 tiny-text text-white-50 d-flex align-items-center gap-1">
                                        <i className="fa-solid fa-circle-check text-success"></i>
                                        <span>
                                            {alreadyOnIsland
                                                ? `Island presence confirmed for ${selectedDropIsland.name}. Stand in front of airport gate to drop.`
                                                : `Flight pass logged via Discord webhook. Fly to ${selectedDropIsland.name} before dropping!`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── STEP 3: DROP ITEMS DESIGNER (9 SLOTS) ── */}
                        <div className="ob-card shadow-sm mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="ob-card-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                                        <i className="fa-solid fa-boxes-stacked" />
                                    </div>
                                    <div>
                                        <h2 className="h5 fw-bold mb-0 text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            3. Select Drop Items (Max {DROP_MAX} Slots)
                                        </h2>
                                        <p className="text-muted mb-0 tiny-text">
                                            Items dropped instantly at the island airport landing zone
                                        </p>
                                    </div>
                                </div>

                                {/* Clear Button */}
                                {totalDropCount > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 text-danger tiny-text fw-bold text-decoration-none"
                                        onClick={() => {
                                            playChimeClick();
                                            setDropItems([]);
                                        }}
                                    >
                                        <i className="fa-solid fa-trash-can me-1" /> Clear Drop Pocket
                                    </button>
                                )}
                            </div>

                            {/* Warning if Dodo Code not retrieved yet and not on island */}
                            {selectedDropIsland && !dropDodoCode && !alreadyOnIsland && (
                                <div className="alert alert-info rounded-4 border-0 p-3 mb-3 d-flex align-items-center gap-2 tiny-text fw-bold shadow-2xs">
                                    <i className="fa-solid fa-circle-info fs-6 flex-shrink-0 text-primary"></i>
                                    <span>Please click <strong>Get Dodo Code</strong> or <strong>I'm Already on the Island</strong> in Step 2 before dropping items.</span>
                                </div>
                            )}

                            {/* Quick Fill Drop Presets Bar */}
                            <div className="bg-light rounded-4 p-3 mb-3 border border-light-subtle">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="tiny-text fw-bold text-muted text-uppercase tracking-wider">
                                        <i className="fa-solid fa-wand-magic-sparkles text-warning me-1" />
                                        Quick Drop Presets
                                    </span>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    {DROP_QUICK_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1 shadow-2xs d-inline-flex align-items-center gap-2 hover-shadow-sm transition-all"
                                            onClick={() => handleApplyDropPreset(preset.fillType)}
                                            title={`Load 9× ${preset.name}`}
                                        >
                                            <img
                                                src={preset.icon}
                                                alt=""
                                                style={{ width: 18, height: 18, objectFit: 'contain' }}
                                            />
                                            <span className="small fw-bold text-dark">{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 9-Slot Drop Grid */}
                            {dropItems.length === 0 ? (
                                <div className="ob-empty-pocket my-4 text-center py-5">
                                    <div style={{ fontSize: '3rem' }} className="mb-2">📦</div>
                                    <h3 className="h6 fw-bold mb-1 text-dark">Your drop pocket is empty</h3>
                                    <p className="text-muted small mb-3" style={{ maxWidth: 380, margin: '0 auto' }}>
                                        Choose one of the quick drop presets above, or load items from Command Builder.
                                    </p>
                                    <Link
                                        to="/command-builder"
                                        className="btn btn-sm btn-outline-primary rounded-pill px-4 fw-bold shadow-2xs"
                                        onClick={() => playChimeClick()}
                                    >
                                        <i className="fa-solid fa-cubes-stacked me-1" /> Open Command Builder
                                    </Link>
                                </div>
                            ) : (
                                <div className="row g-2 mb-3">
                                    {dropItems.map((entry) => (
                                        <div key={entry.item.id} className="col-4 col-sm-3 col-md-4">
                                            <div className="ob-drop-slot-tile h-100">
                                                <img
                                                    src={entry.item.image || FALLBACK_IMG}
                                                    alt={entry.item.name}
                                                    style={{ width: 44, height: 44, objectFit: 'contain' }}
                                                    onError={(ev) => {
                                                        (ev.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                                                    }}
                                                />
                                                <span className="tiny-text fw-bold text-dark text-truncate w-100 mt-1" title={entry.item.name}>
                                                    {entry.item.name}
                                                </span>
                                                <div className="d-flex align-items-center gap-1 mt-1">
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-light border rounded-circle"
                                                        style={{ width: 22, height: 22, padding: 0 }}
                                                        onClick={() => { playChimeClick(); decreaseDropQuantity(entry.item.id); }}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="small fw-black text-primary px-1">×{entry.quantity}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-light border rounded-circle"
                                                        style={{ width: 22, height: 22, padding: 0 }}
                                                        onClick={() => { playChimeClick(); increaseDropQuantity(entry.item.id); }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-muted hover-text-danger position-absolute top-0 end-0 m-1"
                                                    onClick={() => { playChimeClick(); removeDropItem(entry.item.id); }}
                                                    title="Remove item"
                                                >
                                                    <i className="fa-solid fa-xmark small" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Drop Bot Offline Guidance Banner */}
                            <div className="alert alert-warning rounded-4 border-0 p-3 mt-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow-2xs">
                                <div className="d-flex align-items-start gap-2">
                                    <i className="fa-solid fa-moon text-warning fs-5 flex-shrink-0 mt-1"></i>
                                    <div>
                                        <strong className="d-block text-dark small fw-bold">Drop Bot is Currently Offline</strong>
                                        <span className="tiny-text text-muted">
                                            SysBot direct web dispatch is not set up yet. Use Discord for now to drop items on your Sub Island.
                                        </span>
                                    </div>
                                </div>
                                {dropCommandText && (
                                    <button
                                        type="button"
                                        onClick={handleCopyDropForDiscord}
                                        className="btn btn-sm btn-dark rounded-pill fw-bold px-3 text-nowrap d-flex align-items-center gap-2 hover-scale"
                                    >
                                        <i className="fa-solid fa-copy"></i> Copy !drop for Discord
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ════ SIDEBAR: DROP DISPATCH RADAR ════ */}
                    <div className="col-12 col-lg-4">
                        <div className="ob-radar-card sticky-top" style={{ top: '1.5rem' }}>
                            {/* Radar Header */}
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="ob-card-icon" style={{ width: 34, height: 34, background: '#fffbeb', color: '#d97706' }}>
                                        <i className="fa-solid fa-satellite-dish fa-spin-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="h6 fw-black mb-0 text-dark" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.04em' }}>
                                            DROP RADAR
                                        </h3>
                                        <span className="tiny-text text-muted">In-Game Telemetry</span>
                                    </div>
                                </div>
                                <span className="ob-radar-badge-pulse">
                                    <span className="ob-radar-dot" /> LIVE
                                </span>
                            </div>

                            {/* Offline SysBot Notice inside Radar */}
                            <div className="bg-warning bg-opacity-10 border border-warning border-opacity-30 rounded-4 p-2 px-3 mb-3 text-center">
                                <span className="text-dark small fw-bold d-block">
                                    <i className="fa-solid fa-moon text-warning me-1"></i> Drop Bot is Currently Offline
                                </span>
                                <span className="tiny-text text-muted">
                                    Use Discord for now to drop items on-island.
                                </span>
                            </div>

                            {/* Target Island HUD Screen */}
                            <div className={`ob-radar-hud-box mb-3 ${selectedDropIsland ? 'active' : ''}`}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="tiny-text fw-bold text-uppercase text-muted tracking-wider">
                                        <i className="fa-solid fa-crosshairs me-1 text-primary"></i> Target Coordinates
                                    </span>
                                    {selectedDropIsland && (
                                        <span className="badge bg-light text-dark border rounded-pill x-small fw-bold">
                                            {selectedDropIsland.visitors ?? 0}/7 Flying
                                        </span>
                                    )}
                                </div>

                                {selectedDropIsland ? (
                                    <div>
                                        <div className="d-flex align-items-center justify-content-between mt-1">
                                            <strong className="text-dark fs-6 fw-black text-truncate d-block">
                                                {selectedDropIsland.name}
                                            </strong>
                                            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill x-small fw-bold border border-warning-subtle">
                                                {selectedDropIsland.type || 'Treasure Island'}
                                            </span>
                                        </div>

                                        <div className="mt-2 pt-2 border-top d-flex align-items-center justify-content-between tiny-text">
                                            <span className="text-muted">Presence:</span>
                                            {alreadyOnIsland ? (
                                                <span className="text-success fw-bold d-inline-flex align-items-center gap-1">
                                                    <i className="fa-solid fa-circle-check"></i> On-Site Confirmed
                                                </span>
                                            ) : dropDodoCode ? (
                                                <span className="text-primary fw-bold d-inline-flex align-items-center gap-1">
                                                    <i className="fa-solid fa-ticket"></i> Pass Logged ({dropDodoCode})
                                                </span>
                                            ) : (
                                                <span className="text-muted fw-bold d-inline-flex align-items-center gap-1">
                                                    <i className="fa-solid fa-clock"></i> Logging Required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted small py-1">
                                        <i className="fa-solid fa-location-dot me-1 text-secondary"></i>
                                        No island locked. Select destination in Step 1.
                                    </div>
                                )}
                            </div>

                            {/* Drop Slot Capacity Progress Bar */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="tiny-text fw-bold text-uppercase text-muted tracking-wider">
                                        <i className="fa-solid fa-box me-1 text-success"></i> Slot Capacity
                                    </span>
                                    <span className={`tiny-text fw-black ${totalDropCount >= DROP_MAX ? 'text-success' : 'text-primary'}`}>
                                        {totalDropCount} / {DROP_MAX} Slots
                                    </span>
                                </div>
                                <div className="progress" style={{ height: 6, borderRadius: 99 }}>
                                    <div
                                        className={`progress-bar transition-all ${totalDropCount >= DROP_MAX ? 'bg-success' : 'bg-primary'}`}
                                        role="progressbar"
                                        style={{ width: `${(totalDropCount / DROP_MAX) * 100}%` }}
                                        aria-valuenow={totalDropCount}
                                        aria-valuemin={0}
                                        aria-valuemax={DROP_MAX}
                                    />
                                </div>
                            </div>

                            {/* Payload Micro Preview Chips */}
                            {dropItems.length > 0 && (
                                <div className="d-flex flex-wrap gap-1 mb-3">
                                    {dropItems.map((entry) => (
                                        <span key={entry.item.id} className="ob-radar-payload-pill">
                                            <img
                                                src={entry.item.image || FALLBACK_IMG}
                                                alt=""
                                                style={{ width: 14, height: 14, objectFit: 'contain' }}
                                            />
                                            <span className="text-truncate" style={{ maxWidth: 80 }}>{entry.item.name}</span>
                                            <span className="text-success fw-black">×{entry.quantity}</span>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Live Monospace Command Injection Preview */}
                            <div className="ob-radar-terminal-box mb-3">
                                <div className="d-flex align-items-center gap-2 text-truncate">
                                    <span className="text-secondary">$</span>
                                    <span className="text-truncate">{dropCommandText || '!drop <payload>'}</span>
                                </div>
                                {dropCommandText && (
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 text-success opacity-75 hover-opacity-100"
                                        title="Copy drop command & open Discord"
                                        onClick={handleCopyDropForDiscord}
                                    >
                                        <i className="fa-solid fa-copy"></i>
                                    </button>
                                )}
                            </div>

                            {/* Copy Command for Discord CTA Button */}
                            <button
                                type="button"
                                disabled={!selectedDropIsland || totalDropCount === 0}
                                onClick={handleCopyDropForDiscord}
                                className="btn ob-radar-dispatch-cta w-100 d-flex align-items-center justify-content-center gap-2 hover-scale"
                            >
                                {!selectedDropIsland ? (
                                    <><i className="fa-solid fa-crosshairs"></i> 1. SELECT ISLAND FIRST</>
                                ) : totalDropCount === 0 ? (
                                    <><i className="fa-solid fa-boxes-stacked"></i> 3. LOAD DROP ITEMS</>
                                ) : (
                                    <><i className="fa-solid fa-copy"></i> COPY !DROP & OPEN DISCORD</>
                                )}
                            </button>

                            {/* Status alerts */}
                            {dropSuccessMsg && (
                                <div className="alert alert-success rounded-4 mt-3 p-2 d-flex align-items-center gap-2 shadow-2xs mb-0">
                                    <i className="fa-solid fa-circle-check text-success fs-5 flex-shrink-0" />
                                    <span className="fw-bold tiny-text text-success-emphasis">{dropSuccessMsg}</span>
                                </div>
                            )}
                            {dropErrorMsg && (
                                <div className="alert alert-danger rounded-4 mt-3 p-2 d-flex align-items-center gap-2 shadow-2xs mb-0">
                                    <i className="fa-solid fa-triangle-exclamation text-danger fs-5 flex-shrink-0" />
                                    <span className="fw-bold tiny-text text-danger-emphasis">{dropErrorMsg}</span>
                                </div>
                            )}

                            {/* Diagnostic Checklist */}
                            <div className="mt-3 pt-3 border-top d-flex flex-column gap-1">
                                <span className="tiny-text fw-bold text-muted text-uppercase d-block mb-1 tracking-wider">
                                    Flight Pre-Check:
                                </span>
                                <div className={`ob-radar-diag-item ${selectedDropIsland ? 'done' : 'pending'}`}>
                                    <i className={`fa-solid ${selectedDropIsland ? 'fa-check-circle text-success' : 'fa-circle-dot text-muted'}`} />
                                    <span>1. Sub Island Target Set</span>
                                </div>
                                <div className={`ob-radar-diag-item ${alreadyOnIsland || dropDodoCode ? 'done' : 'pending'}`}>
                                    <i className={`fa-solid ${alreadyOnIsland || dropDodoCode ? 'fa-check-circle text-success' : 'fa-circle-dot text-muted'}`} />
                                    <span>2. Webhook & On-Island Presence</span>
                                </div>
                                <div className={`ob-radar-diag-item ${totalDropCount > 0 ? 'done' : 'pending'}`}>
                                    <i className={`fa-solid ${totalDropCount > 0 ? 'fa-check-circle text-success' : 'fa-circle-dot text-muted'}`} />
                                    <span>3. 9-Slot Payload Loaded ({totalDropCount}/{DROP_MAX})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </div>
            </div>

            {/* ════════════════ RECENT ORDERS MODAL ════════════════ */}
            {showHistoryModal && (
                <div
                    className="ob-modal-backdrop"
                    onClick={() => setShowHistoryModal(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Recent Orders"
                >
                    <div
                        className="ob-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ob-modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <div className="ob-tool-icon" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                                    <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="h6 fw-bold mb-0 text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Your Recent Orders
                                    </h3>
                                    <div className="tiny-text text-muted">1-click reorder past items</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle border d-flex align-items-center justify-content-center"
                                onClick={() => setShowHistoryModal(false)}
                                aria-label="Close modal"
                                style={{ width: 32, height: 32 }}
                            >
                                <i className="fa-solid fa-xmark" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="ob-modal-body">
                            {historyLoading && historyOrders.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <span className="spinner-border spinner-border-sm text-success me-2" />
                                    <span>Loading order history…</span>
                                </div>
                            ) : historyOrders.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {historyOrders.map((order) => {
                                        const parsed = parseItemCodes(order.command, catalogData?.all || []);
                                        return (
                                            <div key={order.id} className="card rounded-4 p-3 bg-light border shadow-2xs">
                                                <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-dark text-white rounded-pill font-monospace x-small">
                                                            #{order.id.slice(0, 14)}
                                                        </span>
                                                        <span
                                                            className={`badge rounded-pill x-small ${order.status === 'ready' || order.status === 'completed'
                                                                    ? 'bg-success text-white'
                                                                    : 'bg-light text-dark border'
                                                                }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <span className="tiny-text text-muted">
                                                        {formatDateTime(order.created_at)}
                                                    </span>
                                                </div>

                                                {/* Preview sprites */}
                                                {parsed.items.length > 0 ? (
                                                    <div
                                                        className="d-flex flex-wrap gap-1 mb-2 py-1 bg-white p-2 rounded-3 border"
                                                        style={{ maxHeight: 70, overflowY: 'auto' }}
                                                    >
                                                        {parsed.items.map((item, idx) => (
                                                            <span
                                                                key={`${item.itemId}-${idx}`}
                                                                className="badge bg-light text-dark border rounded-pill px-2 py-1 tiny-text fw-normal d-inline-flex align-items-center gap-1"
                                                            >
                                                                {item.image && (
                                                                    <img
                                                                        src={item.image}
                                                                        alt=""
                                                                        style={{ width: 14, height: 14, objectFit: 'contain' }}
                                                                    />
                                                                )}
                                                                <span>{item.name}</span>
                                                                <span className="text-success fw-bold">×{item.quantity}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="font-monospace text-muted tiny-text text-truncate mb-2">
                                                        {order.command}
                                                    </div>
                                                )}

                                                <div className="d-flex justify-content-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-nook text-white rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-2xs"
                                                        onClick={() => handleReorderHistoryItem(order)}
                                                    >
                                                        <i className="fa-solid fa-rotate-left" aria-hidden="true" />
                                                        <span>Load into Pocket & Reorder</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <div style={{ fontSize: '2.8rem' }} className="mb-2">📦</div>
                                    <h4 className="fw-bold mb-1 h6 text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        No Past Orders Found
                                    </h4>
                                    <p className="tiny-text text-muted mb-0">
                                        Your past order history will appear here for fast 1-click reordering.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════ IN-APP NOTIFICATION TOAST ════════════════ */}
            {inAppToast && (
                <div className="ob-in-app-toast-container">
                    <div className={`ob-in-app-toast toast-${inAppToast.type}`} role="alert" aria-live="assertive">
                        <div className="ob-toast-icon" aria-hidden="true">
                            {inAppToast.type === 'dodo' && <i className="fa-solid fa-plane-departure" />}
                            {inAppToast.type === 'success' && <i className="fa-solid fa-circle-check" />}
                            {inAppToast.type === 'warning' && <i className="fa-solid fa-triangle-exclamation" />}
                            {inAppToast.type === 'info' && <i className="fa-solid fa-circle-info" />}
                        </div>
                        <div className="flex-grow-1">
                            <div className="fw-bold small mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {inAppToast.title}
                            </div>
                            <div style={{ fontSize: '0.82rem', opacity: inAppToast.type === 'dodo' ? 0.95 : 0.8 }}>
                                {inAppToast.message}
                            </div>
                            {inAppToast.actionLabel && inAppToast.onAction && (
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        className={`btn btn-xs rounded-pill fw-bold px-3 py-1 ${inAppToast.type === 'dodo' ? 'btn-light text-dark' : 'btn-success text-white'
                                            }`}
                                        onClick={() => {
                                            inAppToast.onAction?.();
                                            dismissInAppToast();
                                        }}
                                    >
                                        {inAppToast.actionLabel}
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className={`btn-close ${inAppToast.type === 'dodo' ? 'btn-close-white' : ''} x-small`}
                            aria-label="Dismiss notification"
                            onClick={dismissInAppToast}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderBot;