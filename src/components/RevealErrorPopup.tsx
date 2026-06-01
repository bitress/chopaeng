interface RevealErrorPopupProps {
    message: string;
    onClose: () => void;
}

const RevealErrorPopup = ({ message, onClose }: RevealErrorPopupProps) => (
    <div className="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1080, background: "rgba(25, 35, 31, 0.38)", backdropFilter: "blur(3px)" }}>
        <div className="bg-white rounded-4 shadow-lg border overflow-hidden" role="alertdialog" aria-modal="true" aria-labelledby="reveal-error-title" style={{ maxWidth: 430, width: "100%" }}>
            <div className="p-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-3" style={{ width: 58, height: 58 }}>
                    <i className="fa-solid fa-triangle-exclamation fa-lg"></i>
                </div>
                <h2 id="reveal-error-title" className="h5 fw-black text-dark mb-2">Dodo code unavailable</h2>
                <p className="text-muted fw-bold mb-4">{message}</p>
                <button type="button" className="btn btn-danger rounded-pill fw-black px-4" onClick={onClose} autoFocus>
                    OK
                </button>
            </div>
        </div>
    </div>
);

export default RevealErrorPopup;
