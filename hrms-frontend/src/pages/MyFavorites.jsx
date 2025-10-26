// src/pages/MyFavorites.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import AddCooperationModal from "../components/AddCooperationModal";

export default function MyFavorites() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [activeMenu, setActiveMenu] = useState("favorites");
    const [editingId, setEditingId] = useState(null);
    const [editingCoopId, setEditingCoopId] = useState(null);
    const [cooperationModal, setCooperationModal] = useState({visible: false, candidate: null});
    const username = localStorage.getItem("username") || "访客";

    // 获取收藏列表
    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/candidates/favorites/my/", {
                params: {username}
            });
            const data = res.data.map((c) => ({
                ...c,
                experienceList: safeParseExperience(c.experience),
            }));
            setFavorites(data);
        } catch (err) {
            console.error("获取收藏失败:", err);
        }
    };

    // 取消收藏
    const handleToggleFavorite = async (candidateId) => {
        try {
            await axios.post("http://127.0.0.1:8000/api/candidates/favorites/toggle/", {
                username,
                candidate_id: candidateId,
            });
            // 从列表中移除
            setFavorites((prev) => prev.filter((c) => c.id !== candidateId));
        } catch (err) {
            alert("❌ 操作失败，请重试");
        }
    };

    // 更新评分
    const handleUpdateScore = async (id, newScore) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/candidates/${id}/`, {
                match_level: newScore,
            });
            setFavorites((prev) =>
                prev.map((c) => (c.id === id ? {...c, match_level: newScore} : c))
            );
            setEditingId(null);
        } catch (err) {
            alert("❌ 更新失败");
        }
    };

    // 更新合作状态
    const handleUpdateCooperation = async (id, newStatus) => {
        if (newStatus === "合作") {
            const candidate = favorites.find((c) => c.id === id);
            setCooperationModal({visible: true, candidate});
            setEditingCoopId(null);
            return;
        }

        try {
            await axios.patch(`http://127.0.0.1:8000/api/candidates/${id}/`, {
                cooperation_status: newStatus,
            });
            setFavorites((prev) =>
                prev.map((c) => (c.id === id ? {...c, cooperation_status: newStatus} : c))
            );
            setEditingCoopId(null);
        } catch (err) {
            alert("❌ 更新失败");
        }
    };

    const handleCooperationSuccess = () => {
        fetchFavorites();
    };

    const scoreColor = (score) => {
        switch (score) {
            case "A": return "#FFD700";
            case "B": return "#C0C0C0";
            case "C": return "#A8A8A8";
            case "D": return "#555";
            case "E": return "#d9534f";
            default: return "#999";
        }
    };

    const cooperationColor = (status) => {
        switch (status) {
            case "合作": return "#ffc107";
            case "合作较差": return "#333";
            case "未合作": return "#666";
            default: return "#666";
        }
    };

    return (
        <div style={styles.page}>
            <Navbar username={username} activeMenu={activeMenu} onMenuChange={setActiveMenu}/>

            <div style={styles.layout}>
                {/* 左侧菜单栏 */}
                <aside style={styles.sidebar}>
                    {[
                        {key: "home", label: "🏠 首页", path: "/dashboard"},
                        {key: "candidates", label: "👤 大库", path: "/candidates"},
                        {key: "favorites", label: "⭐ 收藏", path: "/favorites"},
                        {key: "records", label: "📄 合作", path: "/cooperation-records"},
                        {key: "documents", label: "📁 档案", path: "/documents"},
                        {key: "settings", label: "⚙️ 设置", path: "/settings"},
                    ].map((item) => (
                        <div
                            key={item.key}
                            style={{
                                ...styles.menuItem,
                                backgroundColor: activeMenu === item.key ? "#1a1a1a" : "transparent",
                                color: activeMenu === item.key ? "#d4af37" : "#fff",
                            }}
                            onClick={() => {
                                setActiveMenu(item.key);
                                if (item.path && item.path !== "#") navigate(item.path);
                            }}
                        >
                            {item.label}
                        </div>
                    ))}
                </aside>

                {/* 主内容区 */}
                <main style={styles.content}>
                    <h1 style={styles.title}>⭐ 我的收藏</h1>
                    <p style={styles.subtitle}>共 {favorites.length} 位收藏候选人</p>

                    {favorites.length === 0 ? (
                        <div style={styles.empty}>
                            <p style={{fontSize: "64px"}}>⭐</p>
                            <p style={{fontSize: "18px", marginBottom: "10px"}}>暂无收藏</p>
                            <p style={{fontSize: "14px", color: "#666"}}>
                                在人才库中点击"☆ 收藏"按钮可添加收藏
                            </p>
                            <button
                                style={styles.goToLibraryBtn}
                                onClick={() => navigate("/candidates")}
                            >
                                前往人才库
                            </button>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {favorites.map((c) => {
                                const exp = c.experienceList?.[0];
                                return (
                                    <div key={c.id} style={styles.card}>
                                        <div style={styles.header}>
                                            <h3 style={styles.name}>{c.name}</h3>

                                            <div style={styles.badges}>
                                                {/* 评分 */}
                                                {editingId === c.id ? (
                                                    <div style={styles.scoreEditBox}>
                                                        {["A", "B", "C", "D", "E"].map((lvl) => (
                                                            <button
                                                                key={lvl}
                                                                style={{
                                                                    ...styles.scoreEditBtn,
                                                                    backgroundColor: scoreColor(lvl),
                                                                }}
                                                                onClick={() => handleUpdateScore(c.id, lvl)}
                                                            >
                                                                {lvl}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span
                                                        style={{
                                                            ...styles.score,
                                                            backgroundColor: scoreColor(c.match_level),
                                                        }}
                                                        onClick={() => setEditingId(c.id)}
                                                        title="点击修改评分"
                                                    >
                                                        {c.match_level || "-"}
                                                    </span>
                                                )}

                                                {/* 合作状态 */}
                                                {editingCoopId === c.id ? (
                                                    <div style={styles.coopEditBox}>
                                                        {["未合作", "合作", "合作较差"].map((status) => (
                                                            <button
                                                                key={status}
                                                                style={{
                                                                    ...styles.coopEditBtn,
                                                                    backgroundColor: cooperationColor(status),
                                                                    color: status === "合作较差" ? "#fff" : "#000",
                                                                }}
                                                                onClick={() => handleUpdateCooperation(c.id, status)}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span
                                                        style={{
                                                            ...styles.coopStatus,
                                                            backgroundColor: cooperationColor(c.cooperation_status),
                                                            color: c.cooperation_status === "合作较差" ? "#fff" : "#000",
                                                        }}
                                                        onClick={() => setEditingCoopId(c.id)}
                                                        title="点击修改合作状态"
                                                    >
                                                        {c.cooperation_status || "未合作"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p style={styles.line}>
                                            🎓 {c.education || "学历未知"} · {c.major || "专业未填"}
                                        </p>
                                        <p style={styles.line}>🏫 {c.university || "毕业院校未填写"}</p>
                                        <p style={styles.line}>
                                            📅 {c.age ? `${c.age} 岁` : "年龄未知"} · 📍 {c.base || "地区未知"}
                                        </p>

                                        {exp && (
                                            <div style={styles.expBox}>
                                                <p style={styles.expTitle}>💼 最近经历</p>
                                                <p style={styles.expText}>
                                                    {exp.company || "-"} · {exp.position || "-"}
                                                </p>
                                                <p style={styles.expDesc}>{truncate(exp.description, 80)}</p>
                                            </div>
                                        )}

                                        <div style={styles.cardButtons}>
                                            <button
                                                style={styles.viewBtn}
                                                onClick={() => {
                                                    const fullUrl = c.resume_file.startsWith("http")
                                                        ? c.resume_file
                                                        : `http://127.0.0.1:8000${c.resume_file}`;
                                                    window.open(fullUrl, "_blank", "noopener,noreferrer");
                                                }}
                                            >
                                                📄 查看简历
                                            </button>
                                            <button
                                                style={styles.unfavoriteBtn}
                                                onClick={() => handleToggleFavorite(c.id)}
                                            >
                                                ★ 取消收藏
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* 页脚 */}
            <footer style={styles.footer}>
                © 2025 STEMHUB HRMS · Empowered by 思铺教育 · All Rights Reserved
            </footer>

            {/* 添加合作记录弹窗 */}
            <AddCooperationModal
                visible={cooperationModal.visible}
                candidate={cooperationModal.candidate}
                onClose={() => setCooperationModal({visible: false, candidate: null})}
                onSuccess={handleCooperationSuccess}
            />
        </div>
    );
}

/* ---------- 工具函数 ---------- */
function safeParseExperience(raw) {
    if (!raw) return [];
    try {
        const jsonStr =
            typeof raw === "string"
                ? raw
                    .replace(/'/g, '"')
                    .replace(/None/g, "null")
                    .replace(/True/g, "true")
                    .replace(/False/g, "false")
                : raw;
        const parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function truncate(str, len) {
    if (!str) return "";
    return str.length > len ? str.slice(0, len) + "..." : str;
}

/* ---------- 样式 ---------- */
const styles = {
    page: {
        backgroundColor: "#0b0b0b",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, sans-serif",
    },
    layout: {display: "flex", flex: 1},
    sidebar: {
        width: "220px",
        backgroundColor: "#121212",
        paddingTop: "20px",
        borderRight: "1px solid #333",
        display: "flex",
        flexDirection: "column",
    },
    menuItem: {
        padding: "14px 20px",
        cursor: "pointer",
        fontSize: "15px",
        transition: "0.2s",
    },
    content: {flex: 1, padding: "40px", overflowY: "auto"},
    title: {color: "#d4af37", fontSize: "28px", marginBottom: "10px"},
    subtitle: {color: "#aaa", marginBottom: "30px"},
    empty: {
        textAlign: "center",
        padding: "100px 20px",
        color: "#666",
    },
    goToLibraryBtn: {
        marginTop: "20px",
        backgroundColor: "#d4af37",
        color: "#000",
        border: "none",
        padding: "12px 24px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "24px",
    },
    card: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "14px",
        padding: "22px 26px",
        boxShadow: "0 0 20px rgba(212,175,55,0.1)",
        transition: "all 0.3s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },
    name: {fontSize: "20px", fontWeight: "bold", color: "#fff", flex: 1},
    badges: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
    },
    score: {
        color: "#000",
        borderRadius: "8px",
        padding: "4px 10px",
        fontWeight: "bold",
        fontSize: "13px",
        cursor: "pointer",
        transition: "0.2s",
    },
    scoreEditBox: {
        display: "flex",
        gap: "5px",
    },
    scoreEditBtn: {
        border: "none",
        borderRadius: "6px",
        padding: "4px 8px",
        color: "#000",
        fontWeight: "bold",
        cursor: "pointer",
    },
    coopStatus: {
        borderRadius: "8px",
        padding: "4px 10px",
        fontWeight: "bold",
        fontSize: "12px",
        cursor: "pointer",
        transition: "0.2s",
        border: "1px solid rgba(255,255,255,0.2)",
    },
    coopEditBox: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    coopEditBtn: {
        border: "none",
        borderRadius: "6px",
        padding: "3px 8px",
        fontWeight: "bold",
        fontSize: "11px",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },
    line: {color: "#ccc", fontSize: "14px", marginBottom: "6px"},
    expBox: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderLeft: "3px solid #d4af37",
        padding: "10px 12px",
        borderRadius: "8px",
        marginTop: "10px",
        marginBottom: "12px",
    },
    expTitle: {
        color: "#d4af37",
        fontWeight: "bold",
        marginBottom: "4px",
        fontSize: "14px",
    },
    expText: {color: "#fff", fontWeight: "600", fontSize: "14px"},
    expDesc: {color: "#aaa", fontSize: "13px", marginTop: "3px"},
    cardButtons: {
        display: "flex",
        gap: "10px",
    },
    viewBtn: {
        flex: 1,
        backgroundColor: "#d4af37",
        border: "none",
        borderRadius: "8px",
        padding: "10px 0",
        fontWeight: "bold",
        color: "#000",
        cursor: "pointer",
        transition: "0.2s",
    },
    unfavoriteBtn: {
        flex: 1,
        backgroundColor: "#d4af37",
        border: "none",
        borderRadius: "8px",
        padding: "10px 0",
        fontWeight: "bold",
        color: "#000",
        cursor: "pointer",
        transition: "0.2s",
    },
    footer: {
        textAlign: "center",
        padding: "12px",
        fontSize: "12px",
        color: "#aaa",
        borderTop: "1px solid #333",
    },
};

