import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeAuthToken } from "../context/authToken";
import { useAuth } from "../context/useAuth";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { refreshAuth } = useAuth();
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");
    const [errorCode, setErrorCode] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");
            const error = params.get("error");

            if (error) {
                if (!isMounted) return;
                setErrorCode(error);
                const messages: Record<string, string> = {
                    not_a_member: "You are not a member of the Chopaeng Discord server.",
                    roles_fetch_failed: "Could not fetch your Discord roles. Please try again.",
                    token_exchange_failed: "Authorization failed. Please try again.",
                    invalid_state: "Invalid session state. Please try again.",
                };
                setErrorMsg(messages[error] ?? "Discord login failed. Please try again.");
                setStatus("error");
                return;
            }

            if (token) {
                storeAuthToken(token);
                const ok = await refreshAuth(token);
                if (!ok && isMounted) {
                    setErrorMsg("Failed to verify user session with Discord. Please try again.");
                    setStatus("error");
                    return;
                }

                // Redirect back to return_to destination or /islands
                let returnTo = "/islands";
                try {
                    const saved = sessionStorage.getItem("chopaeng_auth_return_to");
                    if (saved && saved.startsWith("/") && !saved.startsWith("/auth/")) {
                        returnTo = saved;
                    }
                    sessionStorage.removeItem("chopaeng_auth_return_to");
                } catch {}

                navigate(returnTo, { replace: true });
            } else {
                if (!isMounted) return;
                setErrorMsg("No token received. Please try again.");
                setStatus("error");
            }
        };

        handleAuth();

        return () => {
            isMounted = false;
        };
    }, [navigate, refreshAuth]);

    if (status === "error") {
        const isNotMember = errorCode === "not_a_member";
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center nook-bg p-3">
                <div className="text-center p-5 rounded-5 shadow-lg bg-white border border-white animate-up" style={{ maxWidth: '450px' }}>
                    {isNotMember ? (
                        <>
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm" style={{ width: '80px', height: '80px', backgroundColor: '#5865F2' }}>
                                <i className="fa-brands fa-discord fa-3x"></i>
                            </div>
                            <h2 className="fw-black mb-3">Join Our Community!</h2>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-circle-xmark fa-4x text-danger mb-4"></i>
                            <h2 className="fw-black mb-3">Login Failed</h2>
                        </>
                    )}
                    
                    <p className="text-muted mb-4 fs-6">{errorMsg}</p>
                    
                    <div className="d-flex flex-column gap-3">
                        {isNotMember && (
                            <a 
                                href="https://discord.gg/chopaeng" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn btn-primary fw-bold py-3 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all hover-scale" 
                                style={{ backgroundColor: '#5865F2', borderColor: '#5865F2' }}
                            >
                                <i className="fa-brands fa-discord"></i>
                                Join Chopaeng Discord
                            </a>
                        )}
                        <button 
                            onClick={() => window.location.href = "/islands"} 
                            className="btn btn-nook fw-bold py-3 rounded-pill shadow-sm transition-all hover-scale"
                        >
                            Back to Islands
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center nook-bg">
            <div className="text-center">
                <div className="spinner-border text-success mb-3" role="status" />
                <p className="fw-bold text-muted">Logging you in…</p>
            </div>
        </div>
    );
};

export default AuthCallback;
