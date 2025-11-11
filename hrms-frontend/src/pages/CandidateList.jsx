import React, {useEffect, useState} from "react";
import {http, getBackendFileUrl} from "../services/http";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import AddCooperationModal from "../components/AddCooperationModal";

export default function Candidates() {
    const [candidates, setCandidates] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [cooperationFilter, setCooperationFilter] = useState("all");
    const [educationFilter, setEducationFilter] = useState("all");
    const [baseFilter, setBaseFilter] = useState("all");
    const [ageFilter, setAgeFilter] = useState("all");
    const [editingId, setEditingId] = useState(null);
    const [editingCoopId, setEditingCoopId] = useState(null);
    const [activeMenu, setActiveMenu] = useState("candidates");
    const [currentPage, setCurrentPage] = useState(1);
    const [cooperationModal, setCooperationModal] = useState({visible: false, candidate: null});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const itemsPerPage = 20; // 每页显示20个
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "访客";

    // 🧩 获取数据（包含收藏状态）
    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await http.get("candidates/");
            const favRes = await http.get("candidates/favorites/my/", {
                params: {username}
            });
            
            // 创建收藏ID集合
            const favoritedIds = new Set(favRes.data.map(f => f.id));
            
            const data = res.data.map((c) => ({
                ...c,
                experienceList: safeParseExperience(c.experience),
                is_favorited: favoritedIds.has(c.id),
            }));
            setCandidates(data);
            setFiltered(data);
        } catch (err) {
            console.error("获取数据失败:", err);
        }
    };

    // 🔍 搜索 + 筛选
    useEffect(() => {
        let result = candidates;

        // 扩展搜索范围：姓名、院校、专业、电话、邮箱、城市、工作经历
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name?.toLowerCase().includes(searchLower) ||
                    c.university?.toLowerCase().includes(searchLower) ||
                    c.major?.toLowerCase().includes(searchLower) ||
                    c.phone?.toLowerCase().includes(searchLower) ||
                    c.email?.toLowerCase().includes(searchLower) ||
                    c.base?.toLowerCase().includes(searchLower) ||
                    c.experience?.toLowerCase().includes(searchLower)
            );
        }

        // 匹配度筛选
        if (filter !== "all") {
            result = result.filter((c) => c.match_level === filter);
        }

        // 合作状态筛选
        if (cooperationFilter !== "all") {
            result = result.filter((c) => c.cooperation_status === cooperationFilter);
        }

        // 学历筛选
        if (educationFilter !== "all") {
            result = result.filter((c) => c.education === educationFilter);
        }

        // 城市筛选
        if (baseFilter !== "all") {
            result = result.filter((c) => c.base === baseFilter);
        }

        // 年龄筛选
        if (ageFilter !== "all") {
            result = result.filter((c) => {
                if (!c.age) return false;
                switch (ageFilter) {
                    case "20-25":
                        return c.age >= 20 && c.age <= 25;
                    case "26-30":
                        return c.age >= 26 && c.age <= 30;
                    case "31-35":
                        return c.age >= 31 && c.age <= 35;
                    case "36+":
                        return c.age >= 36;
                    default:
                        return true;
                }
            });
        }

        setFiltered(result);
        setCurrentPage(1); // 重置到第一页
    }, [search, filter, cooperationFilter, educationFilter, baseFilter, ageFilter, candidates]);


    // 🧠 更新评分
    const handleUpdateScore = async (id, newScore) => {
        try {
            await http.patch(`candidates/${id}/`, {
                match_level: newScore,
            });
            setCandidates((prev) =>
                prev.map((c) => (c.id === id ? {...c, match_level: newScore} : c))
            );
            setEditingId(null);
        } catch (err) {
            alert("❌ 更新失败，请检查后端是否允许 PATCH 操作");
        }
    };

    // 🤝 更新合作状态
    const handleUpdateCooperation = async (id, newStatus) => {
        // 如果选择"合作"，打开添加合作记录弹窗
        if (newStatus === "合作") {
            const candidate = candidates.find((c) => c.id === id);
            setCooperationModal({visible: true, candidate});
            setEditingCoopId(null);
            return;
        }

        try {
            await http.patch(`candidates/${id}/`, {
                cooperation_status: newStatus,
            });
            setCandidates((prev) =>
                prev.map((c) => (c.id === id ? {...c, cooperation_status: newStatus} : c))
            );
            setEditingCoopId(null);
        } catch (err) {
            alert("❌ 更新失败，请检查后端连接");
        }
    };

    // 合作记录添加成功后的回调
    const handleCooperationSuccess = () => {
        fetchCandidates();
    };

    // ⭐ 收藏/取消收藏
    const handleToggleFavorite = async (candidateId) => {
        try {
            const res = await http.post("candidates/favorites/toggle/", {
                username,
                candidate_id: candidateId,
            });
            
            // 更新本地状态
            setCandidates((prev) =>
                prev.map((c) => 
                    c.id === candidateId ? {...c, is_favorited: res.data.is_favorited} : c
                )
            );
        } catch (err) {
            alert("❌ 操作失败，请重试");
        }
    };

    // 📄 分页计算
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filtered.slice(startIndex, endIndex);

    // 生成页码数组
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // 最多显示5个页码

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    // 🎨 评分颜色
    const scoreColor = (score) => {
        switch (score) {
            case "A":
                return "#FFD700"; // 金色
            case "B":
                return "#C0C0C0"; // 银色
            case "C":
                return "#A8A8A8"; // 灰
            case "D":
                return "#555"; // 暗灰
            case "E":
                return "#d9534f"; // 红
            default:
                return "#999";
        }
    };

    // 🎨 合作状态颜色
    const cooperationColor = (status) => {
        switch (status) {
            case "合作":
                return "#ffc107"; // 黄色
            case "合作较差":
                return "#333"; // 黑色
            case "未合作":
                return "#666"; // 灰色
            default:
                return "#666";
        }
    };

    // 🔍 关键词高亮函数
    const highlightText = (text, keyword) => {
        if (!text || !keyword) return text;
        const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
                <span key={index} style={{backgroundColor: '#d4af37', color: '#000', fontWeight: 'bold'}}>
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <div style={styles.page}>
            {/* ✅ 顶部导航 */}
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

                {/* ✅ 主体内容 */}
                <div style={styles.content}>
                <h1 style={styles.title}>👤 人才库管理</h1>
                <p style={styles.subtitle}>
                    共 {filtered.length} 位候选人 
                    {totalPages > 1 && ` · 第 ${currentPage} / ${totalPages} 页`}
                </p>

                {/* 搜索框 */}
                <div style={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="🔍 全局搜索：姓名 / 院校 / 专业 / 电话 / 邮箱 / 城市 / 工作经历（关键词会标红）"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.search}
                    />
                    <button
                        style={styles.advancedFilterToggle}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        {showAdvancedFilters ? "收起筛选 ▲" : "高级筛选 ▼"}
                    </button>
                </div>

                {/* 高级筛选器 */}
                {showAdvancedFilters && (
                    <div style={styles.advancedFilters}>
                        {/* 匹配度筛选 */}
                        <div style={styles.filterRow}>
                            <span style={styles.filterLabel}>匹配度：</span>
                            <div style={styles.filters}>
                                {["all", "A", "B", "C", "D", "E"].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setFilter(lvl)}
                                        style={{
                                            ...styles.filterBtn,
                                            backgroundColor:
                                                filter === lvl ? "#d4af37" : "rgba(255,255,255,0.08)",
                                            color: filter === lvl ? "#000" : "#fff",
                                        }}
                                    >
                                        {lvl === "all" ? "全部" : lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 合作状态筛选 */}
                        <div style={styles.filterRow}>
                            <span style={styles.filterLabel}>合作状态：</span>
                            <div style={styles.filters}>
                                {["all", "未合作", "合作", "合作较差"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setCooperationFilter(status)}
                                        style={{
                                            ...styles.filterBtn,
                                            backgroundColor:
                                                cooperationFilter === status ? "#d4af37" : "rgba(255,255,255,0.08)",
                                            color: cooperationFilter === status ? "#000" : "#fff",
                                        }}
                                    >
                                        {status === "all" ? "全部" : status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 学历筛选 */}
                        <div style={styles.filterRow}>
                            <span style={styles.filterLabel}>学历：</span>
                            <div style={styles.filters}>
                                {["all", "本科", "硕士", "博士"].map((edu) => (
                                    <button
                                        key={edu}
                                        onClick={() => setEducationFilter(edu)}
                                        style={{
                                            ...styles.filterBtn,
                                            backgroundColor:
                                                educationFilter === edu ? "#d4af37" : "rgba(255,255,255,0.08)",
                                            color: educationFilter === edu ? "#000" : "#fff",
                                        }}
                                    >
                                        {edu === "all" ? "全部" : edu}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 城市筛选 */}
                        <div style={styles.filterRow}>
                            <span style={styles.filterLabel}>城市：</span>
                            <div style={styles.filters}>
                                {["all", "上海", "杭州", "广州", "南京", "宁波", "远程"].map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => setBaseFilter(city)}
                                        style={{
                                            ...styles.filterBtn,
                                            backgroundColor:
                                                baseFilter === city ? "#d4af37" : "rgba(255,255,255,0.08)",
                                            color: baseFilter === city ? "#000" : "#fff",
                                        }}
                                    >
                                        {city === "all" ? "全部" : city}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 年龄范围筛选 */}
                        <div style={styles.filterRow}>
                            <span style={styles.filterLabel}>年龄：</span>
                            <div style={styles.filters}>
                                {["all", "20-25", "26-30", "31-35", "36+"].map((age) => (
                                    <button
                                        key={age}
                                        onClick={() => setAgeFilter(age)}
                                        style={{
                                            ...styles.filterBtn,
                                            backgroundColor:
                                                ageFilter === age ? "#d4af37" : "rgba(255,255,255,0.08)",
                                            color: ageFilter === age ? "#000" : "#fff",
                                        }}
                                    >
                                        {age === "all" ? "全部" : age}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 重置按钮 */}
                        <div style={styles.filterRow}>
                            <button
                                style={styles.resetBtn}
                                onClick={() => {
                                    setFilter("all");
                                    setCooperationFilter("all");
                                    setEducationFilter("all");
                                    setBaseFilter("all");
                                    setAgeFilter("all");
                                }}
                            >
                                🔄 重置所有筛选
                            </button>
                        </div>
                    </div>
                )}

                {/* ✅ 候选人卡片 */}
                <div style={styles.grid}>
                    {currentItems.map((c) => {
                        const exp = c.experienceList?.[0];
                        return (
                            <div key={c.id} style={styles.card}>
                                <div style={styles.header}>
                                    <h3 style={styles.name}>{highlightText(c.name, search)}</h3>

                                    <div style={styles.badges}>
                                        {/* 点击评分 */}
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
                                    🎓 {c.education || "学历未知"} · {highlightText(c.major, search) || "专业未填"}
                                </p>
                                <p style={styles.line}>🏫 {highlightText(c.university, search) || "毕业院校未填写"}</p>
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
                                            const fullUrl = getBackendFileUrl(c.resume_file);
                                            if (fullUrl) {
                                                window.open(fullUrl, "_blank", "noopener,noreferrer");
                                            }
                                        }}
                                    >
                                        📄 查看简历
                                    </button>
                                    <button
                                        style={{
                                            ...styles.favoriteBtn,
                                            backgroundColor: c.is_favorited ? "#d4af37" : "transparent",
                                            color: c.is_favorited ? "#000" : "#d4af37",
                                        }}
                                        onClick={() => handleToggleFavorite(c.id)}
                                        title={c.is_favorited ? "取消收藏" : "添加收藏"}
                                    >
                                        {c.is_favorited ? "★ 已收藏" : "☆ 收藏"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 📄 分页控件 */}
                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button
                            style={{
                                ...styles.pageButton,
                                opacity: currentPage === 1 ? 0.5 : 1,
                                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            }}
                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ← 上一页
                        </button>

                        <div style={styles.pageNumbers}>
                            {getPageNumbers().map((page, idx) => {
                                if (page === "...") {
                                    return (
                                        <span key={`ellipsis-${idx}`} style={styles.ellipsis}>
                                            ...
                                        </span>
                                    );
                                }
                                return (
                                    <button
                                        key={page}
                                        style={{
                                            ...styles.pageNumber,
                                            backgroundColor: currentPage === page ? "#d4af37" : "transparent",
                                            color: currentPage === page ? "#000" : "#fff",
                                            border: currentPage === page ? "none" : "1px solid #333",
                                        }}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            style={{
                                ...styles.pageButton,
                                opacity: currentPage === totalPages ? 0.5 : 1,
                                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            }}
                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            下一页 →
                        </button>
                    </div>
                )}
            </div>
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
    searchBar: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
    },
    advancedFilterToggle: {
        backgroundColor: "rgba(212,175,55,0.1)",
        border: "1px solid #d4af37",
        color: "#d4af37",
        padding: "10px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        transition: "0.2s",
    },
    advancedFilters: {
        backgroundColor: "#141414",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 0 20px rgba(212,175,55,0.1)",
    },
    filterRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: "15px",
        gap: "10px",
    },
    filterLabel: {
        color: "#d4af37",
        fontSize: "14px",
        fontWeight: "bold",
        width: "100px",
        flexShrink: 0,
    },
    filters: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        flex: 1,
    },
    resetBtn: {
        backgroundColor: "transparent",
        border: "1px solid #666",
        color: "#aaa",
        padding: "8px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "0.2s",
        marginLeft: "auto",
    },
    search: {
        flex: 1,
        padding: "10px 14px",
        borderRadius: "8px",
        backgroundColor: "#111",
        border: "1px solid #333",
        color: "#fff",
    },
    filters: {display: "flex", gap: "10px"},
    filterBtn: {
        padding: "8px 14px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "0.2s",
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
    favoriteBtn: {
        flex: 1,
        border: "1px solid #d4af37",
        borderRadius: "8px",
        padding: "10px 0",
        fontWeight: "bold",
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
    // 分页样式
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        marginTop: "40px",
        marginBottom: "20px",
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
        transition: "all 0.2s",
    },
    pageNumbers: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
    },
    pageNumber: {
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "all 0.2s",
    },
    ellipsis: {
        color: "#666",
        fontSize: "16px",
        padding: "0 5px",
    },
};
