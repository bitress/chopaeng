import React from 'react';

const Chopaeng404: React.FC = () => {
    return (
        <div className="dal-bg min-vh-100 d-flex align-items-center justify-content-center p-3 font-nunito">
            {/* CUSTOM CSS STYLES */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;800;900&display=swap');

        :root {
            --dal-blue: #4090bd;
            --dal-yellow: #f5c452;
            --dal-text: #2d4d5c;
            --paper: #fdfbf7;
            --nook-green: #7ec9b1;
            --resetti-red: #e06c75;
        }

        .font-nunito { font-family: 'Nunito', sans-serif; }
        .font-fredoka { font-family: 'Fredoka One', cursive; }

        .dal-bg {
            background-color: #f0f4e4;
            background-image: linear-gradient(30deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
            linear-gradient(150deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
            linear-gradient(30deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
            linear-gradient(150deg, #e6ebd6 12%, transparent 12.5%, transparent 87%, #e6ebd6 87.5%, #e6ebd6),
            radial-gradient(#e6ebd6 20%, transparent 20%);
            background-size: 80px 140px;
        }

        /* Card Styling to match "Ticket" look */
        .error-ticket {
            background: var(--paper);
            border-radius: 25px;
            max-width: 550px;
            width: 100%;
            position: relative;
            box-shadow: 0 15px 35px rgba(64, 144, 189, 0.2);
            border: 1px solid rgba(0,0,0,0.05);
            overflow: hidden;
            transform: rotate(-1deg);
            transition: transform 0.3s ease;
        }

        .error-ticket:hover {
            transform: rotate(0deg) scale(1.02);
        }

        /* Decorative Elements */
        .tape-strip {
            position: absolute; top: -12px; left: 50%; transform: translateX(-50%) rotate(1deg);
            width: 120px; height: 35px; background: rgba(255,255,255,0.4);
            z-index: 10; border-left: 2px dashed rgba(0,0,0,0.05); border-right: 2px dashed rgba(0,0,0,0.05);
            backdrop-filter: blur(2px);
        }

        .status-pill {
            position: absolute; top: 20px; right: 20px;
            background: var(--resetti-red); color: white;
            padding: 6px 14px; border-radius: 12px;
            font-size: 0.75rem; font-weight: 900; letter-spacing: 1px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-transform: uppercase;
        }

        /* Content Styling */
        .plane-float {
            color: var(--dal-blue);
            animation: flight-path 6s ease-in-out infinite;
            filter: drop-shadow(0 10px 0 rgba(0,0,0,0.1));
        }

        @keyframes flight-path {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }

        .error-code {
            font-size: 7rem;
            line-height: 1;
            color: var(--dal-yellow);
            text-shadow: 4px 4px 0 var(--dal-blue);
            margin-bottom: 0;
            position: relative;
            z-index: 2;
        }

        .error-heading {
            color: var(--dal-text);
            font-size: 1.8rem;
            margin-bottom: 1rem;
        }

        .error-text {
            color: #6c757d;
            font-size: 1.1rem;
            font-weight: 600;
            line-height: 1.6;
        }

        /* Buttons */
        .btn-group-dal {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .btn-dal {
            border-radius: 50px;
            font-weight: 800;
            padding: 12px 24px;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            border: none;
            color: white !important;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.95rem;
        }

        .btn-dal:hover {
            transform: translateY(-3px);
            filter: brightness(1.05);
            box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }

        .btn-home { background-color: var(--dal-blue); border-bottom: 4px solid #2d6a8c; }
        .btn-twitch { background-color: #9146ff; border-bottom: 4px solid #6441a5; }
        .btn-discord { background-color: #5865f2; border-bottom: 4px solid #4752c4; }
        .btn-home:active, .btn-twitch:active, .btn-discord:active {
            transform: translateY(0); border-bottom-width: 0px; margin-top: 4px;
        }

        /* Footer / Divider */
        .ticket-divider {
            border-top: 3px dashed #e0e0e0;
            margin: 30px 0;
            position: relative;
        }
        
        .ticket-divider::before, .ticket-divider::after {
            content: ''; position: absolute; top: -10px; width: 20px; height: 20px;
            background: var(--dal-bg); border-radius: 50%;
        }
        .ticket-divider::before { left: -30px; } /* Cutout left */
        .ticket-divider::after { right: -30px; } /* Cutout right */

        .resetti-note {
            font-size: 0.9rem;
            color: #999;
            font-weight: 700;
            font-style: italic;
        }
      `}</style>

            <div className="error-ticket p-4 p-md-5">
                {/* Visual Flair */}
                <div className="tape-strip"></div>
                <div className="status-pill">
                    <i className="fa-solid fa-circle-xmark me-1"></i> Page Not Found
                </div>

                {/* Header Icon */}
                <div className="text-center mb-2 mt-3">
                    <i className="fa-solid fa-map-location-dot fa-4x plane-float"></i>
                </div>

                {/* Main Content */}
                <div className="text-center">
                    <h1 className="error-code font-fredoka">404</h1>
                    <h2 className="error-heading font-fredoka">"Destination Unknown"</h2>

                    <p className="error-text mb-4">
                        This flight path doesn't exist! The page you are looking for might have been moved, renamed, or deleted.
                    </p>

                    <div className="btn-group-dal mb-2">
                        <a href="/" className="btn-dal btn-home">
                            <i className="fa-solid fa-house"></i> Return Home
                        </a>
                        <a href="https://discord.gg/chopaeng" target="_blank" rel="noreferrer" className="btn-dal btn-discord">
                            <i className="fa-brands fa-discord"></i> Report Issue
                        </a>
                    </div>
                </div>

                {/* Dashed Tear Line */}
                <div className="ticket-divider"></div>

                {/* Footer */}
                <div className="text-center resetti-note">
                    <i className="fa-solid fa-plane-up me-1"></i>
                    We'll get you back in the air in no time.<br/>
                    — <strong>DAL Ground Crew</strong>
                </div>
            </div>
        </div>
    );
};

export default Chopaeng404;
