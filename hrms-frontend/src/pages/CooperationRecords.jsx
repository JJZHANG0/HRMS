// src/pages/CooperationRecords.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CooperationRecords() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [activeMenu, setActiveMenu] = useState("records");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    const itemsPerPage = 20;
    const username = localStorage.getItem("username") || "访客";

    // 获取合作记录
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/candidates/cooperations/");
            setRecords(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error("获取合作记录失败:", err);
        }
    };

    // 搜索过滤
    useEffect(() => {
        let result = records.filter(
            (r) =>
                r.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
                r.project_name?.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
        setCurrentPage(1);
    }, [search, records]);

    // 分页
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    // 格式化日期
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("zh-CN");
    };

    // 计算合作天数
    const getDuration = (start, end) => {
        if (!start) return "-";
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days}天` : "-";
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
                    <h1 style={styles.title}>📄 合作记录管理</h1>
                    <p style={styles.subtitle}>
                        共 {filtered.length} 条合作记录
                        {totalPages > 1 && ` · 第 ${currentPage} / ${totalPages} 页`}
                    </p>

                    {/* 搜索栏 */}
                    <div style={styles.toolbar}>
                        <input
                            type="text"
                            placeholder="🔍 搜索候选人姓名 / 项目名称"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.search}
                        />
                    </div>

                    {/* 合作记录列表 */}
                    <div style={styles.recordsList}>
                        {currentItems.length === 0 ? (
                            <div style={styles.empty}>
                                <p style={{fontSize: "48px"}}>📋</p>
                                <p>暂无合作记录</p>
                            </div>
                        ) : (
                            currentItems.map((record) => (
                                <div key={record.id} style={styles.recordCard}>
                                    <div style={styles.recordHeader}>
                                        <div style={styles.recordLeft}>
                                            <h3 style={styles.candidateName}>{record.candidate_name}</h3>
                                            <span style={styles.projectBadge}>
                                                {record.project_name || "未命名项目"}
                                            </span>
                                        </div>
                                        <div style={styles.recordRight}>
                                            <span style={styles.dateRange}>
                                                📅 {formatDate(record.start_date)} ~ {formatDate(record.end_date) || "进行中"}
                                            </span>
                                            <button
                                                style={styles.expandBtn}
                                                onClick={() =>
                                                    setExpandedId(expandedId === record.id ? null : record.id)
                                                }
                                            >
                                                {expandedId === record.id ? "收起 ▲" : "详情 ▼"}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedId === record.id && (
                                        <div style={styles.recordDetails}>
                                            <div style={styles.detailGrid}>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>角色/岗位</span>
                                                    <span style={styles.detailValue}>{record.role || "-"}</span>
                                                </div>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>薪资</span>
                                                    <span style={styles.detailValue}>{record.salary || "-"}</span>
                                                </div>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>合作时长</span>
                                                    <span style={styles.detailValue}>
                                                        {getDuration(record.start_date, record.end_date)}
                                                    </span>
                                                </div>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>合作结果</span>
                                                    <span
                                                        style={{
                                                            ...styles.detailValue,
                                                            color: getResultColor(record.cooperation_result),
                                                        }}
                                                    >
                                                        {record.cooperation_result || "-"}
                                                    </span>
                                                </div>
                                            </div>

                                            {record.evaluation && (
                                                <div style={styles.evaluationBox}>
                                                    <span style={styles.detailLabel}>表现评价</span>
                                                    <p style={styles.evaluationText}>{record.evaluation}</p>
                                                </div>
                                            )}

                                            {record.agreement_file && (
                                                <button
                                                    style={styles.viewAgreementBtn}
                                                    onClick={() => window.open(record.agreement_file, "_blank")}
                                                >
                                                    📄 查看兼职协议
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div style={styles.pagination}>
                            <button
                                style={{
                                    ...styles.pageButton,
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                }}
                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ← 上一页
                            </button>
                            <span style={styles.pageInfo}>
                                第 {currentPage} / {totalPages} 页
                            </span>
                            <button
                                style={{
                                    ...styles.pageButton,
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                }}
                                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                下一页 →
                            </button>
                        </div>
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

const getResultColor = (result) => {
    switch (result) {
        case "优秀":
            return "#52c41a";
        case "良好":
            return "#1890ff";
        case "一般":
            return "#faad14";
        case "不再合作":
            return "#ff4d4f";
        default:
            return "#aaa";
    }
};

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
    toolbar: {marginBottom: "30px"},
    search: {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        backgroundColor: "#111",
        border: "1px solid #333",
        color: "#fff",
        fontSize: "14px",
    },
    recordsList: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    empty: {
        textAlign: "center",
        padding: "80px 20px",
        color: "#666",
        fontSize: "16px",
    },
    recordCard: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "20px",
        transition: "all 0.3s ease",
    },
    recordHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    recordLeft: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    candidateName: {
        color: "#fff",
        fontSize: "20px",
        fontWeight: "bold",
        margin: 0,
    },
    projectBadge: {
        backgroundColor: "rgba(212,175,55,0.2)",
        color: "#d4af37",
        padding: "4px 12px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: "bold",
    },
    recordRight: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    dateRange: {
        color: "#aaa",
        fontSize: "14px",
    },
    expandBtn: {
        backgroundColor: "transparent",
        border: "1px solid #d4af37",
        color: "#d4af37",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "bold",
    },
    recordDetails: {
        marginTop: "20px",
        paddingTop: "20px",
        borderTop: "1px solid #333",
    },
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "15px",
        marginBottom: "15px",
    },
    detailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    detailLabel: {
        color: "#888",
        fontSize: "12px",
    },
    detailValue: {
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
    },
    evaluationBox: {
        backgroundColor: "rgba(212,175,55,0.05)",
        padding: "15px",
        borderRadius: "8px",
        borderLeft: "3px solid #d4af37",
        marginTop: "15px",
    },
    evaluationText: {
        color: "#ccc",
        fontSize: "14px",
        lineHeight: "1.6",
        margin: "8px 0 0 0",
    },
    viewAgreementBtn: {
        backgroundColor: "#d4af37",
        color: "#000",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        marginTop: "15px",
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        marginTop: "40px",
        padding: "20px",
    },
    pageButton: {
        backgroundColor: "transparent",
        border: "1px solid #d4af37",
        color: "#d4af37",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
    },
    pageInfo: {
        color: "#d4af37",
        fontSize: "14px",
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

