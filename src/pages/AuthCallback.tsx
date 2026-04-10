import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeAuthToken } from "../context/authToken";

const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error) {
            const messages: Record<string, string> = {
                not_a_member:         "You are not a member of the Chopaeng Discord server.",
                roles_fetch_failed:   "Could not fetch your Discord roles. Please try again.",
                token_exchange_failed:"Authorization failed. Please try again.",
                invalid_state:        "Invalid session state. Please try again.",
            };
            setErrorMsg(messages[error] ?? "Discord login failed. Please try again.");
            setStatus("error");
            return;
        }

        if (token) {
            storeAuthToken(token);
            // Redirect back to islands (or wherever they came from)
            navigate("/islands", { replace: true });
        } else {
            setErrorMsg("No token received. Please try again.");
            setStatus("error");
        }
    }, [navigate]);

    if (status === "error") {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center nook-bg">
                <div className="text-center p-4">
                    <i className="fa-solid fa-circle-xmark fa-3x text-danger mb-3"></i>
                    <h2 className="fw-black mb-2">Login Failed</h2>
                    <p className="text-muted mb-4">{errorMsg}</p>
                    <button onClick={() => window.location.href = "/islands"} className="btn btn-nook fw-bold px-4 rounded-pill">
                        Back to Islands
                    </button>
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
