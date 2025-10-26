from django.db import models
from django.contrib.auth.models import User

# ---------------------------------------------------------
# 候选人主表 Candidate
# ---------------------------------------------------------
class Candidate(models.Model):
    # 基础信息
    name = models.CharField(max_length=50, verbose_name="姓名")
    gender = models.CharField(max_length=10, null=True, blank=True, verbose_name="性别")
    age = models.IntegerField(null=True, blank=True, verbose_name="年龄")

    # 联系方式
    phone = models.CharField(max_length=20, unique=True, verbose_name="电话")
    email = models.EmailField(unique=True, verbose_name="邮箱")

    # 学历与院校信息
    education = models.CharField(
        max_length=50,
        choices=[
            ('本科', '本科'),
            ('硕士', '硕士'),
            ('博士', '博士'),
        ],
        verbose_name="学历"
    )
    university = models.CharField(max_length=100, null=True, blank=True, verbose_name="毕业院校")
    major = models.CharField(max_length=100, null=True, blank=True, verbose_name="专业")
    graduation_date = models.DateField(null=True, blank=True, verbose_name="毕业时间")

    # 地理信息
    base = models.CharField(max_length=50, default='远程', verbose_name="所在地区")

    # 工作经历
    experience = models.TextField(null=True, blank=True, verbose_name="工作经历")

    # 状态与匹配度
    cooperation_status = models.CharField(
        max_length=20,
        choices=[
            ('未合作', '未合作'),
            ('合作', '合作'),
            ('合作较差', '合作较差'),
        ],
        default='未合作',  # ✅ 首次录入自动设为“未合作”
        verbose_name="合作状态"
    )
    match_level = models.CharField(
        max_length=5,
        choices=[
            ('A', 'A - 有经验，较匹配'),
            ('B', 'B - 无经验，项目经验丰富'),
            ('C', 'C - 有经验，匹配度一般'),
            ('D', 'D - 无经验，匹配度一般'),
            ('E', 'E - 匹配度低'),
        ],
        default='D',
        verbose_name="简历匹配度"
    )

    # ✅ 新增字段：保存原始 PDF 文件
    resume_file = models.FileField(upload_to="resumes/", null=True, blank=True, verbose_name="简历文件")

    # 系统字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    def __str__(self):
        return f"{self.name} ({self.match_level})"

    class Meta:
        verbose_name = "候选人"
        verbose_name_plural = "候选人库"



# ---------------------------------------------------------
# 候选人合作记录表 CooperationRecord
# ---------------------------------------------------------
class CooperationRecord(models.Model):
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='cooperations',
        verbose_name="候选人"
    )
    project_name = models.CharField(max_length=100, verbose_name="项目名称/岗位")
    start_date = models.DateField(verbose_name="开始时间")
    end_date = models.DateField(null=True, blank=True, verbose_name="结束时间")
    role = models.CharField(max_length=100, null=True, blank=True, verbose_name="角色/岗位")
    salary = models.CharField(max_length=100, null=True, blank=True, verbose_name="薪资", default='')
    evaluation = models.TextField(null=True, blank=True, verbose_name="表现评价", default='')
    cooperation_result = models.CharField(
        max_length=50,
        choices=[
            ('优秀', '优秀'),
            ('良好', '良好'),
            ('一般', '一般'),
            ('不再合作', '不再合作'),
        ],
        default='良好',
        verbose_name="合作结果"
    )
    agreement_file = models.FileField(upload_to="agreements/", null=True, blank=True, verbose_name="兼职协议")
    created_at = models.DateTimeField(auto_now_add=True, null=True, verbose_name="创建时间")

    def __str__(self):
        return f"{self.candidate.name} - {self.project_name}"

    class Meta:
        verbose_name = "合作记录"
        verbose_name_plural = "合作记录"
        ordering = ['-start_date']


# ---------------------------------------------------------
# 候选人档案文件表 Document
# ---------------------------------------------------------
class Document(models.Model):
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="候选人"
    )
    file_name = models.CharField(max_length=200, verbose_name="文件名")
    file_type = models.CharField(
        max_length=50,
        choices=[
            ('labor_contract', '劳动合同'),
            ('intern_agreement', '实习/兼职协议'),
            ('nda', '保密协议'),
            ('resume', '简历'),
            ('other', '其他'),
        ],
        verbose_name="文件类型"
    )
    file = models.FileField(upload_to='documents/', verbose_name="文件")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="上传时间")
    remarks = models.TextField(null=True, blank=True, verbose_name="备注")

    def __str__(self):
        return f"{self.candidate.name} - {self.file_name}"

    class Meta:
        verbose_name = "档案文件"
        verbose_name_plural = "档案文件"


# ---------------------------------------------------------
# 用户收藏表 Favorite
# ---------------------------------------------------------
class Favorite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name="用户"
    )
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name="候选人"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="收藏时间")

    def __str__(self):
        return f"{self.user.username} - {self.candidate.name}"

    class Meta:
        verbose_name = "收藏"
        verbose_name_plural = "收藏"
        unique_together = ['user', 'candidate']  # 同一用户不能重复收藏
        ordering = ['-created_at']
