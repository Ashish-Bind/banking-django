from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_notifications),
    path('<int:notification_id>/read/', views.mark_notification_read),
    path('mark-all-read/', views.mark_all_read),
]