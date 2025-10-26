// src/components/UploadProgressModal.jsx
import React from "react";

export default function UploadProgressModal({
                                                visible,
                                                uploading,
                                                total,
                                                current,
                                                currentFileName,
                                                results,
                                                completed,
                                                onClose,
                                            }) {
    if (!visible) return null;

    const progress = total > 0 ? (current / total) * 100 : 0;

    return (
        <div style={styles.overlay} onClick={completed ? onClose : undefined}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <div style={styles.dot}/>
                    <h2 style={styles.title}>
                        {uploading ? "📤 简历上传中" : completed ? "✅ 上传完成" : "处理中"}
                    </h2>
                </div>

                {uploading && (
                    <div style={styles.uploadingSection}>
                        <div style={styles.progressContainer}>
                            <div style={{...styles.progressBar, width: `${progress}%`}}/>
                        </div>
                        <p style={styles.progressText}>
                            正在处理第 {current} / {total} 份简历
                        </p>
                        <p style={styles.fileName}>📄 {currentFileName}</p>
                        <p style={styles.hint}>⏳ AI正在分析简历内容，请稍候...</p>
                        <div style={styles.warningBox}>
                            <p style={styles.warningText}>⚠️ 请勿关闭或刷新页面</p>
                        </div>
                    </div>
                )}

                {completed && (
                    <div style={styles.resultsSection}>
                        {results.created.length > 0 && (
                            <div style={styles.successBox}>
                                <h3 style={styles.successTitle}>✅ 成功导入 ({results.created.length})</h3>
                                <div style={styles.list}>
                                    {results.created.map((candidate, idx) => (
                                        <div key={idx} style={styles.listItem}>
                                            <span style={styles.itemName}>• {candidate.name || "未命名"}</span>
                                            <span
                                                style={{
                                                    ...styles.itemScore,
                                                    backgroundColor: getScoreColor(candidate.match_level),
                                                }}
                                            >
                                                {candidate.match_level}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.failed.length > 0 && (
                            <div style={styles.failBox}>
                                <h3 style={styles.failTitle}>❌ 失败文件 ({results.failed.length})</h3>
                                <div style={styles.list}>
                                    {results.failed.map((item, idx) => (
                                        <div key={idx} style={styles.listItem}>
                                            <span style={styles.itemName}>• {item.file}</span>
                                            <span style={styles.itemReason}>{item.reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button style={styles.closeButton} onClick={onClose}>
                            关闭并刷新
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function getScoreColor(score) {
    switch (score) {
        case "A":
            return "#FFD700";
        case "B":
            return "#C0C0C0";
        case "C":
            return "#A8A8A8";
        case "D":
            return "#666";
        case "E":
            return "#d9534f";
        default:
            return "#999";
    }
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(5px)",
    },
    modal: {
        backgroundColor: "#1a1a1a",
        border: "2px solid #d4af37",
        boxShadow: "0 0 40px rgba(212,175,55,0.4)",
        borderRadius: "16px",
        padding: "30px 40px",
        width: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
    },
    dot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: "#d4af37",
        marginRight: "12px",
        boxShadow: "0 0 10px #d4af37",
        animation: "pulse 2s infinite",
    },
    title: {
        color: "#d4af37",
        fontSize: "22px",
        fontWeight: "bold",
        margin: 0,
    },
    uploadingSection: {
        textAlign: "center",
    },
    progressContainer: {
        width: "100%",
        height: "12px",
        backgroundColor: "#333",
        borderRadius: "6px",
        overflow: "hidden",
        marginBottom: "15px",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#d4af37",
        transition: "width 0.3s ease",
        boxShadow: "0 0 10px rgba(212,175,55,0.6)",
    },
    progressText: {
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    fileName: {
        color: "#aaa",
        fontSize: "14px",
        marginBottom: "10px",
        wordBreak: "break-all",
    },
    hint: {
        color: "#888",
        fontSize: "13px",
        fontStyle: "italic",
    },
    warningBox: {
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        border: "1px solid #ffc107",
        borderRadius: "8px",
        padding: "10px",
        marginTop: "15px",
    },
    warningText: {
        color: "#ffc107",
        fontSize: "13px",
        fontWeight: "bold",
        margin: 0,
    },
    resultsSection: {},
    successBox: {
        backgroundColor: "rgba(82, 196, 26, 0.1)",
        border: "1px solid #52c41a",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "15px",
    },
    successTitle: {
        color: "#52c41a",
        fontSize: "16px",
        marginBottom: "10px",
    },
    failBox: {
        backgroundColor: "rgba(255, 77, 79, 0.1)",
        border: "1px solid #ff4d4f",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "15px",
    },
    failTitle: {
        color: "#ff4d4f",
        fontSize: "16px",
        marginBottom: "10px",
    },
    list: {
        maxHeight: "200px",
        overflowY: "auto",
    },
    listItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    itemName: {
        color: "#fff",
        fontSize: "14px",
        flex: 1,
    },
    itemScore: {
        color: "#000",
        padding: "3px 10px",
        borderRadius: "6px",
        fontWeight: "bold",
        fontSize: "12px",
        marginLeft: "10px",
    },
    itemReason: {
        color: "#ff4d4f",
        fontSize: "12px",
        fontStyle: "italic",
        marginLeft: "10px",
    },
    closeButton: {
        width: "100%",
        backgroundColor: "#d4af37",
        color: "#0b0b0b",
        border: "none",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.2s",
        marginTop: "10px",
    },
};

