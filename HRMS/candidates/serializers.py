# candidates/serializers.py
from rest_framework import serializers
from .models import Candidate, CooperationRecord, Favorite

class CandidateSerializer(serializers.ModelSerializer):
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidate
        fields = "__all__"
    
    def get_is_favorited(self, obj):
        """检查当前用户是否收藏了该候选人"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, candidate=obj).exists()
        return False


class CooperationRecordSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    
    class Meta:
        model = CooperationRecord
        fields = "__all__"


class FavoriteSerializer(serializers.ModelSerializer):
    candidate = CandidateSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = "__all__"
