import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const navigate = useNavigate();
    const [username] = useState(() => localStorage.getItem("username") || "访客");
    const [activeMenu, setActiveMenu] = useState("home");
    const [stats, setStats] = useState({
        total: 0,
        scoreDistribution: {},
        cooperationDistribution: {},
        baseDistribution: {},
        majorDistribution: {},
    });
    const [loading, setLoading] = useState(true);

    // 获取统计数据
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/candidates/stats/");
            setStats(res.data);
        } catch (err) {
            console.error("获取统计数据失败:", err);
        } finally {
            setLoading(false);
        }
    };

    // 计算已合作人数
    const getCooperatedCount = () => {
        return (stats.cooperationDistribution["合作"] || 0) + 
               (stats.cooperationDistribution["合作较差"] || 0);
    };

    // 获取百分比
    const getPercentage = (value, total) => {
        return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    };

    // 获取Top5数据
    const getTop5 = (distribution) => {
        return Object.entries(distribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    return (
        <div style={styles.dashboard}>
            {/* 顶部导航栏 */}
            <Navbar username={username} activeMenu={activeMenu} onMenuChange={setActiveMenu} />

            {/* 主体布局 */}
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
                <main style={styles.main}>
                    <h1 style={{color: "#d4af37"}}>欢迎回来，{username}</h1>
                    <p style={{color: "#aaa", marginBottom: "30px"}}>
                        系统数据概览
                    </p>

                    {loading ? (
                        <div style={styles.loading}>加载中...</div>
                    ) : (
                        <>
                            {/* 核心指标卡片 */}
                            <div style={styles.metricsGrid}>
                                <div style={styles.metricCard}>
                                    <div style={styles.metricIcon}>👥</div>
                                    <div style={styles.metricInfo}>
                                        <h3 style={styles.metricValue}>{stats.total}</h3>
                                        <p style={styles.metricLabel}>人才总数</p>
                                    </div>
                                </div>
                                <div style={styles.metricCard}>
                                    <div style={styles.metricIcon}>🤝</div>
                                    <div style={styles.metricInfo}>
                                        <h3 style={styles.metricValue}>{getCooperatedCount()}</h3>
                                        <p style={styles.metricLabel}>已合作</p>
                                    </div>
                                </div>
                                <div style={styles.metricCard}>
                                    <div style={styles.metricIcon}>⏳</div>
                                    <div style={styles.metricInfo}>
                                        <h3 style={styles.metricValue}>
                                            {stats.cooperationDistribution["未合作"] || 0}
                                        </h3>
                                        <p style={styles.metricLabel}>待合作</p>
                                    </div>
                                </div>
                                <div style={styles.metricCard}>
                                    <div style={styles.metricIcon}>⭐</div>
                                    <div style={styles.metricInfo}>
                                        <h3 style={styles.metricValue}>
                                            {(stats.scoreDistribution["A"] || 0) + 
                                             (stats.scoreDistribution["B"] || 0)}
                                        </h3>
                                        <p style={styles.metricLabel}>优质人才(A+B)</p>
                                    </div>
                                </div>
                            </div>

                            {/* 数据图表区 */}
                            <div style={styles.chartsGrid}>
                                {/* 城市分布 */}
                                <div style={styles.chartCard}>
                                    <h3 style={styles.chartTitle}>📍 城市分布 TOP5</h3>
                                    <div style={styles.chartContent}>
                                        {getTop5(stats.baseDistribution).length > 0 ? (
                                            getTop5(stats.baseDistribution).map(([city, count]) => (
                                                <div key={city} style={styles.barItem}>
                                                    <span style={styles.barLabel}>{city}</span>
                                                    <div style={styles.barContainer}>
                                                        <div
                                                            style={{
                                                                ...styles.barFill,
                                                                width: `${getPercentage(count, stats.total)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={styles.barValue}>{count}人</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={styles.emptyChart}>暂无数据</p>
                                        )}
                                    </div>
                                </div>

                                {/* 评分分布 */}
                                <div style={styles.chartCard}>
                                    <h3 style={styles.chartTitle}>📊 人才评分分布</h3>
                                    <div style={styles.chartContent}>
                                        {["A", "B", "C", "D", "E"].map((level) => {
                                            const count = stats.scoreDistribution[level] || 0;
                                            return (
                                                <div key={level} style={styles.barItem}>
                                                    <span style={{...styles.barLabel, color: getScoreColor(level)}}>
                                                        {level}类
                                                    </span>
                                                    <div style={styles.barContainer}>
                                                        <div
                                                            style={{
                                                                ...styles.barFill,
                                                                width: `${getPercentage(count, stats.total)}%`,
                                                                backgroundColor: getScoreColor(level),
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={styles.barValue}>{count}人</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 专业分布 */}
                                <div style={styles.chartCard}>
                                    <h3 style={styles.chartTitle}>🎓 专业分布 TOP5</h3>
                                    <div style={styles.chartContent}>
                                        {getTop5(stats.majorDistribution).length > 0 ? (
                                            getTop5(stats.majorDistribution).map(([major, count]) => (
                                                <div key={major} style={styles.barItem}>
                                                    <span style={styles.barLabel}>{major}</span>
                                                    <div style={styles.barContainer}>
                                                        <div
                                                            style={{
                                                                ...styles.barFill,
                                                                width: `${getPercentage(count, stats.total)}%`,
                                                                backgroundColor: "#52c41a",
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={styles.barValue}>{count}人</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={styles.emptyChart}>暂无数据</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 快捷入口 */}
                            <h3 style={{...styles.chartTitle, marginTop: "30px", marginBottom: "20px"}}>
                                🚀 快捷入口
                            </h3>
                            <div style={styles.cardGrid}>
                                {[
                                    {icon: "👤", title: "人才库管理", desc: "查看与筛选候选人信息", path: "/candidates"},
                                    {icon: "📄", title: "合作记录", desc: "追踪历史合作情况", path: "/cooperation-records"},
                                    {icon: "📁", title: "档案与协议", desc: "管理兼职协议文件", path: "/documents"},
                                    {icon: "⚙️", title: "系统设置", desc: "修改账户与安全设置", path: "/settings"},
                                ].map((card, i) => (
                                    <div 
                                        key={i} 
                                        style={styles.card}
                                        onClick={() => {
                                            if (card.path && card.path !== "#") {
                                                navigate(card.path);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            if (card.path && card.path !== "#") {
                                                e.currentTarget.style.transform = "translateY(-5px)";
                                                e.currentTarget.style.boxShadow = "0 0 25px rgba(212,175,55,0.3)";
                                                e.currentTarget.style.borderColor = "#d4af37";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(212,175,55,0.15)";
                                            e.currentTarget.style.borderColor = "#333";
                                        }}
                                    >
                                        <div style={styles.cardIcon}>{card.icon}</div>
                                        <h3 style={styles.cardTitle}>{card.title}</h3>
                                        <p style={styles.cardDesc}>{card.desc}</p>
                                        {card.path !== "#" && (
                                            <div style={styles.cardArrow}>→</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* 页脚 */}
            <footer style={styles.footer}>
                © 2025 STEMHUB HRMS · Empowered by 思铺教育 · All Rights Reserved
            </footer>
        </div>
    );
}

// 评分颜色
const getScoreColor = (score) => {
    switch (score) {
        case "A": return "#FFD700";
        case "B": return "#C0C0C0";
        case "C": return "#A8A8A8";
        case "D": return "#666";
        case "E": return "#ff4d4f";
        default: return "#999";
    }
};

// 合作状态颜色
const getCoopColor = (status) => {
    switch (status) {
        case "合作": return "#ffc107";
        case "合作较差": return "#666";
        case "未合作": return "#888";
        default: return "#999";
    }
};

// 🎨 样式
const styles = {
    dashboard: {
        fontFamily: "Poppins, sans-serif",
        color: "#fff",
        backgroundColor: "#0b0b0b",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
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
    main: {
        flex: 1,
        padding: "40px",
        overflowY: "auto",
    },
    loading: {
        textAlign: "center",
        padding: "100px",
        color: "#d4af37",
        fontSize: "18px",
    },
    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
    },
    metricCard: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        boxShadow: "0 0 20px rgba(212,175,55,0.1)",
    },
    metricIcon: {
        fontSize: "48px",
    },
    metricInfo: {
        flex: 1,
    },
    metricValue: {
        color: "#d4af37",
        fontSize: "36px",
        fontWeight: "bold",
        margin: "0 0 5px 0",
    },
    metricLabel: {
        color: "#aaa",
        fontSize: "14px",
        margin: 0,
    },
    chartsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
    },
    chartCard: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 0 20px rgba(212,175,55,0.1)",
    },
    chartTitle: {
        color: "#d4af37",
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "20px",
    },
    chartContent: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    barItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    barLabel: {
        color: "#ccc",
        fontSize: "14px",
        width: "80px",
        fontWeight: "500",
    },
    barContainer: {
        flex: 1,
        height: "24px",
        backgroundColor: "#222",
        borderRadius: "12px",
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        backgroundColor: "#d4af37",
        transition: "width 0.5s ease",
        boxShadow: "0 0 10px rgba(212,175,55,0.5)",
    },
    barValue: {
        color: "#d4af37",
        fontSize: "14px",
        fontWeight: "bold",
        width: "50px",
        textAlign: "right",
    },
    emptyChart: {
        textAlign: "center",
        color: "#666",
        fontSize: "14px",
        padding: "20px",
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
    },
    card: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "10px",
        padding: "24px",
        textAlign: "center",
        transition: "all 0.3s ease",
        boxShadow: "0 0 10px rgba(212,175,55,0.15)",
        cursor: "pointer",
        position: "relative",
    },
    cardIcon: {
        fontSize: "28px",
        marginBottom: "10px",
    },
    cardTitle: {
        color: "#d4af37",
        fontWeight: "bold",
        fontSize: "18px",
        marginBottom: "8px",
    },
    cardDesc: {
        color: "#aaa",
        fontSize: "14px",
    },
    cardArrow: {
        position: "absolute",
        bottom: "15px",
        right: "20px",
        fontSize: "20px",
        color: "#d4af37",
        fontWeight: "bold",
    },
    footer: {
        textAlign: "center",
        padding: "12px",
        fontSize: "12px",
        color: "#aaa",
        borderTop: "1px solid #333",
    },
};
