import type {
    SuggestionFormData,
    SuggestionSendResult,
} from '../types/suggestion';

export const DISCORD_SUGGESTIONS_WEBHOOK_URL =
    'https://discord.com/api/webhooks/1540189827004235806/vzfPpTFLA0yKcuDRs8AS_w2HmQn4zxhaZlCXoebZpBj6-h9tHiah-fXxGnnc0gq0Xczq';

const LAST_SUBMIT_KEY = 'chopaeng_last_suggestion_timestamp';
const COOLDOWN_SECONDS = 15;

/**
 * Checks remaining cooldown in seconds (if any).
 */
export const getSuggestionCooldownRemaining = (): number => {
    try {
        const last = localStorage.getItem(LAST_SUBMIT_KEY);
        if (!last) return 0;
        const elapsed = (Date.now() - parseInt(last, 10)) / 1000;
        if (elapsed < COOLDOWN_SECONDS) {
            return Math.ceil(COOLDOWN_SECONDS - elapsed);
        }
    } catch {
        // Ignore localStorage error
    }
    return 0;
};

/**
 * Dispatches a formatted rich embed to the Discord webhook.
 */
export const sendDiscordSuggestion = async (
    data: SuggestionFormData
): Promise<SuggestionSendResult> => {
    const cooldown = getSuggestionCooldownRemaining();
    if (cooldown > 0) {
        return {
            success: false,
            error: `Please wait ${cooldown}s before submitting another suggestion.`,
            cooldownSeconds: cooldown,
        };
    }

    // Sender display formatting
    const senderIdentity = data.discordUsername?.trim()
        ? `\`${data.discordUsername.trim()}\``
        : 'Anonymous Resident';

    const inGameInfo = [
        data.inGameName?.trim() ? `IGN: **${data.inGameName.trim()}**` : null,
        data.islandName?.trim() ? `Island: **${data.islandName.trim()}**` : null,
    ]
        .filter(Boolean)
        .join(' • ');

    const fields: Array<{ name: string; value: string; inline?: boolean }> = [
        {
            name: '👤 Submitted By',
            value: inGameInfo ? `${senderIdentity}\n${inGameInfo}` : senderIdentity,
            inline: true,
        },
        {
            name: '📝 Details / Feedback',
            value: data.description.trim().slice(0, 1024),
            inline: false,
        },
    ];

    if (data.pageUrl) {
        fields.push({
            name: '🌐 Submitted From',
            value: `[${data.pageUrl}](${data.pageUrl})`,
            inline: false,
        });
    }

    const payload = {
        username: 'Chopaeng Suggestion Box',
        avatar_url: 'https://www.chopaeng.com/logo.png',
        embeds: [
            {
                title: `💡 Suggestion: ${data.title.trim()}`,
                description: `A new resident suggestion has been submitted from **Chopaeng**!`,
                color: 0x198754,
                fields,
                footer: {
                    text: 'Chopaeng Resident Feedback System • Live Dispatcher',
                    icon_url: 'https://www.chopaeng.com/logo.png',
                },
                timestamp: new Date().toISOString(),
            },
        ],
    };

    try {
        const response = await fetch(DISCORD_SUGGESTIONS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok || response.status === 204) {
            try {
                localStorage.setItem(LAST_SUBMIT_KEY, Date.now().toString());
            } catch {
                // Ignore
            }
            return { success: true };
        } else {
            return {
                success: false,
                error: `Discord webhook returned error status ${response.status}`,
            };
        }
    } catch (err: any) {
        console.error('Error sending suggestion to Discord webhook:', err);
        return {
            success: false,
            error: err?.message || 'Could not connect to Discord webhook. Please check your internet connection.',
        };
    }
};

/**
 * Triggers opening the global suggestion modal.
 */
export const openSuggestionModal = () => {
    window.dispatchEvent(new CustomEvent('chopaeng_open_suggestions'));
};
