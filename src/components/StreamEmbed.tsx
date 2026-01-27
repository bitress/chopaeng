import { useState } from 'react';

export default function StreamEmbed() {
    const [source] = useState(() => {
        const options = ['twitch', 'yt_vod', 'yt_latest'];
        return options[Math.floor(Math.random() * options.length)];
    });

    return (
        <div className="ratio ratio-16x9 rounded-4 overflow-hidden border border-4 border-white shadow-sm bg-dark">
            {source === 'twitch' && (
                <iframe
                    src="https://player.twitch.tv/?channel=chopaeng&parent=www.chopaeng.com&parent=chopaeng.com&muted=true&autoplay=true"
                    title="ChoPaeng Twitch Stream"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    style={{ border: 0 }}
                ></iframe>
            )}
            {source === 'yt_vod' && (
                <iframe
                    src="https://www.youtube.com/embed/Oq3ECNa4vmo?autoplay=1&mute=1&loop=1&playlist=Oq3ECNa4vmo"
                    title="ChoPaeng YouTube Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0 }}
                ></iframe>
            )}
            {source === 'yt_latest' && (
                <iframe
                    src="https://www.youtube.com/embed/videoseries?list=UUNKiq8m-qlXcev9fl0rHNBg&autoplay=1"
                    title="ChoPaeng Latest Uploads"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0 }}
                ></iframe>
            )}
        </div>
    );
}