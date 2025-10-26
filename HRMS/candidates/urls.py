# candidates/urls.py
from django.urls import path
from .views import (
    ResumeUploadView, 
    CandidateListView, 
    CandidateUpdateView,
    CandidateStatsView,
    CandidateExportView,
    CooperationRecordListCreateView,
    CooperationRecordDetailView,
    ToggleFavoriteView,
    MyFavoritesView,
)

urlpatterns = [
    path("upload/", ResumeUploadView.as_view(), name="resume-upload"),
    path("", CandidateListView.as_view(), name="candidate-list"),
    path("<int:pk>/", CandidateUpdateView.as_view(), name="candidate-update"),
    path("stats/", CandidateStatsView.as_view(), name="candidate-stats"),
    path("export/", CandidateExportView.as_view(), name="candidate-export"),
    path("cooperations/", CooperationRecordListCreateView.as_view(), name="cooperation-list-create"),
    path("cooperations/<int:pk>/", CooperationRecordDetailView.as_view(), name="cooperation-detail"),
    path("favorites/toggle/", ToggleFavoriteView.as_view(), name="toggle-favorite"),
    path("favorites/my/", MyFavoritesView.as_view(), name="my-favorites"),
]
