# accounts/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer


# ---------------------------------------------------------
# 注册视图 RegisterView
# ---------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        # ✅ 验证失败时返回详细错误信息
        if not serializer.is_valid():
            print("❌ 注册验证失败：", serializer.errors)  # 调试输出
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "注册成功",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED
        )


# ---------------------------------------------------------
# 修改密码视图 ChangePasswordView
# ---------------------------------------------------------
class ChangePasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not all([old_password, new_password]):
            return Response(
                {'error': '请提供旧密码和新密码'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 简单实现：使用默认用户或从请求中获取
        # 生产环境应该从JWT token中获取当前用户
        try:
            # 暂时使用第一个用户进行演示
            user = User.objects.first()
            
            if not user:
                return Response(
                    {'error': '用户不存在'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # 验证旧密码
            if not user.check_password(old_password):
                return Response(
                    {'error': '旧密码错误'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 设置新密码
            user.set_password(new_password)
            user.save()

            return Response({'message': '密码修改成功'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------------------------------------------------
# 检查用户权限视图 CheckUserPermissionView
# ---------------------------------------------------------
class CheckUserPermissionView(APIView):
    """
    检查当前用户是否是超级管理员
    """
    permission_classes = [AllowAny]

    def get(self, request):
        username = request.GET.get('username')
        
        if not username:
            return Response(
                {'error': '未提供用户名'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            return Response({
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff,
                'username': user.username,
            })
        except User.DoesNotExist:
            return Response(
                {'error': '用户不存在'},
                status=status.HTTP_404_NOT_FOUND
            )
