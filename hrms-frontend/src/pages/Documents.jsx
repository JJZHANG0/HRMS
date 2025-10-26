// src/pages/Documents.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Documents() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [activeMenu, setActiveMenu] = useState("documents");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const username = localStorage.getItem("username") || "访客";

    // 获取所有有协议的合作记录
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/candidates/cooperations/");
            // 只保留有协议文件的记录
            const withAgreements = res.data.filter(record => record.agreement_file);
            setDocuments(withAgreements);
            setFiltered(withAgreements);
        } catch (err) {
            console.error("获取协议失败:", err);
        }
    };

    // 搜索过滤
    useEffect(() => {
        let result = documents.filter(
            (doc) =>
                doc.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
                doc.project_name?.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
        setCurrentPage(1);
    }, [search, documents]);

    // 分页
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    // 格式化日期
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("zh-CN");
    };

    // 获取文件名
    const getFileName = (filePath) => {
        if (!filePath) return "协议文件";
        return filePath.split('/').pop();
    };

    // 打开协议文件
    const openAgreement = (fileUrl) => {
        if (!fileUrl) return;
        const fullUrl = fileUrl.startsWith("http") ? fileUrl : `http://127.0.0.1:8000${fileUrl}`;
        window.open(fullUrl, "_blank");
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
                    <h1 style={styles.title}>📁 兼职协议档案</h1>
                    <p style={styles.subtitle}>
                        共 {filtered.length} 份协议文件
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

                    {/* 协议列表 */}
                    {currentItems.length === 0 ? (
                        <div style={styles.empty}>
                            <p style={{fontSize: "48px"}}>📂</p>
                            <p>暂无协议文件</p>
                            <p style={{fontSize: "14px", color: "#666"}}>
                                在添加合作记录时上传协议文件后，会在此处显示
                            </p>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {currentItems.map((doc) => (
                                <div key={doc.id} style={styles.docCard}>
                                    <div style={styles.docIcon}>📄</div>
                                    <div style={styles.docInfo}>
                                        <h3 style={styles.docName}>{doc.candidate_name}</h3>
                                        <p style={styles.docProject}>{doc.project_name}</p>
                                        <div style={styles.docMeta}>
                                            <span style={styles.metaItem}>
                                                📅 {formatDate(doc.start_date)} ~ {formatDate(doc.end_date) || "进行中"}
                                            </span>
                                            {doc.role && (
                                                <span style={styles.metaItem}>👔 {doc.role}</span>
                                            )}
                                        </div>
                                        <p style={styles.fileName}>{getFileName(doc.agreement_file)}</p>
                                    </div>
                                    <div style={styles.docActions}>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={() => openAgreement(doc.agreement_file)}
                                        >
                                            📖 查看
                                        </button>
                                        <button
                                            style={styles.downloadBtn}
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = doc.agreement_file.startsWith("http") 
                                                    ? doc.agreement_file 
                                                    : `http://127.0.0.1:8000${doc.agreement_file}`;
                                                link.download = getFileName(doc.agreement_file);
                                                link.click();
                                            }}
                                        >
                                            📥 下载
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
    empty: {
        textAlign: "center",
        padding: "100px 20px",
        color: "#666",
        fontSize: "16px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px",
    },
    docCard: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        transition: "all 0.3s ease",
        cursor: "pointer",
    },
    docIcon: {
        fontSize: "48px",
        textAlign: "center",
    },
    docInfo: {
        flex: 1,
    },
    docName: {
        color: "#fff",
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "5px",
    },
    docProject: {
        color: "#d4af37",
        fontSize: "14px",
        marginBottom: "10px",
    },
    docMeta: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        marginBottom: "10px",
    },
    metaItem: {
        color: "#aaa",
        fontSize: "13px",
    },
    fileName: {
        color: "#888",
        fontSize: "12px",
        fontStyle: "italic",
        wordBreak: "break-all",
    },
    docActions: {
        display: "flex",
        gap: "10px",
    },
    viewBtn: {
        flex: 1,
        backgroundColor: "#d4af37",
        color: "#000",
        border: "none",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.2s",
    },
    downloadBtn: {
        flex: 1,
        backgroundColor: "transparent",
        color: "#d4af37",
        border: "1px solid #d4af37",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.2s",
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

