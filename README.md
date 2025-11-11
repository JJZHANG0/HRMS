# STEMHUB HRMS - 人力资源管理系统

一个专为教育行业设计的现代化人力资源管理系统，集成AI简历分析、人才库管理、合作记录追踪等功能。

## 🎯 核心功能

### 1. 👤 人才库管理
- AI智能简历解析（基于通义千问）
- 全局搜索（姓名、院校、专业、电话、邮箱、城市、工作经历）
- 高级筛选（匹配度、合作状态、学历、城市、年龄）
- 实时评分和状态编辑
- 个性化收藏功能
- 关键词高亮显示
- 分页浏览（20条/页）

### 2. ⭐ 我的收藏
- 用户独立收藏夹
- 快速访问重点候选人
- 数据完全隔离

### 3. 📄 合作记录管理
- 合作信息录入
- 兼职协议上传
- 薪资和项目管理
- 合作评价记录

### 4. 📁 档案管理
- 兼职协议集中管理
- 在线查看和下载
- 自动关联合作记录

### 5. ⚙️ 系统设置
- 数据统计看板
- Excel数据导出
- 密码管理
- 系统配置（超级管理员）

### 6. 🏠 数据看板
- 实时统计指标
- 城市分布 TOP5
- 评分分布可视化
- 专业分布 TOP5

---

## 🛠️ 技术栈

### 后端
- **框架**: Django 5.2.7 + Django REST Framework 3.16.1
- **数据库**: SQLite (开发) / MySQL (生产)
- **AI服务**: 阿里云通义千问 qwen-plus
- **PDF解析**: pdfminer-six
- **认证**: JWT (djangorestframework-simplejwt)
- **Excel**: openpyxl

### 前端
- **框架**: React 18
- **路由**: React Router v6
- **HTTP**: Axios
- **UI**: 自定义黑金配色

---

## 📦 安装部署

### 1. 克隆项目

```bash
git clone https://github.com/JJZHANG0/HRMS.git
cd HRMS
```

### 2. 后端配置

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 进入后端目录
cd HRMS

# 执行数据库迁移
python manage.py makemigrations
python manage.py migrate

# 创建超级管理员
python manage.py createsuperuser

# 启动后端服务器
python manage.py runserver
```

### 3. 前端配置

```bash
# 新开一个终端，进入前端目录
cd hrms-frontend

# 安装依赖
npm install

# 启动前端开发服务器
npm start
```

### 4. 使用 Docker Compose 部署（推荐）

```bash
# 回到项目根目录
cd /path/to/HRMS

# 创建生产环境变量
cp .env.example .env   # 如果存在；否则手动创建

# 构建并启动容器
docker-compose up -d --build

# 查看容器状态
docker-compose ps
```

默认会启动以下服务：
- `db`：MySQL 8.0
- `backend`：Django + Gunicorn
- `frontend`：React 构建产物 + Nginx
- `proxy`：统一反向代理，转发 `/api/` 到后端

如需关闭服务：

```bash
docker-compose down
```

### 5. 访问系统

- **前端**: http://localhost:3000
- **后端**: http://127.0.0.1:8000
- **Admin**: http://127.0.0.1:8000/admin

---

## 🔧 配置说明

### AI API配置

在 `HRMS/candidates/views.py` 中配置通义千问API密钥：

```python
API_KEY = "your-api-key-here"
```

### 上传密码

默认简历上传验证密码：`STEMHUB2025!`

可在系统设置中修改（需超级管理员权限）

---

## 📖 使用指南

### 简历上传

1. 点击顶部"➕ 添加新简历"
2. 输入管理员密码
3. 选择PDF文件（最多10份）
4. AI自动分析并录入系统

### 人才筛选

1. 进入人才库管理
2. 使用全局搜索或高级筛选
3. 查看匹配的候选人
4. 点击收藏按钮标记重点

### 添加合作

1. 在人才库找到候选人
2. 点击合作状态标签
3. 选择"合作"
4. 填写项目信息并上传协议

### 数据导出

1. 进入系统设置
2. 点击"导出Excel"
3. 获取完整候选人数据

---

## 🎨 系统特色

- 🎨 **黑金配色**：专业优雅的UI设计
- ⚡ **实时响应**：所有操作即时反馈
- 🔍 **智能搜索**：7个字段全局检索
- 📊 **数据可视化**：图表直观展示
- 🤖 **AI加持**：自动解析简历
- 🔐 **权限管理**：超级管理员机制
- 💾 **数据隔离**：用户收藏独立

---

## 📂 项目结构

```
STEMHUB_DEV_PROJECTS/
├── HRMS/                    # Django后端
│   ├── accounts/           # 用户认证
│   ├── candidates/         # 候选人管理
│   ├── HRMS/              # 项目配置
│   ├── media/             # 文件存储
│   └── manage.py
├── hrms-frontend/          # React前端
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面组件
│   │   └── services/      # API服务
│   └── package.json
└── requirements.txt        # Python依赖
```

---

## 🔑 默认账户

创建超级管理员后使用该账户登录。

普通用户可通过注册页面注册。

---

## 📊 数据模型

### Candidate（候选人）
- 基础信息、联系方式、学历信息
- Base城市、工作经历
- 合作状态、匹配度评分

### CooperationRecord（合作记录）
- 项目信息、时间、薪资
- 合作评价、协议文件

### Favorite（收藏）
- 用户-候选人关联
- 收藏时间记录

---

## 🚀 系统要求

- Python 3.8+
- Node.js 14+
- MySQL 5.7+ (可选，开发环境使用SQLite)

---

## 📝 开发团队

**思铺教育 STEMHUB**

---

## 📄 License

Copyright © 2025 STEMHUB. All Rights Reserved.

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 📞 技术支持

如遇问题，请提交 Issue 或联系技术团队。

---

## 🎉 更新日志

### v1.0.0 (2025-10-26)
- ✅ 人才库管理系统
- ✅ AI简历解析
- ✅ 合作记录管理
- ✅ 档案管理
- ✅ 数据看板
- ✅ 收藏功能
- ✅ 高级筛选

---

**Built with ❤️ by STEMHUB Team**

