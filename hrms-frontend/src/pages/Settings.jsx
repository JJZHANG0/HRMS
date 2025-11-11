// src/pages/Settings.jsx
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {http} from "../services/http";
import Navbar from "../components/Navbar";

export default function Settings() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState("settings");
    const username = localStorage.getItem("username") || "访客";

    // 统计数据
    const [stats, setStats] = useState({
        total: 0,
        scoreDistribution: {A: 0, B: 0, C: 0, D: 0, E: 0},
        cooperationDistribution: {},
        baseDistribution: {},
    });

    // 密码修改
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // 系统配置
    const [systemConfig, setSystemConfig] = useState({
        uploadPassword: "STEMHUB2025!",
        itemsPerPage: 20,
    });

    const [message, setMessage] = useState({visible: false, type: "", text: ""});
    const [loading, setLoading] = useState(false);
    const [isSuperuser, setIsSuperuser] = useState(false);

    // 获取统计数据和用户权限
    useEffect(() => {
        fetchStats();
        checkPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchStats = async () => {
        try {
            const res = await http.get("candidates/stats/");
            setStats(res.data);
        } catch (err) {
            console.error("获取统计数据失败:", err);
        }
    };

    // 检查用户权限
    const checkPermission = async () => {
        try {
            const res = await http.get("accounts/check-permission/", {
                params: {username}
            });
            setIsSuperuser(res.data.is_superuser);
        } catch (err) {
            console.error("检查权限失败:", err);
            setIsSuperuser(false);
        }
    };

    // 修改密码
    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage("error", "两次输入的新密码不一致");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showMessage("error", "新密码至少6位");
            return;
        }

        setLoading(true);
        try {
            await http.post("accounts/change-password/", {
                old_password: passwordForm.oldPassword,
                new_password: passwordForm.newPassword,
            });
            showMessage("success", "✅ 密码修改成功！");
            setPasswordForm({oldPassword: "", newPassword: "", confirmPassword: ""});
        } catch (err) {
            showMessage("error", "❌ 密码修改失败：" + (err.response?.data?.error || "请检查旧密码"));
        } finally {
            setLoading(false);
        }
    };

    // 导出Excel
    const handleExportExcel = async () => {
        setLoading(true);
        try {
            const res = await http.get("candidates/export/", {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `候选人数据_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showMessage("success", "✅ 数据导出成功！");
        } catch (err) {
            showMessage("error", "❌ 导出失败，请检查后端服务");
        } finally {
            setLoading(false);
        }
    };

    // 保存系统配置
    const handleSaveConfig = () => {
        localStorage.setItem("uploadPassword", systemConfig.uploadPassword);
        localStorage.setItem("itemsPerPage", systemConfig.itemsPerPage);
        showMessage("success", "✅ 系统配置已保存（本地）");
    };

    const showMessage = (type, text) => {
        setMessage({visible: true, type, text});
        setTimeout(() => setMessage({visible: false, type: "", text: ""}), 3000);
    };

    const getPercentage = (value, total) => {
        return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
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
                    <h1 style={styles.title}>⚙️ 系统设置</h1>
                    <p style={styles.subtitle}>管理系统配置与账户信息</p>

                    {/* 消息提示 */}
                    {message.visible && (
                        <div
                            style={{
                                ...styles.message,
                                backgroundColor: message.type === "success" ? "#52c41a" : "#ff4d4f",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* 设置卡片网格 */}
                    <div style={styles.grid}>
                        {/* 数据统计 */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>📊 候选人数据概览</h3>
                            <div style={styles.statsBox}>
                                <div style={styles.statItem}>
                                    <span style={styles.statLabel}>总候选人数</span>
                                    <span style={styles.statValue}>{stats.total} 人</span>
                                </div>
                            </div>

                            <h4 style={styles.subTitle}>评分分布</h4>
                            {["A", "B", "C", "D", "E"].map((level) => {
                                const count = stats.scoreDistribution[level] || 0;
                                const percentage = getPercentage(count, stats.total);
                                return (
                                    <div key={level} style={styles.barItem}>
                                        <span style={styles.barLabel}>
                                            {level}类：{count}人
                                        </span>
                                        <div style={styles.barBg}>
                                            <div
                                                style={{
                                                    ...styles.barFill,
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                        <span style={styles.barPercent}>{percentage}%</span>
                                    </div>
                                );
                            })}

                            <button style={styles.button} onClick={handleExportExcel} disabled={loading}>
                                {loading ? "导出中..." : "📥 导出Excel"}
                            </button>
                        </div>

                        {/* 修改密码 */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>🔐 修改登录密码</h3>
                            <div style={styles.form}>
                                <label style={styles.label}>旧密码</label>
                                <input
                                    type="password"
                                    placeholder="请输入旧密码"
                                    value={passwordForm.oldPassword}
                                    onChange={(e) =>
                                        setPasswordForm({...passwordForm, oldPassword: e.target.value})
                                    }
                                    style={styles.input}
                                />

                                <label style={styles.label}>新密码</label>
                                <input
                                    type="password"
                                    placeholder="至少6位"
                                    value={passwordForm.newPassword}
                                    onChange={(e) =>
                                        setPasswordForm({...passwordForm, newPassword: e.target.value})
                                    }
                                    style={styles.input}
                                />

                                <label style={styles.label}>确认新密码</label>
                                <input
                                    type="password"
                                    placeholder="再次输入新密码"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordForm({...passwordForm, confirmPassword: e.target.value})
                                    }
                                    style={styles.input}
                                />

                                <button
                                    style={styles.button}
                                    onClick={handlePasswordChange}
                                    disabled={loading}
                                >
                                    {loading ? "修改中..." : "保存修改"}
                                </button>
                            </div>
                        </div>

                        {/* 系统配置 - 仅超级管理员可见 */}
                        {isSuperuser && (
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>⚙️ 系统配置</h3>
                                <div style={styles.adminBadge}>🔐 仅超级管理员可见</div>
                                <div style={styles.form}>
                                    <label style={styles.label}>上传简历验证密码</label>
                                    <input
                                        type="text"
                                        placeholder="用于验证简历上传"
                                        value={systemConfig.uploadPassword}
                                        onChange={(e) =>
                                            setSystemConfig({...systemConfig, uploadPassword: e.target.value})
                                        }
                                        style={styles.input}
                                    />

                                    <label style={styles.label}>每页显示数量</label>
                                    <select
                                        value={systemConfig.itemsPerPage}
                                        onChange={(e) =>
                                            setSystemConfig({...systemConfig, itemsPerPage: e.target.value})
                                        }
                                        style={styles.input}
                                    >
                                        <option value="10">10 条/页</option>
                                        <option value="20">20 条/页</option>
                                        <option value="50">50 条/页</option>
                                        <option value="100">100 条/页</option>
                                    </select>

                                    <button style={styles.button} onClick={handleSaveConfig}>
                                        保存设置
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 系统信息 */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>ℹ️ 系统信息</h3>
                            <div style={styles.infoBox}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>系统版本</span>
                                    <span style={styles.infoValue}>v1.0.0</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>开发团队</span>
                                    <span style={styles.infoValue}>思铺教育</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>最后更新</span>
                                    <span style={styles.infoValue}>2025-10-26</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>AI服务</span>
                                    <span style={styles.infoValue}>通义千问 qwen-plus</span>
                                </div>
                            </div>

                            <div style={styles.helpBox}>
                                <p style={styles.helpText}>📖 使用帮助</p>
                                <p style={styles.helpDesc}>
                                    如遇问题，请联系技术支持
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* 页脚 */}
            <footer style={styles.footer}>
                © 2025 STEMHUB HRMS · Empowered by 思铺教育 · All Rights Reserved
            </footer>
        </div>
    );
}

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
    message: {
        padding: "15px 20px",
        borderRadius: "8px",
        marginBottom: "20px",
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px",
    },
    card: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "14px",
        padding: "24px",
        boxShadow: "0 0 20px rgba(212,175,55,0.1)",
    },
    cardTitle: {
        color: "#d4af37",
        fontSize: "20px",
        marginBottom: "20px",
        fontWeight: "bold",
    },
    subTitle: {
        color: "#ccc",
        fontSize: "16px",
        marginTop: "20px",
        marginBottom: "10px",
    },
    statsBox: {
        marginBottom: "20px",
    },
    statItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: "15px",
        backgroundColor: "rgba(212,175,55,0.1)",
        borderRadius: "8px",
        marginBottom: "10px",
    },
    statLabel: {color: "#ccc", fontSize: "14px"},
    statValue: {color: "#d4af37", fontSize: "24px", fontWeight: "bold"},
    barItem: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px",
    },
    barLabel: {color: "#ccc", fontSize: "13px", width: "80px"},
    barBg: {
        flex: 1,
        height: "20px",
        backgroundColor: "#222",
        borderRadius: "10px",
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        backgroundColor: "#d4af37",
        transition: "width 0.3s ease",
    },
    barPercent: {color: "#d4af37", fontSize: "13px", fontWeight: "bold", width: "45px", textAlign: "right"},
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    label: {color: "#ccc", fontSize: "14px", marginBottom: "-10px"},
    input: {
        padding: "10px 14px",
        backgroundColor: "#111",
        border: "1px solid #333",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
    },
    button: {
        backgroundColor: "#d4af37",
        color: "#0b0b0b",
        border: "none",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.2s",
        marginTop: "10px",
    },
    infoBox: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    infoItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #222",
    },
    infoLabel: {color: "#aaa", fontSize: "14px"},
    infoValue: {color: "#fff", fontSize: "14px", fontWeight: "bold"},
    helpBox: {
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "rgba(212,175,55,0.1)",
        borderRadius: "8px",
        borderLeft: "3px solid #d4af37",
    },
    helpText: {color: "#d4af37", fontSize: "14px", fontWeight: "bold", marginBottom: "5px"},
    helpDesc: {color: "#ccc", fontSize: "13px", margin: 0},
    adminBadge: {
        display: "inline-block",
        backgroundColor: "rgba(212,175,55,0.2)",
        border: "1px solid #d4af37",
        color: "#d4af37",
        padding: "4px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "bold",
        marginBottom: "15px",
    },
    footer: {
        textAlign: "center",
        padding: "12px",
        fontSize: "12px",
        color: "#aaa",
        borderTop: "1px solid #333",
    },
};

