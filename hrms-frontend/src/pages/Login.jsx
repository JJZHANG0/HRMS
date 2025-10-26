import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {loginUser} from "../services/api";

// 🪶 Modal 组件（与注册页一致）
function Modal({message, onClose}) {
    if (!message) return null;
    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalBox}>
                <p style={styles.modalText}>{message}</p>
                <button style={styles.modalButton} onClick={onClose}>确定</button>
            </div>
        </div>
    );
}

export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [modalMessage, setModalMessage] = useState(""); // 控制弹窗内容
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await loginUser(formData);
            localStorage.setItem("access_token", res.data.access);
            localStorage.setItem("username", formData.username); // ✅ 新增
            setModalMessage("✅ 登录成功！正在跳转...");
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            console.error("登录错误:", err.response?.data);

            // 如果后端有错误信息
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                // SimpleJWT 登录失败一般返回 detail
                const message = errorData.detail || "用户名或密码错误";
                setModalMessage(`❌ ${message}`);
                setError(message);
            } else {
                setModalMessage("❌ 登录失败，请检查网络或服务器。");
                setError("登录失败，请检查网络或服务器。");
            }
        }
    };

    return (
        <div style={styles.page}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="用户名"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="密码"
                        onChange={handleChange}
                        required
                    />

                    {error && <p style={{color: "red"}}>{error}</p>}

                    <button type="submit" style={{...styles.button, width: "100%"}}>
                        登录
                    </button>
                </form>

                <p style={styles.footerText}>
                    还没有账户？ <Link to="/register" style={{color: "#d4af37"}}>注册</Link>
                </p>
            </div>

            {/* Modal 弹窗 */}
            <Modal message={modalMessage} onClose={() => setModalMessage("")}/>
        </div>
    );
}

// 🎨 样式（与注册页完全同步）
const styles = {
    page: {
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b0b0b, #1a1a1a)",
    },
    card: {
        background: "#141414",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "40px",
        width: "360px",
        boxShadow: "0 0 25px rgba(212,175,55,0.3)",
        textAlign: "center",
    },
    title: {
        color: "#d4af37",
        marginBottom: "20px",
        fontWeight: "bold",
        fontSize: "22px",
    },
    button: {
        backgroundColor: "#d4af37",
        color: "#0b0b0b",
        border: "none",
        padding: "12px",
        borderRadius: "6px",
        fontWeight: "bold",
        marginTop: "10px",
        cursor: "pointer",
        transition: "0.2s",
    },
    footerText: {
        textAlign: "center",
        marginTop: "16px",
        color: "#ccc",
    },
    // Modal 样式
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
        zIndex: 999,
        backdropFilter: "blur(3px)",
    },
    modalBox: {
        backgroundColor: "#1a1a1a",
        border: "1px solid #d4af37",
        boxShadow: "0 0 25px rgba(212,175,55,0.3)",
        borderRadius: "12px",
        padding: "24px 32px",
        width: "320px",
        textAlign: "center",
        animation: "fadeIn 0.3s ease-in-out",
    },
    modalText: {
        color: "#fff",
        marginBottom: "20px",
        fontSize: "16px",
    },
    modalButton: {
        backgroundColor: "#d4af37",
        color: "#0b0b0b",
        border: "none",
        borderRadius: "6px",
        padding: "10px 20px",
        fontWeight: "bold",
        cursor: "pointer",
    },
};
