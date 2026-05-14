from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from core_app.views import (
    CertificateViewSet, DocumentTemplateView, FinalReportViewSet, 
    MonthlyReportViewSet, SupervisorEvaluationViewSet, WeeklyHuntReportViewSet, 
    register_student, UserViewSet, VacancyViewSet, ApplicationViewSet, 
    PlacementViewSet, send_weekly_reminders, get_industry_data, send_report_reminders,
    UtsReportViewSet, NotificationViewSet,
    ChangePasswordView # <--- 1. TAMBAHAN PENTING UNTUK FITUR GANTI PASSWORD
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'vacancies', VacancyViewSet) 
router.register(r'applications', ApplicationViewSet, basename='application') 
router.register(r'placements', PlacementViewSet, basename='placement') 
router.register(r'monthly-reports', MonthlyReportViewSet, basename='monthlyreport')
router.register(r'uts-reports', UtsReportViewSet, basename='utsreport')
router.register(r'final-reports', FinalReportViewSet, basename='finalreport')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'evaluations', SupervisorEvaluationViewSet, basename='evaluation')
router.register(r'weekly-reports', WeeklyHuntReportViewSet, basename='weekly-report')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- 1. TARUH CUSTOM URL DI SINI (SEBELUM ROUTER) ---
    path('api/users/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # --- 2. BARU MASUKKAN ROUTER ---
    path('api/', include(router.urls)),
    
    # --- URL LAINNYA TETAP DI BAWAH ---
    path('api/register/', register_student, name='register'),
    path('api/login/', obtain_auth_token, name='login'),
    path('api/templates/', DocumentTemplateView.as_view(), name='document-templates'),
    
    path('api/send-reminders/', send_weekly_reminders, name='send_reminders'),
    path('api/send-report-reminders/', send_report_reminders, name='send_report_reminders'),
    path('api/industries/', get_industry_data, name='industry-data'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
