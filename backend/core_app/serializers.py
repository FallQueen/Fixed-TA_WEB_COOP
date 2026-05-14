# WAJIB ADA: Ini yang tadi bikin error karena hilang
from rest_framework import serializers 

# Import semua model (tabel) kita
from .models import Certificate, DocumentTemplate, FinalReport, MonthlyReport, Notification, SupervisorEvaluation, User, UtsReport, Vacancy, Application, Placement, WeeklyHuntReport
from django.contrib.auth.password_validation import validate_password

# ==========================================
# 1. SERIALIZER PROFIL MAHASISWA
# ==========================================
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'nim', 'program_studi', 'angkatan', 'gender', 'phone_number', 
            'cv_file', 'portofolio_file', 'bukti_konsul_file', 'sptjm_file',
            'is_staff', 'is_active', 'password'
        ]
        
        # HAPUS 'username' DARI SINI 👇
        read_only_fields = [
            'email', 'nim', 'program_studi', 'angkatan', 
            'bukti_konsul_file', 'sptjm_file', 'is_staff'
        ]
        
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
            validated_data.pop('password')
        return super().update(instance, validated_data)
    
# ==========================================
# 2. SERIALIZERS FITUR LOWONGAN & LAMARAN
# ==========================================
class VacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacancy
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('student', 'applied_at')

# ==========================================
# 3. SERIALIZER FITUR LAPOR MAGANG
# ==========================================
class PlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Placement
        fields = '__all__'
        # [UPDATE] Kunci field ini biar nggak bisa dimanipulasi dari sisi client
        read_only_fields = ['student', 'status', 'is_approved', 'created_at']

# ==========================================
# 4. SERIALIZER LAPORAN BULANAN
# ==========================================
class MonthlyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyReport
        fields = '__all__'
        read_only_fields = ['student', 'submitted_at']
        
        # [TAMBAHAN BARU] 
        # Membuat field ini menjadi opsional agar tidak Error 400 
        # saat mahasiswa mengumpulkan laporan bulan ke-2 dst.
        extra_kwargs = {
            'company_profile': {'required': False, 'allow_blank': True, 'allow_null': True},
            'work_environment': {'required': False, 'allow_blank': True, 'allow_null': True},
            'useful_courses': {'required': False, 'allow_blank': True, 'allow_null': True},
            'new_skills': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

# ==========================================
# 5. SERIALIZER LAPORAN AKHIR 
# ==========================================
class FinalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalReport
        fields = '__all__'
        read_only_fields = ['student', 'submitted_at']

# ==========================================
# 6. SERIALIZER SERTIFIKAT
# ==========================================
class CertificateReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = '__all__'
        depth = 1 

class CertificateWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = '__all__'

# ==========================================
# 7. SERIALIZER EVALUASI SUPERVISOR
# ==========================================
class SupervisorEvaluationReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupervisorEvaluation
        fields = '__all__'
        depth = 2

class SupervisorEvaluationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupervisorEvaluation
        fields = '__all__'

# ==========================================
# 8. LAIN-LAIN
# ==========================================
class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = ['id', 'uts_template', 'uas_template', 'updated_at']

class WeeklyHuntReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyHuntReport
        fields = '__all__'
        read_only_fields = ['student', 'submitted_at']

class UtsReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtsReport
        fields = '__all__'
        read_only_fields = ('student', 'submitted_at')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('student', 'created_at')

# ubah pw admin
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        # Memastikan password baru memenuhi standar keamanan Django
        validate_password(value)
        return value
