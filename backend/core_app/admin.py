from django.contrib import admin
from .models import SupervisorEvaluation, Certificate, User, Vacancy, Application, Placement, MonthlyReport, FinalReport, Notification

admin.site.register(User)
admin.site.register(Vacancy)
admin.site.register(Application)
admin.site.register(Placement)
admin.site.register(MonthlyReport)
admin.site.register(FinalReport) 
admin.site.register(Certificate)
admin.site.register(SupervisorEvaluation)
admin.site.register(Notification)
