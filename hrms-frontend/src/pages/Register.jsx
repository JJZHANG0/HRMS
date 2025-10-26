import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {registerUser} from "../services/api";

// 🪶 Modal 组件（黑金风格）
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

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
        inviteCode: "",
    });
    const [error, setError] = useState("");
    const [modalMessage, setModalMessage] = useState(""); // 控制弹窗显示
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // 邀请码验证
        if (formData.inviteCode.trim() !== "STEMHUB") {
            setModalMessage("❌ 邀请码不正确，请联系管理员获取正确的邀请码。");
            return;
        }

        try {
            const res = await registerUser(formData);
            setModalMessage("✅ 注册成功！请登录");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            console.error("注册错误:", err.response?.data);
            if (err.response && err.response.data && err.response.data.errors) {
                const backendErrors = err.response.data.errors;
                const firstKey = Object.keys(backendErrors)[0];
                const message = backendErrors[firstKey][0];
                setModalMessage(`❌ ${message}`);
                setError(message);
            } else {
                setModalMessage("❌ 注册失败，请检查输入信息。");
                setError("注册失败，请检查输入信息。");
            }
        }
    };

    return (
        <div style={styles.page}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>

                <form onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="用户名" onChange={handleChange} required/>
                    <input type="email" name="email" placeholder="邮箱" onChange={handleChange} required/>
                    <input type="password" name="password" placeholder="密码" onChange={handleChange} required/>
                    <input type="password" name="password2" placeholder="确认密码" onChange={handleChange} required/>
                    <input type="text" name="inviteCode" placeholder="请输入邀请码" onChange={handleChange} required/>

                    {error && <p style={{color: "red"}}>{error}</p>}

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            opacity: formData.inviteCode.trim() === "STEMHUB" ? 1 : 0.6,
                            cursor: formData.inviteCode.trim() === "STEMHUB" ? "pointer" : "not-allowed",
                            ...styles.button,
                        }}
                        disabled={formData.inviteCode.trim() !== "STEMHUB"}
                    >
                        注册
                    </button>
                </form>

                <p style={styles.footerText}>
                    已有账户？ <Link to="/login" style={{color: "#d4af37"}}>登录</Link>
                </p>
            </div>

            {/* Modal 弹窗 */}
            <Modal message={modalMessage} onClose={() => setModalMessage("")}/>
        </div>
    );
}

// 🎨 样式配置
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
