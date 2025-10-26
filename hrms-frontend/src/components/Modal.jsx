// src/components/Modal.jsx
import React, {useEffect, useRef} from "react";

export default function Modal({
                                  open = false,
                                  title = "提示",
                                  children,
                                  onClose = () => {
                                  },
                                  confirmText = "知道了",
                                  variant = "error", // "error" | "success" | "info"
                              }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        // 简单防滚动
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    const accent =
        variant === "error" ? "#ff4d4f" : variant === "success" ? "#52c41a" : "#d4af37";

    return (
        <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
            <div
                className="modal-card"
                ref={dialogRef}
                onClick={(e) => e.stopPropagation()}
                style={{
                    borderImage: `linear-gradient(145deg, ${accent}, #d4af37) 1`,
                }}
            >
                <div className="modal-header">
                    <div
                        className="modal-dot"
                        style={{background: accent, boxShadow: `0 0 12px ${accent}`}}
                    />
                    <h3 className="modal-title">{title}</h3>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                    <button className="btn-gold" onClick={onClose}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}
