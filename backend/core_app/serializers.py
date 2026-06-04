# WAJIB ADA: Ini yang tadi bikin error karena hilang
from datetime import timedelta

from rest_framework import serializers 
from django.utils import timezone

# Import semua model (tabel) kita
from .models import Certificate, DocumentTemplate, FinalReport, MonthlyReport, Notification, SupervisorEvaluation, User, UtsReport, Vacancy, Application, Placement, WeeklyHuntReport
from django.contrib.auth.password_validation import validate_password

MIN_INTERNSHIP_WORKING_DAYS = 90


def count_working_days(start_date, end_date):
    if not start_date or not end_date or end_date < start_date:
        return 0

    working_days = 0
    current_date = start_date

    while current_date <= end_date:
        if current_date.weekday() < 5:
            working_days += 1
        current_date += timedelta(days=1)

    return working_days

# ==========================================
# 1. SERIALIZER PROFIL MAHASISWA
# ==========================================
class UserProfileSerializer(serializers.ModelSerializer):
    is_microsoft_connected = serializers.SerializerMethodField()

    def get_is_microsoft_connected(self, obj):
        return bool(obj.microsoft_id)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'nim', 'program_studi', 'angkatan', 'gender', 'phone_number', 
            'cv_file', 'portofolio_file', 'bukti_konsul_file', 'sptjm_file',
            'is_staff', 'is_active', 'date_joined', 'password',
            'registration_status', 'registration_rejection_reason',
            'microsoft_email', 'is_microsoft_connected'
        ]
        
        # HAPUS 'username' DARI SINI 👇
        read_only_fields = [
            'email', 'nim', 'program_studi', 'angkatan', 
            'bukti_konsul_file', 'sptjm_file', 'is_staff', 'date_joined',
            'registration_status', 'registration_rejection_reason',
            'microsoft_email', 'is_microsoft_connected'
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
    def validate_expires_at(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError("Tanggal expired lowongan tidak boleh sebelum hari ini.")
        return value

    class Meta:
        model = Vacancy
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        request = self.context.get('request')
        is_student_create = (
            request
            and request.method == 'POST'
            and not getattr(request.user, 'is_staff', False)
        )
        start_date = attrs.get('internship_start_date') or getattr(self.instance, 'internship_start_date', None)
        end_date = attrs.get('internship_end_date') or getattr(self.instance, 'internship_end_date', None)

        if is_student_create:
            errors = {}
            if not start_date:
                errors['internship_start_date'] = 'Tanggal mulai magang wajib diisi.'
            if not end_date:
                errors['internship_end_date'] = 'Tanggal selesai magang wajib diisi.'
            if errors:
                raise serializers.ValidationError(errors)

        if start_date or end_date:
            if not start_date or not end_date:
                raise serializers.ValidationError({
                    'internship_end_date': 'Tanggal mulai dan tanggal selesai magang harus diisi lengkap.',
                })
            if end_date < start_date:
                raise serializers.ValidationError({
                    'internship_end_date': 'Tanggal selesai magang tidak boleh sebelum tanggal mulai.',
                })
            working_days = count_working_days(start_date, end_date)
            if working_days < MIN_INTERNSHIP_WORKING_DAYS:
                raise serializers.ValidationError({
                    'internship_end_date': f'Durasi magang minimal {MIN_INTERNSHIP_WORKING_DAYS} hari kerja. Durasi yang dipilih baru {working_days} hari kerja.',
                })

        return attrs

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
        read_only_fields = [
            'student',
            'status',
            'is_approved',
            'created_at',
            'pending_supervisor_name',
            'pending_supervisor_email',
            'pending_supervisor_phone',
            'supervisor_change_reason',
            'supervisor_change_status',
            'supervisor_change_rejection_reason',
            'supervisor_change_requested_at',
        ]

    def has_active_transfer_source(self):
        request = self.context.get('request')
        student = getattr(self.instance, 'student', None)

        if not student and request:
            student = request.user
            if request.user.is_staff and self.initial_data.get('student'):
                student = User.objects.filter(id=self.initial_data.get('student')).first()

        if not student:
            return False

        active_placements = Placement.objects.filter(
            student=student,
            status='verified',
            is_approved=True,
        )

        if self.instance:
            active_placements = active_placements.exclude(id=self.instance.id)

        return active_placements.exists()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        previous_placement_end_date = attrs.get(
            'previous_placement_end_date',
            getattr(self.instance, 'previous_placement_end_date', None)
        )
        working_days = count_working_days(start_date, end_date)
        is_transfer_duration = previous_placement_end_date and self.has_active_transfer_source()

        if (
            start_date
            and end_date
            and not is_transfer_duration
            and working_days < MIN_INTERNSHIP_WORKING_DAYS
        ):
            raise serializers.ValidationError({
                'error': (
                    f'Durasi magang minimal {MIN_INTERNSHIP_WORKING_DAYS} hari kerja '
                    f'(Senin-Jumat). Durasi yang dipilih saat ini {working_days} hari kerja.'
                )
            })

        return attrs

# ==========================================
# 4. SERIALIZER LAPORAN BULANAN
# ==========================================
FIRST_MONTH_REPORT_REQUIRED_FIELDS = {
    'company_profile': 'Profil Perusahaan',
    'work_environment': 'Suasana Lingkungan & Budaya Kerja',
    'useful_courses': 'Materi Kuliah yang Berguna',
    'new_skills': 'Skill Baru yang Dipelajari',
}


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

    def validate(self, attrs):
        attrs = super().validate(attrs)
        request = self.context.get('request')
        student = getattr(self.instance, 'student', None) or getattr(request, 'user', None)
        placement = attrs.get('placement') or getattr(self.instance, 'placement', None)

        if not student or not getattr(student, 'is_authenticated', False) or not placement:
            return attrs

        existing_reports = MonthlyReport.objects.filter(student=student, placement=placement)
        if self.instance:
            existing_reports = existing_reports.exclude(id=self.instance.id)

        if existing_reports.exists():
            return attrs

        missing_fields = []
        for field_name, label in FIRST_MONTH_REPORT_REQUIRED_FIELDS.items():
            value = attrs.get(field_name, getattr(self.instance, field_name, ''))
            if value is None or str(value).strip() == '':
                missing_fields.append(label)

        if missing_fields:
            missing_text = ', '.join(missing_fields)
            raise serializers.ValidationError({
                'error': f'Laporan pertama untuk tempat magang ini wajib melengkapi {missing_text}.'
            })

        return attrs

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
