// src/components/AddCooperationModal.jsx
import React, {useState} from "react";
import {http} from "../services/http";

export default function AddCooperationModal({visible, candidate, onClose, onSuccess}) {
    const [formData, setFormData] = useState({
        project_name: "",
        start_date: "",
        end_date: "",
        role: "",
        salary: "",
        evaluation: "",
        cooperation_result: "良好",
    });
    const [agreementFile, setAgreementFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!visible) return null;

    const handleSubmit = async () => {
        // 验证必填项
        if (!formData.project_name || !formData.start_date) {
            setError("请填写项目名称和开始时间");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            data.append("candidate_id", candidate.id);
            data.append("project_name", formData.project_name);
            data.append("start_date", formData.start_date);
            if (formData.end_date) data.append("end_date", formData.end_date);
            if (formData.role) data.append("role", formData.role);
            if (formData.salary) data.append("salary", formData.salary);
            if (formData.evaluation) data.append("evaluation", formData.evaluation);
            data.append("cooperation_result", formData.cooperation_result);
            if (agreementFile) data.append("agreement_file", agreementFile);

            await http.post("candidates/cooperations/", data, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            // 同时更新候选人的合作状态为"合作"
            await http.patch(`candidates/${candidate.id}/`, {
                cooperation_status: "合作",
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error("添加合作记录失败:", err);
            setError(err.response?.data?.error || "添加失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>📝 添加合作记录</h2>
                    <button style={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div style={styles.candidateInfo}>
                    <span style={styles.infoLabel}>候选人：</span>
                    <span style={styles.infoValue}>{candidate?.name}</span>
                </div>

                <div style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            项目名称 <span style={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="例如：STEAM课程开发"
                            value={formData.project_name}
                            onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                开始时间 <span style={styles.required}>*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>结束时间</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>角色/岗位</label>
                            <input
                                type="text"
                                placeholder="例如：创客教练"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>薪资</label>
                            <input
                                type="text"
                                placeholder="例如：200元/小时"
                                value={formData.salary}
                                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>合作结果</label>
                        <select
                            value={formData.cooperation_result}
                            onChange={(e) => setFormData({...formData, cooperation_result: e.target.value})}
                            style={styles.input}
                        >
                            <option value="优秀">优秀</option>
                            <option value="良好">良好</option>
                            <option value="一般">一般</option>
                            <option value="不再合作">不再合作</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>表现评价</label>
                        <textarea
                            placeholder="描述该候选人在合作中的表现..."
                            value={formData.evaluation}
                            onChange={(e) => setFormData({...formData, evaluation: e.target.value})}
                            style={{...styles.input, minHeight: "80px", resize: "vertical"}}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>兼职协议（PDF/图片）</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setAgreementFile(e.target.files[0])}
                            style={styles.fileInput}
                        />
                        {agreementFile && (
                            <div style={styles.fileName}>✓ 已选择：{agreementFile.name}</div>
                        )}
                    </div>
                </div>

                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>
                        取消
                    </button>
                    <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                        {loading ? "提交中..." : "确认添加"}
                    </button>
                </div>
            </div>
        </div>
    );
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
        borderRadius: "16px",
        width: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 0 40px rgba(212,175,55,0.4)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 30px",
        borderBottom: "1px solid #333",
    },
    title: {
        color: "#d4af37",
        fontSize: "22px",
        margin: 0,
    },
    closeBtn: {
        backgroundColor: "transparent",
        border: "none",
        color: "#d4af37",
        fontSize: "24px",
        cursor: "pointer",
        padding: "0",
        width: "30px",
        height: "30px",
    },
    candidateInfo: {
        padding: "15px 30px",
        backgroundColor: "rgba(212,175,55,0.1)",
        borderBottom: "1px solid #333",
    },
    infoLabel: {
        color: "#aaa",
        fontSize: "14px",
        marginRight: "10px",
    },
    infoValue: {
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
    },
    form: {
        padding: "30px",
    },
    error: {
        backgroundColor: "rgba(255, 77, 79, 0.2)",
        border: "1px solid #ff4d4f",
        color: "#ff4d4f",
        padding: "10px 15px",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "14px",
    },
    formGroup: {
        marginBottom: "20px",
    },
    formRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
    },
    label: {
        display: "block",
        color: "#ccc",
        fontSize: "14px",
        marginBottom: "8px",
    },
    required: {
        color: "#ff4d4f",
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        backgroundColor: "#111",
        border: "1px solid #333",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
        boxSizing: "border-box",
    },
    fileInput: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#111",
        border: "1px solid #333",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
        cursor: "pointer",
    },
    fileName: {
        marginTop: "8px",
        color: "#52c41a",
        fontSize: "13px",
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "15px",
        padding: "20px 30px",
        borderTop: "1px solid #333",
    },
    cancelBtn: {
        backgroundColor: "transparent",
        border: "1px solid #666",
        color: "#fff",
        padding: "10px 24px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
    },
    submitBtn: {
        backgroundColor: "#d4af37",
        border: "none",
        color: "#000",
        padding: "10px 24px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
    },
};

