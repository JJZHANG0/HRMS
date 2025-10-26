# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ChangePasswordView, CheckUserPermissionView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),       # 登录
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # 刷新 token
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),  # 修改密码
    path('check-permission/', CheckUserPermissionView.as_view(), name='check-permission'),  # 检查权限
]
