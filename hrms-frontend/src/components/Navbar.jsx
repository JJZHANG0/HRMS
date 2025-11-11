// src/components/Navbar.jsx
import React, {useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {http} from "../services/http";
import UploadProgressModal from "./UploadProgressModal";

// 密码验证弹窗
function PasswordModal({title, message, showInput, onConfirm, onClose}) {
    const [inputValue, setInputValue] = useState("");

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalBox}>
                {title && <h3 style={styles.modalTitle}>{title}</h3>}
                {message && (
                    <div
                        style={{...styles.modalText, whiteSpace: "pre-line", textAlign: "left"}}
                        dangerouslySetInnerHTML={{__html: message}}
                    />
                )}

                {showInput && (
                    <input
                        type="password"
                        placeholder="请输入管理员密码"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={styles.modalInput}
                        autoFocus
                    />
                )}

                <div style={{marginTop: "20px"}}>
                    {onConfirm && (
                        <button style={styles.modalButton} onClick={() => onConfirm(inputValue)}>
                            确定
                        </button>
                    )}
                    <button
                        style={{...styles.modalButton, backgroundColor: "#333", color: "#fff", marginLeft: "10px"}}
                        onClick={onClose}
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Navbar({username, activeMenu, onMenuChange}) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [modal, setModal] = useState({visible: false, title: "", message: "", showInput: false, onConfirm: null});
    const [uploadProgress, setUploadProgress] = useState({
        visible: false,
        uploading: false,
        total: 0,
        current: 0,
        currentFileName: "",
        results: {created: [], failed: []},
        completed: false,
    });

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    const handleAddResume = () => {
        setModal({
            visible: true,
            title: "录入新简历",
            message: "此操作需要管理员密码验证。",
            showInput: true,
            onConfirm: (password) => {
                if (password === "STEMHUB2025!") {
                    setModal({visible: false});
                    fileInputRef.current.click();
                } else {
                    setModal({
                        visible: true,
                        title: "验证失败",
                        message: "❌ 密码错误，请重试。",
                        showInput: false,
                    });
                }
            },
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;
        if (files.length > 10) {
            setModal({
                visible: true,
                title: "上传限制",
                message: "⚠️ 一次最多上传 10 份简历。",
            });
            return;
        }

        // 显示进度弹窗
        setUploadProgress({
            visible: true,
            uploading: true,
            total: files.length,
            current: 0,
            currentFileName: "",
            results: {created: [], failed: []},
            completed: false,
        });

        const created = [];
        const failed = [];

        // 逐个上传文件
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress((prev) => ({
                ...prev,
                current: i + 1,
                currentFileName: file.name,
            }));

            const formData = new FormData();
            formData.append("files", file);

            try {
                const res = await http.post(
                    "candidates/upload/",
                    formData,
                    {headers: {"Content-Type": "multipart/form-data"}}
                );

                if (res.data.created && res.data.created.length > 0) {
                    created.push(...res.data.created);
                }
                if (res.data.failed && res.data.failed.length > 0) {
                    failed.push(...res.data.failed);
                }
            } catch (err) {
                console.error("上传失败:", err);
                failed.push({file: file.name, reason: "网络错误或后端异常"});
            }
        }

        // 上传完成
        setUploadProgress((prev) => ({
            ...prev,
            uploading: false,
            completed: true,
            results: {created, failed},
        }));

        e.target.value = ""; // 重置文件输入
    };

    const closeUploadModal = () => {
        setUploadProgress({
            visible: false,
            uploading: false,
            total: 0,
            current: 0,
            currentFileName: "",
            results: {created: [], failed: []},
            completed: false,
        });
        // 刷新页面数据
        window.location.reload();
    };

    return (
        <>
            <nav style={styles.navbar}>
                <div style={styles.navLeft}>STEMHUB 人力资源管理系统</div>
                <div style={styles.navCenter}>HUMAN RESOURCES MANAGEMENT SYSTEM</div>
                <div style={styles.navRight}>
                    <button
                        style={styles.addButton}
                        onClick={handleAddResume}
                        disabled={uploadProgress.uploading}
                    >
                        {uploadProgress.uploading ? "上传中..." : "➕ 添加新简历"}
                    </button>
                    <span style={{marginLeft: "20px"}}>👤 {username}</span>
                    <button style={styles.logoutButton} onClick={handleLogout}>
                        退出
                    </button>
                </div>
            </nav>

            {/* 隐藏的文件输入 */}
            <input
                type="file"
                accept=".pdf"
                multiple
                ref={fileInputRef}
                style={{display: "none"}}
                onChange={handleFileChange}
            />

            {/* 密码验证弹窗 */}
            {modal.visible && (
                <PasswordModal
                    title={modal.title}
                    message={modal.message}
                    showInput={modal.showInput}
                    onConfirm={modal.onConfirm}
                    onClose={() => setModal({visible: false})}
                />
            )}

            {/* 上传进度弹窗 */}
            <UploadProgressModal
                visible={uploadProgress.visible}
                uploading={uploadProgress.uploading}
                total={uploadProgress.total}
                current={uploadProgress.current}
                currentFileName={uploadProgress.currentFileName}
                results={uploadProgress.results}
                completed={uploadProgress.completed}
                onClose={closeUploadModal}
            />
        </>
    );
}

const styles = {
    navbar: {
        height: "60px",
        backgroundColor: "#0b0b0b",
        borderBottom: "1px solid #d4af37",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        position: "sticky",
        top: 0,
        zIndex: 10,
    },
    navLeft: {color: "#d4af37", fontWeight: "bold"},
    navCenter: {color: "#fff", fontSize: "16px"},
    navRight: {display: "flex", alignItems: "center"},
    addButton: {
        backgroundColor: "#d4af37",
        color: "#0b0b0b",
        border: "none",
        padding: "8px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "0.2s",
    },
    logoutButton: {
        background: "transparent",
        border: "1px solid #d4af37",
        color: "#d4af37",
        borderRadius: "6px",
        padding: "6px 12px",
        marginLeft: "15px",
        cursor: "pointer",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
    },
    modalBox: {
        backgroundColor: "#1a1a1a",
        border: "1px solid #d4af37",
        boxShadow: "0 0 25px rgba(212,175,55,0.3)",
        borderRadius: "12px",
        padding: "24px 32px",
        width: "400px",
        textAlign: "center",
    },
    modalTitle: {color: "#d4af37", marginBottom: "10px"},
    modalText: {color: "#fff", marginBottom: "10px"},
    modalInput: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#111",
        border: "1px solid #333",
        borderRadius: "6px",
        color: "#fff",
    },
    modalButton: {
        backgroundColor: "#d4af37",
        color: "#0b0b0b",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        fontWeight: "bold",
        cursor: "pointer",
    },
};

