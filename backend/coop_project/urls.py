from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from core_app.views import (
    CertificateViewSet, DocumentTemplateView, FinalReportViewSet, 
    MonthlyReportViewSet, SupervisorEvaluationViewSet, WeeklyHuntReportViewSet, 
    register_student, UserViewSet, VacancyViewSet, ApplicationViewSet, 
    PlacementViewSet, send_weekly_reminders, get_industry_data, send_report_reminders,
    send_completion_reminders, UtsReportViewSet, NotificationViewSet,
    ChangePasswordView, confirm_password_reset, login_user, microsoft_sso_login, microsoft_sso_callback,
    microsoft_sso_admin_link, microsoft_sso_admin_unlink
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
    path('api/auth/password-reset/confirm/', confirm_password_reset, name='confirm-password-reset'),
    path('api/auth/microsoft/login/', microsoft_sso_login, name='microsoft-sso-login'),
    path('api/auth/microsoft/callback/', microsoft_sso_callback, name='microsoft-sso-callback'),
    path('api/auth/microsoft/admin-link/', microsoft_sso_admin_link, name='microsoft-sso-admin-link'),
    path('api/auth/microsoft/admin-unlink/', microsoft_sso_admin_unlink, name='microsoft-sso-admin-unlink'),
    
    # --- 2. BARU MASUKKAN ROUTER ---
    path('api/', include(router.urls)),
    
    # --- URL LAINNYA TETAP DI BAWAH ---
    path('api/register/', register_student, name='register'),
    path('api/login/', login_user, name='login'),
    path('api/templates/', DocumentTemplateView.as_view(), name='document-templates'),
    
    path('api/send-reminders/', send_weekly_reminders, name='send_reminders'),
    path('api/send-report-reminders/', send_report_reminders, name='send_report_reminders'),
    path('api/send-completion-reminders/', send_completion_reminders, name='send_completion_reminders'),
    path('api/industries/', get_industry_data, name='industry-data'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
